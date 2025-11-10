import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { useRecipientsStore } from '@/stores/recipientsStore';
import { Transaction } from '@/types/database';
import { Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getTransactionsByUser } = useTransactionsStore();
  const { recipients } = useRecipientsStore();
  const [loading, setLoading] = useState(false);

  const transactions = user ? getTransactionsByUser(user.id) : [];

  const loadTransactions = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#a3e635" />;
      case 'processing':
        return <Clock size={20} color="#fbbf24" />;
      case 'failed':
        return <XCircle size={20} color="#ef4444" />;
      case 'cancelled':
        return <AlertCircle size={20} color="#999" />;
      default:
        return <Clock size={20} color="#666" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#a3e635';
      case 'processing':
        return '#fbbf24';
      case 'failed':
        return '#ef4444';
      case 'cancelled':
        return '#999';
      default:
        return '#666';
    }
  };

  const completedTransactions = transactions.filter((t) => t.status === 'completed');
  const totalSent = completedTransactions.reduce((sum, t) => sum + t.send_amount, 0);
  const totalFees = completedTransactions.reduce((sum, t) => sum + t.fee_amount, 0);
  const averageAmount = completedTransactions.length > 0 ? totalSent / completedTransactions.length : 0;

  const getLast7DaysData = () => {
    const days = [];
    const amounts = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTransactions = completedTransactions.filter((t) => {
        const tDate = new Date(t.created_at).toISOString().split('T')[0];
        return tDate === dateStr;
      });

      const total = dayTransactions.reduce((sum, t) => sum + t.send_amount, 0);

      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      amounts.push(total);
    }

    return { days, amounts };
  };

  const getCurrencyDistribution = () => {
    const currencyTotals: { [key: string]: number } = {};

    completedTransactions.forEach((t) => {
      currencyTotals[t.to_currency] = (currencyTotals[t.to_currency] || 0) + t.receive_amount;
    });

    const sortedCurrencies = Object.entries(currencyTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return sortedCurrencies.map(([currency, total]) => ({
      name: currency,
      amount: total,
      color: ['#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#3f6212'][
        sortedCurrencies.findIndex(([c]) => c === currency) % 5
      ],
      legendFontColor: '#fff',
      legendFontSize: 12,
    }));
  };

  const { days, amounts } = getLast7DaysData();
  const currencyData = getCurrencyDistribution();

  const chartConfig = {
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(163, 230, 53, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(153, 153, 153, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#a3e635',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#333',
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTransactions} />
        }
      >
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#a3e635" />
            </View>
            <Text style={styles.statValue}>${totalSent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Sent</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <DollarSign size={20} color="#fbbf24" />
            </View>
            <Text style={styles.statValue}>${averageAmount.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingDown size={20} color="#ef4444" />
            </View>
            <Text style={styles.statValue}>${totalFees.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Fees</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <CheckCircle size={20} color="#a3e635" />
            </View>
            <Text style={styles.statValue}>{completedTransactions.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {completedTransactions.length > 0 && (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Last 7 Days Activity</Text>
              <Text style={styles.chartSubtitle}>Transaction volume by day</Text>
              <LineChart
                data={{
                  labels: days,
                  datasets: [
                    {
                      data: amounts.length > 0 ? amounts : [0],
                    },
                  ],
                }}
                width={screenWidth - 72}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                withDots={true}
                withShadow={false}
              />
            </View>

            {currencyData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Currency Distribution</Text>
                <Text style={styles.chartSubtitle}>Top currencies received</Text>
                <PieChart
                  data={currencyData}
                  width={screenWidth - 72}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  center={[10, 0]}
                  absolute
                  style={styles.chart}
                />
              </View>
            )}

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Monthly Overview</Text>
              <Text style={styles.chartSubtitle}>Recent transactions comparison</Text>
              <BarChart
                data={{
                  labels: days,
                  datasets: [
                    {
                      data: amounts.length > 0 ? amounts : [0],
                    },
                  ],
                }}
                width={screenWidth - 72}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                withInnerLines={false}
                showBarTops={false}
                fromZero={true}
                withHorizontalLabels={true}
              />
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={48} color="#333" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Send money to see your transaction history
              </Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                onPress={() =>
                  router.push(`/transaction-detail?id=${transaction.id}`)
                }
              >
                <View style={styles.transactionLeft}>
                  <View style={styles.statusIconContainer}>
                    {getStatusIcon(transaction.status)}
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionRecipient}>
                      {recipients.find(r => r.id === transaction.recipient_id)?.full_name || 'Unknown'}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.created_at)} at{' '}
                      {formatTime(transaction.created_at)}
                    </Text>
                    <View style={styles.statusBadge}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(transaction.status) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(transaction.status) },
                        ]}
                      >
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>
                    -{transaction.send_amount.toFixed(2)} {transaction.from_currency}
                  </Text>
                  <Text style={styles.transactionReceive}>
                    +{transaction.receive_amount.toFixed(2)}{' '}
                    {transaction.to_currency}
                  </Text>
                  <Text style={styles.transactionRef}>
                    {transaction.reference_number}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  chartCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    gap: 4,
  },
  transactionRecipient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  transactionReceive: {
    fontSize: 14,
    color: '#a3e635',
  },
  transactionRef: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
});
