import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  currency: string;
  placeholder?: string;
  editable?: boolean;
}

export function AmountInput({
  value,
  onChangeText,
  currency,
  placeholder = '0.00',
  editable = true,
}: AmountInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#444"
        keyboardType="decimal-pad"
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    fontSize: 48,
    fontWeight: '700',
    color: '#a3e635',
    textAlign: 'right',
  },
  inputDisabled: {
    color: '#a3e635',
  },
});
