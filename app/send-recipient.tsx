import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipientsStore } from '@/stores/recipientsStore';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { Recipient } from '@/types/database';

export default function SendRecipientScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { getRecipientsByCurrency } = useRecipientsStore();
  const { addTransaction } = useTransactionsStore();
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const recipients = user
    ? getRecipientsByCurrency(user.id, params.toCurrency as string)
    : [];

  const handleContinue = async () => {
    if (!selectedRecipient) {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }

    setLoading(true);
    try {
      const estimatedArrival = new Date();
      estimatedArrival.setDate(estimatedArrival.getDate() + 3);

      await addTransaction({
        user_id: user!.id,
        recipient_id: selectedRecipient,
        from_currency: params.fromCurrency as string,
        to_currency: params.toCurrency as string,
        send_amount: parseFloat(params.sendAmount as string),
        receive_amount: parseFloat(params.receiveAmount as string),
        exchange_rate: parseFloat(params.rate as string),
        fee_amount: parseFloat(params.fee as string),
        total_amount:
          parseFloat(params.sendAmount as string) + parseFloat(params.fee as string),
        status: 'processing',
        delivery_method: params.paymentMethod as any,
        estimated_arrival: estimatedArrival.toISOString(),
      });

      Alert.alert(
        'Success',
        'Your transfer has been initiated!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Select recipient</Text>
        <Text style={styles.subtitle}>
          Who should receive {params.receiveAmount} {params.toCurrency}?
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: '/add-recipient',
              params: { currency: params.toCurrency },
            })
          }
        >
          <View style={styles.addIconContainer}>
            <Plus size={24} color="#a3e635" />
          </View>
          <Text style={styles.addButtonText}>Add new recipient</Text>
        </TouchableOpacity>

        <View style={styles.recipientsContainer}>
          {recipients.length === 0 ? (
            <View style={styles.emptyState}>
              <User size={48} color="#333" />
              <Text style={styles.emptyText}>No recipients yet</Text>
              <Text style={styles.emptySubtext}>
                Add a recipient to send money
              </Text>
            </View>
          ) : (
            recipients.map((recipient) => (
              <TouchableOpacity
                key={recipient.id}
                style={[
                  styles.recipientCard,
                  selectedRecipient === recipient.id && styles.recipientCardSelected,
                ]}
                onPress={() => setSelectedRecipient(recipient.id)}
              >
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientInitials}>
                    {recipient.full_name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{recipient.full_name}</Text>
                  <Text style={styles.recipientDetails}>
                    {recipient.bank_name || recipient.mobile_money_provider}
                  </Text>
                  <Text style={styles.recipientAccount}>
                    {recipient.account_number}
                  </Text>
                </View>
                {selectedRecipient === recipient.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedRecipient || loading) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRecipient || loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Processing...' : 'Done'}
          </Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  addIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a3e635',
  },
  recipientsContainer: {
    gap: 16,
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
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recipientCardSelected: {
    borderColor: '#a3e635',
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#a3e635',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recipientInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  recipientInfo: {
    flex: 1,
    gap: 4,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  recipientDetails: {
    fontSize: 14,
    color: '#999',
  },
  recipientAccount: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    width: 24,
    height: 24,
    backgroundColor: '#a3e635',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: '#a3e635',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
