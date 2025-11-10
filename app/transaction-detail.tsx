import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share2, Download, CheckCircle, Clock } from 'lucide-react-native';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { useRecipientsStore } from '@/stores/recipientsStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getCurrencyByCode } from '@/services/exchange-service';
import { generateAndSharePDF } from '@/utils/pdfGenerator';
import { Alert } from 'react-native';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getTransactionById } = useTransactionsStore();
  const { recipients } = useRecipientsStore();
  const { user } = useAuth();

  const transaction = getTransactionById(params.id as string);
  const recipient = recipients.find((r) => r.id === transaction?.recipient_id);

  if (!transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Transaction not found</Text>
        </View>
      </View>
    );
  }

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle size={48} color="#a3e635" />;
      case 'processing':
        return <Clock size={48} color="#fbbf24" />;
      default:
        return <Clock size={48} color="#666" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return '#a3e635';
      case 'processing':
        return '#fbbf24';
      case 'failed':
        return '#ef4444';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
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

  const handleShare = async () => {
    if (!user || !transaction) return;

    try {
      await generateAndSharePDF({
        transaction,
        recipient,
        userName: user.full_name || user.email,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert(
        'Error',
        'Failed to generate PDF receipt. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleViewReceipt = () => {
    router.push({
      pathname: '/receipt',
      params: { id: transaction.id },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share2 size={20} color="#a3e635" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>{getStatusIcon()}</View>
          <Text
            style={[styles.statusText, { color: getStatusColor() }]}
          >
            {transaction.status.toUpperCase()}
          </Text>
          <Text style={styles.statusDate}>
            {formatDate(transaction.created_at)} at {formatTime(transaction.created_at)}
          </Text>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>You sent</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(transaction.send_amount, transaction.from_currency)}
          </Text>
          <View style={styles.amountDivider} />
          <Text style={styles.amountLabel}>Recipient receives</Text>
          <Text style={styles.amountReceive}>
            {formatCurrency(transaction.receive_amount, transaction.to_currency)}
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference Number</Text>
            <Text style={styles.detailValue}>{transaction.reference_number}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Exchange Rate</Text>
            <Text style={styles.detailValue}>
              1 {transaction.from_currency} = {transaction.exchange_rate.toFixed(4)}{' '}
              {transaction.to_currency}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fee</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(transaction.fee_amount, transaction.from_currency)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Paid</Text>
            <Text style={[styles.detailValue, styles.detailValueBold]}>
              {formatCurrency(transaction.total_amount, transaction.from_currency)}
            </Text>
          </View>

          {transaction.delivery_method && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Method</Text>
              <Text style={styles.detailValue}>
                {transaction.delivery_method.replace('_', ' ')}
              </Text>
            </View>
          )}

          {transaction.estimated_arrival && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Arrival</Text>
              <Text style={styles.detailValue}>
                {formatDate(transaction.estimated_arrival)}
              </Text>
            </View>
          )}
        </View>

        {recipient && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Recipient Information</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{recipient.full_name}</Text>
            </View>

            {recipient.email && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{recipient.email}</Text>
              </View>
            )}

            {recipient.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{recipient.phone}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Country</Text>
              <Text style={styles.detailValue}>{recipient.country}</Text>
            </View>

            {recipient.bank_name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bank</Text>
                <Text style={styles.detailValue}>{recipient.bank_name}</Text>
              </View>
            )}

            {recipient.account_number && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Number</Text>
                <Text style={styles.detailValue}>{recipient.account_number}</Text>
              </View>
            )}
          </View>
        )}

        {transaction.status === 'completed' && (
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={handleViewReceipt}
          >
            <Download size={20} color="#000" />
            <Text style={styles.receiptButtonText}>View Receipt</Text>
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIcon: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusDate: {
    fontSize: 14,
    color: '#999',
  },
  amountCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  amountDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  amountReceive: {
    fontSize: 32,
    fontWeight: '700',
    color: '#a3e635',
  },
  detailsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'right',
    flex: 1,
  },
  detailValueBold: {
    fontWeight: '700',
    fontSize: 16,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a3e635',
    borderRadius: 16,
    padding: 18,
    gap: 8,
    marginTop: 8,
  },
  receiptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
});
