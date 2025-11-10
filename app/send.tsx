import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';
import { CurrencySelector } from '@/components/CurrencySelector';
import { AmountInput } from '@/components/AmountInput';
import { calculateExchange, formatCurrency } from '@/services/exchange-service';

export default function SendMoneyScreen() {
  const router = useRouter();
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('KES');
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('0.00');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [fee, setFee] = useState(0);

  useEffect(() => {
    if (sendAmount && parseFloat(sendAmount) > 0) {
      const result = calculateExchange(
        parseFloat(sendAmount),
        fromCurrency,
        toCurrency
      );
      setReceiveAmount(result.receiveAmount.toFixed(2));
      setExchangeRate(result.rate);
      setFee(result.fee);
    } else {
      setReceiveAmount('0.00');
      setExchangeRate(0);
      setFee(0);
    }
  }, [sendAmount, fromCurrency, toCurrency]);

  const handleContinue = () => {
    const amount = parseFloat(sendAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    router.push({
      pathname: '/send-payment',
      params: {
        fromCurrency,
        toCurrency,
        sendAmount,
        receiveAmount,
        rate: exchangeRate.toString(),
        fee: fee.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.rateInfo}>
          <View style={styles.lockIcon}>
            <Text style={styles.lockText}>🔒</Text>
          </View>
          <Text style={styles.rateText}>
            1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>You send exactly</Text>
          <View style={styles.amountRow}>
            <CurrencySelector
              selectedCurrency={fromCurrency}
              onSelect={setFromCurrency}
            />
            <AmountInput
              value={sendAmount}
              onChangeText={setSendAmount}
              currency={fromCurrency}
              placeholder="0.00"
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>Recipient gets</Text>
          <View style={styles.amountRow}>
            <CurrencySelector
              selectedCurrency={toCurrency}
              onSelect={setToCurrency}
            />
            <View style={styles.receiveAmountContainer}>
              <Text style={styles.receiveAmount}>{receiveAmount}</Text>
            </View>
          </View>
        </View>

        {parseFloat(sendAmount) > 0 && (
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Send amount</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(parseFloat(sendAmount), fromCurrency)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Fee</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(fee, fromCurrency)}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelBold}>Total</Text>
              <Text style={styles.breakdownValueBold}>
                {formatCurrency(parseFloat(sendAmount) + fee, fromCurrency)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Info size={20} color="#a3e635" />
          <Text style={styles.infoText}>
            Real exchange rate with no hidden fees. What you see is what you pay.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!sendAmount || parseFloat(sendAmount) <= 0) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!sendAmount || parseFloat(sendAmount) <= 0}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Get help</Text>
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
    backgroundColor: '#000',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    gap: 8,
  },
  lockIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: {
    fontSize: 12,
  },
  rateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  receiveAmountContainer: {
    flex: 1,
  },
  receiveAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#a3e635',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 24,
  },
  breakdown: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    color: '#999',
    fontSize: 14,
  },
  breakdownValue: {
    color: '#fff',
    fontSize: 14,
  },
  breakdownLabelBold: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  breakdownValueBold: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    gap: 12,
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
  helpButton: {
    alignItems: 'center',
    padding: 12,
  },
  helpButtonText: {
    color: '#a3e635',
    fontSize: 14,
    fontWeight: '600',
  },
});
