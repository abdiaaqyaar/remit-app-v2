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
import { Send, TrendingUp, Clock, CheckCircle } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { getTransactionsByUser } = useTransactionsStore();
  const { recipients } = useRecipientsStore();
  const [loading, setLoading] = useState(false);

  const transactions = user ? getTransactionsByUser(user.id).slice(0, 10) : [];

  const loadTransactions = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
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

      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => router.push('/send')}
      >
        <Send size={24} color="#000" />
        <Text style={styles.sendButtonText}>Send money</Text>
      </TouchableOpacity>

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
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a3e635',
    marginHorizontal: 24,
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
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
