import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Building2, CreditCard, Wallet } from 'lucide-react-native';
import { formatCurrency } from '@/services/exchange-service';

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  fee: string;
  arrival: string;
  icon: React.ReactNode;
}

export default function SendPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<string>('card');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'Credit or Debit Card',
      name: 'Card Payment',
      fee: `${params.fee} ${params.fromCurrency} fee`,
      arrival: 'Instant processing',
      icon: <CreditCard size={24} color="#a3e635" />,
    },
    {
      id: 'bank',
      type: 'Bank Account',
      name: 'Bank Transfer',
      fee: `${params.fee} ${params.fromCurrency} fee`,
      arrival: 'Process within 1-2 days',
      icon: <Building2 size={24} color="#a3e635" />,
    },
    {
      id: 'wallet',
      type: 'Digital Wallet',
      name: 'E-Wallet',
      fee: `${(parseFloat(params.fee as string) + 1).toFixed(2)} ${params.fromCurrency} fee`,
      arrival: 'Instant processing',
      icon: <Wallet size={24} color="#a3e635" />,
    },
  ];

  const handleContinue = () => {
    router.push({
      pathname: '/send-recipient',
      params: {
        ...params,
        paymentMethod: selectedMethod,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Choose how to pay</Text>

        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodIcon}>{method.icon}</View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodType}>{method.type}</Text>
                <Text style={styles.methodFee}>{method.fee}</Text>
                <Text style={styles.methodArrival}>{method.arrival}</Text>
              </View>
              {selectedMethod === method.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.unavailable}>
          <Text style={styles.unavailableTitle}>Unavailable methods</Text>
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableMethod}>Debit card</Text>
            <Text style={styles.unavailableReason}>
              Sorry, we can't support card payments for this currency route,
              please choose another payment method.
            </Text>
            <Text style={styles.unavailableFee}>
              6.99 {params.fromCurrency} fee
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
    marginBottom: 24,
  },
  methodsContainer: {
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: '#a3e635',
  },
  methodIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
    gap: 4,
  },
  methodType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  methodFee: {
    fontSize: 14,
    color: '#a3e635',
  },
  methodArrival: {
    fontSize: 14,
    color: '#999',
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
  unavailable: {
    marginTop: 32,
  },
  unavailableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  unavailableCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    opacity: 0.5,
  },
  unavailableMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  unavailableReason: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 8,
  },
  unavailableFee: {
    fontSize: 14,
    color: '#666',
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
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
