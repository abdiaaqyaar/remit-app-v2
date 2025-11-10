import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipientsStore } from '@/stores/recipientsStore';
import { CurrencySelector } from '@/components/CurrencySelector';

export default function AddRecipientScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { addRecipient } = useRecipientsStore();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState((params.currency as string) || 'USD');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'bank' | 'mobile' | 'cash'>('bank');

  const handleSave = async () => {
    if (!fullName || !country) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (deliveryMethod === 'bank' && !accountNumber) {
      Alert.alert('Error', 'Please provide account number for bank transfer');
      return;
    }

    if (deliveryMethod === 'mobile' && (!phone || !mobileMoneyProvider)) {
      Alert.alert('Error', 'Please provide phone and mobile money provider');
      return;
    }

    setLoading(true);
    try {
      await addRecipient({
        user_id: user!.id,
        full_name: fullName,
        email: email || undefined,
        phone: phone || undefined,
        country,
        currency,
        account_number: deliveryMethod === 'bank' ? accountNumber : undefined,
        bank_name: deliveryMethod === 'bank' ? (bankName || undefined) : undefined,
        mobile_money_provider: deliveryMethod === 'mobile' ? mobileMoneyProvider : undefined,
      });

      Alert.alert('Success', 'Recipient added successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add recipient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add recipient</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#666"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+1234567890"
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country *</Text>
            <TextInput
              style={styles.input}
              placeholder="Kenya"
              placeholderTextColor="#666"
              value={country}
              onChangeText={setCountry}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Currency *</Text>
            <CurrencySelector selectedCurrency={currency} onSelect={setCurrency} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Method *</Text>
            <View style={styles.deliveryOptions}>
              <TouchableOpacity
                style={[styles.deliveryOption, deliveryMethod === 'bank' && styles.deliveryOptionSelected]}
                onPress={() => setDeliveryMethod('bank')}
              >
                <Text style={[styles.deliveryOptionText, deliveryMethod === 'bank' && styles.deliveryOptionTextSelected]}>
                  Bank Deposit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deliveryOption, deliveryMethod === 'mobile' && styles.deliveryOptionSelected]}
                onPress={() => setDeliveryMethod('mobile')}
              >
                <Text style={[styles.deliveryOptionText, deliveryMethod === 'mobile' && styles.deliveryOptionTextSelected]}>
                  MPesa/Airtel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deliveryOption, deliveryMethod === 'cash' && styles.deliveryOptionSelected]}
                onPress={() => setDeliveryMethod('cash')}
              >
                <Text style={[styles.deliveryOptionText, deliveryMethod === 'cash' && styles.deliveryOptionTextSelected]}>
                  Cash Pickup
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {deliveryMethod === 'bank' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234567890"
                  placeholderTextColor="#666"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bank Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Bank of America"
                  placeholderTextColor="#666"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>
            </>
          )}

          {deliveryMethod === 'mobile' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Money Provider *</Text>
              <TextInput
                style={styles.input}
                placeholder="MPesa, Airtel Money, etc."
                placeholderTextColor="#666"
                value={mobileMoneyProvider}
                onChangeText={setMobileMoneyProvider}
              />
            </View>
          )}

          {deliveryMethod === 'cash' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Recipient will pick up cash at a local agent. No additional details required.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save recipient'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: '#a3e635',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  deliveryOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  deliveryOption: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  deliveryOptionSelected: {
    borderColor: '#a3e635',
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
  },
  deliveryOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  deliveryOptionTextSelected: {
    color: '#a3e635',
  },
  infoBox: {
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#a3e635',
    lineHeight: 20,
  },
});
