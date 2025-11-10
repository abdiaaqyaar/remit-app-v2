import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share2, Download, CheckCircle } from 'lucide-react-native';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { useRecipientsStore } from '@/stores/recipientsStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/services/exchange-service';
import { generateAndSharePDF } from '@/utils/pdfGenerator';

export default function ReceiptScreen() {
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
        <Text style={styles.emptyText}>Receipt not found</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    const receiptText = `
━━━━━━━━━━━━━━━━━━━━━━
   PAYMENT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━

Reference: ${transaction.reference_number}

From: ${user?.full_name}
To: ${recipient?.full_name}

━━━━━━━━━━━━━━━━━━━━━━
TRANSACTION DETAILS
━━━━━━━━━━━━━━━━━━━━━━

Amount Sent: ${formatCurrency(transaction.send_amount, transaction.from_currency)}
Exchange Rate: 1 ${transaction.from_currency} = ${transaction.exchange_rate.toFixed(4)} ${transaction.to_currency}
Fee: ${formatCurrency(transaction.fee_amount, transaction.from_currency)}
Total Paid: ${formatCurrency(transaction.total_amount, transaction.from_currency)}

Amount Received: ${formatCurrency(transaction.receive_amount, transaction.to_currency)}

━━━━━━━━━━━━━━━━━━━━━━
DELIVERY DETAILS
━━━━━━━━━━━━━━━━━━━━━━

Method: ${transaction.delivery_method?.replace('_', ' ') || 'Bank Transfer'}
Status: ${transaction.status.toUpperCase()}
Date: ${formatDate(transaction.created_at)}
${transaction.estimated_arrival ? `Est. Arrival: ${formatDate(transaction.estimated_arrival)}` : ''}

━━━━━━━━━━━━━━━━━━━━━━
RECIPIENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━

Name: ${recipient?.full_name}
Country: ${recipient?.country}
${recipient?.bank_name ? `Bank: ${recipient.bank_name}` : ''}
${recipient?.account_number ? `Account: ${recipient.account_number}` : ''}
${recipient?.mobile_money_provider ? `Provider: ${recipient.mobile_money_provider}` : ''}

━━━━━━━━━━━━━━━━━━━━━━

Thank you for your transfer!
    `.trim();

    try {
      await Share.share({
        message: receiptText,
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  const handleDownload = async () => {
    if (!user || !transaction) return;

    try {
      await generateAndSharePDF({
        transaction,
        recipient,
        userName: user.full_name || user.email,
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to generate PDF receipt. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Share2 size={20} color="#a3e635" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownload} style={styles.iconButton}>
            <Download size={20} color="#a3e635" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.receipt}>
          <View style={styles.receiptHeader}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color="#a3e635" />
            </View>
            <Text style={styles.receiptTitle}>Payment Successful!</Text>
            <Text style={styles.receiptSubtitle}>
              Your money is on its way
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptSection}>
            <Text style={styles.referenceLabel}>Reference Number</Text>
            <Text style={styles.referenceValue}>
              {transaction.reference_number}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptSection}>
            <Text style={styles.sectionTitle}>Amount Details</Text>

            <View style={styles.receiptRow}>
              <Text style={styles.rowLabel}>You sent</Text>
              <Text style={styles.rowValue}>
                {formatCurrency(transaction.send_amount, transaction.from_currency)}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.rowLabel}>Exchange rate</Text>
              <Text style={styles.rowValue}>
                1 {transaction.from_currency} = {transaction.exchange_rate.toFixed(4)}{' '}
                {transaction.to_currency}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.rowLabel}>Transfer fee</Text>
              <Text style={styles.rowValue}>
                {formatCurrency(transaction.fee_amount, transaction.from_currency)}
              </Text>
            </View>

            <View style={styles.totalDivider} />

            <View style={styles.receiptRow}>
              <Text style={styles.totalLabel}>Total paid</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(transaction.total_amount, transaction.from_currency)}
              </Text>
            </View>

            <View style={styles.receiveBox}>
              <Text style={styles.receiveLabel}>Recipient receives</Text>
              <Text style={styles.receiveValue}>
                {formatCurrency(transaction.receive_amount, transaction.to_currency)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptSection}>
            <Text style={styles.sectionTitle}>Recipient</Text>

            <View style={styles.receiptRow}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>{recipient?.full_name}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.rowLabel}>Country</Text>
              <Text style={styles.rowValue}>{recipient?.country}</Text>
            </View>

            {recipient?.bank_name && (
              <View style={styles.receiptRow}>
                <Text style={styles.rowLabel}>Bank</Text>
                <Text style={styles.rowValue}>{recipient.bank_name}</Text>
              </View>
            )}

            {recipient?.mobile_money_provider && (
              <View style={styles.receiptRow}>
                <Text style={styles.rowLabel}>Provider</Text>
                <Text style={styles.rowValue}>{recipient.mobile_money_provider}</Text>
              </View>
            )}

            {recipient?.account_number && (
              <View style={styles.receiptRow}>
                <Text style={styles.rowLabel}>Account</Text>
                <Text style={styles.rowValue}>{recipient.account_number}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptSection}>
            <Text style={styles.sectionTitle}>Delivery</Text>

            <View style={styles.receiptRow}>
              <Text style={styles.rowLabel}>Method</Text>
              <Text style={styles.rowValue}>
                {transaction.delivery_method?.replace('_', ' ') || 'Bank Transfer'}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.rowLabel}>Date</Text>
              <Text style={styles.rowValue}>
                {formatDate(transaction.created_at)}
              </Text>
            </View>

            {transaction.estimated_arrival && (
              <View style={styles.receiptRow}>
                <Text style={styles.rowLabel}>Expected arrival</Text>
                <Text style={styles.rowValue}>
                  {formatDate(transaction.estimated_arrival)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.receiptFooter}>
            <Text style={styles.footerText}>
              Keep this receipt for your records
            </Text>
          </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  receipt: {
    backgroundColor: '#1a1a1a',
    margin: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  receiptHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 20,
  },
  receiptTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  receiptSubtitle: {
    fontSize: 16,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
  },
  receiptSection: {
    padding: 24,
  },
  referenceLabel: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  referenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#a3e635',
    textAlign: 'center',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'right',
    flex: 1,
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  receiveBox: {
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  receiveLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  receiveValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#a3e635',
  },
  receiptFooter: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
  },
});
