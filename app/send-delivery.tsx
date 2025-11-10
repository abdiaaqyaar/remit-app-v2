import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Building2, Smartphone, MapPin } from 'lucide-react-native';

interface DeliveryOption {
  id: string;
  type: 'bank_transfer' | 'mobile_money' | 'cash_pickup';
  name: string;
  description: string;
  fee: string;
  arrival: string;
  icon: React.ReactNode;
}

export default function SendDeliveryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedDelivery, setSelectedDelivery] = useState<string>('bank_transfer');

  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Bank Deposit',
      description: 'Direct deposit to bank account',
      fee: 'Low fee',
      arrival: 'Within 1-3 business days',
      icon: <Building2 size={24} color="#a3e635" />,
    },
    {
      id: 'mobile_money',
      type: 'mobile_money',
      name: 'MPesa / Airtel Money',
      description: 'Instant mobile money transfer',
      fee: 'Standard fee',
      arrival: 'Instant delivery',
      icon: <Smartphone size={24} color="#a3e635" />,
    },
    {
      id: 'cash_pickup',
      type: 'cash_pickup',
      name: 'Cash Pickup',
      description: 'Pick up cash at agent location',
      fee: 'Higher fee',
      arrival: 'Ready within minutes',
      icon: <MapPin size={24} color="#a3e635" />,
    },
  ];

  const handleContinue = () => {
    router.push({
      pathname: '/send-payment',
      params: {
        ...params,
        deliveryMethod: selectedDelivery,
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
        <Text style={styles.title}>How should they receive it?</Text>
        <Text style={styles.subtitle}>
          Choose delivery method for {params.toCurrency}
        </Text>

        <View style={styles.optionsContainer}>
          {deliveryOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedDelivery === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedDelivery(option.id)}
            >
              <View style={styles.optionIcon}>{option.icon}</View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionName}>{option.name}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
                <View style={styles.optionMeta}>
                  <Text style={styles.optionFee}>{option.fee}</Text>
                  <Text style={styles.optionArrival}>{option.arrival}</Text>
                </View>
              </View>
              {selectedDelivery === option.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            The delivery method affects how quickly your recipient receives the money
            and the fees you'll pay.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#a3e635',
  },
  optionIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
    gap: 4,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  optionDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  optionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  optionFee: {
    fontSize: 12,
    color: '#a3e635',
    fontWeight: '600',
  },
  optionArrival: {
    fontSize: 12,
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
  infoBox: {
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#a3e635',
    lineHeight: 20,
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
