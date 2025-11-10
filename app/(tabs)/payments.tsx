import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { useRecipientsStore } from '@/stores/recipientsStore';
import { Transaction } from '@/types/database';
import { Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react-native';

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

  const totalSent = transactions.reduce(
    (sum, t) => sum + (t.status === 'completed' ? t.send_amount : 0),
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTransactions} />
        }
      >
        <View style={styles.statsCard}>
          <View style={styles.statsIcon}>
            <TrendingUp size={24} color="#a3e635" />
          </View>
          <View style={styles.statsContent}>
            <Text style={styles.statsLabel}>Total Sent</Text>
            <Text style={styles.statsValue}>${totalSent.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Transactions</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={48} color="#333" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Send money to see your transaction history
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
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
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  statsIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContent: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
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
