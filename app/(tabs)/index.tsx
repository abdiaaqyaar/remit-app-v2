import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { useRecipientsStore } from '@/stores/recipientsStore';
import { Transaction } from '@/types/database';
import { Send, TrendingUp, Clock, CheckCircle, Info } from 'lucide-react-native';
import { getExchangeRate, formatCurrency } from '@/services/exchange-service';
import { CurrencySelector } from '@/components/CurrencySelector';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { getTransactionsByUser } = useTransactionsStore();
  const { recipients } = useRecipientsStore();
  const [loading, setLoading] = useState(false);

  const transactions = user ? getTransactionsByUser(user.id).slice(0, 10) : [];
  const [sendAmount, setSendAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('KES');
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    const rate = getExchangeRate(fromCurrency, toCurrency);
    setExchangeRate(rate);
  }, [fromCurrency, toCurrency]);

  const receiveAmount = parseFloat(sendAmount || '0') * exchangeRate;

  const loadTransactions = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  const handleQuickSend = () => {
    router.push({
      pathname: '/send',
      params: {
        fromCurrency,
        toCurrency,
        amount: sendAmount,
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#a3e635" />;
      case 'processing':
        return <Clock size={16} color="#fbbf24" />;
      default:
        return <Clock size={16} color="#666" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadTransactions} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calculatorCard}>
        <View style={styles.calculatorSection}>
          <Text style={styles.calculatorLabel}>You send exactly</Text>
          <View style={styles.calculatorRow}>
            <TouchableOpacity style={styles.currencyButton}>
              <CurrencySelector
                selectedCurrency={fromCurrency}
                onSelect={setFromCurrency}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.calculatorInput}
              value={sendAmount}
              onChangeText={setSendAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.calculatorDivider} />

        <View style={styles.calculatorSection}>
          <Text style={styles.calculatorLabel}>Recipient gets</Text>
          <View style={styles.calculatorRow}>
            <TouchableOpacity style={styles.currencyButton}>
              <CurrencySelector
                selectedCurrency={toCurrency}
                onSelect={setToCurrency}
              />
            </TouchableOpacity>
            <Text style={styles.calculatorReceive}>
              {receiveAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.rateInfo}>
          <Info size={16} color="#a3e635" />
          <Text style={styles.rateInfoText}>
            Real exchange rate with no hidden fees. What you see is what you pay.
          </Text>
        </View>

        <TouchableOpacity style={styles.quickSendButton} onPress={handleQuickSend}>
          <Text style={styles.quickSendButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/send')}
        >
          <View style={styles.actionIcon}>
            <Send size={24} color="#a3e635" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Send money</Text>
            <Text style={styles.actionSubtitle}>You send</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/send-recipient')}
        >
          <View style={styles.actionIcon}>
            <TrendingUp size={24} color="#a3e635" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Quick transfer</Text>
            <Text style={styles.actionSubtitle}>To saved recipient</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <TrendingUp size={20} color="#a3e635" />
          </View>
          <Text style={styles.statValue}>{transactions.length}</Text>
          <Text style={styles.statLabel}>Total Transfers</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <CheckCircle size={20} color="#a3e635" />
          </View>
          <Text style={styles.statValue}>
            {transactions.filter((t) => t.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transfers</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Send size={48} color="#333" />
            <Text style={styles.emptyStateText}>No transfers yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Send money to get started
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
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionRecipient}>
                  {recipients.find(r => r.id === transaction.recipient_id)?.full_name || 'Unknown'}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.created_at)}
                </Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>
                  {transaction.send_amount.toFixed(2)} {transaction.from_currency}
                </Text>
                <View style={styles.transactionStatus}>
                  {getStatusIcon(transaction.status)}
                  <Text
                    style={[
                      styles.transactionStatusText,
                      transaction.status === 'completed' && styles.statusCompleted,
                      transaction.status === 'processing' && styles.statusProcessing,
                    ]}
                  >
                    {transaction.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 14,
    color: '#999',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  logoutText: {
    color: '#a3e635',
    fontSize: 14,
    fontWeight: '600',
  },
  calculatorCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  calculatorSection: {
    marginBottom: 16,
  },
  calculatorLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  calculatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currencyButton: {
    minWidth: 120,
  },
  calculatorInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    padding: 0,
    textAlign: 'right',
  },
  calculatorReceive: {
    flex: 1,
    fontSize: 48,
    fontWeight: '700',
    color: '#a3e635',
    textAlign: 'right',
  },
  calculatorDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 16,
  },
  rateInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#a3e635',
    lineHeight: 18,
  },
  quickSendButton: {
    backgroundColor: '#a3e635',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  quickSendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
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
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionRecipient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionStatusText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  statusCompleted: {
    color: '#a3e635',
  },
  statusProcessing: {
    color: '#fbbf24',
  },
});
