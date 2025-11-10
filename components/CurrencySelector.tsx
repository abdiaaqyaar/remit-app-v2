import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Currency } from '@/types/database';
import { CURRENCIES } from '@/services/exchange-service';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onSelect: (currency: string) => void;
  label?: string;
}

export function CurrencySelector({ selectedCurrency, onSelect, label }: CurrencySelectorProps) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const currency = CURRENCIES.find((c) => c.code === selectedCurrency);

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.flag}>{currency?.flag_emoji}</Text>
          <Text style={styles.code}>{currency?.code}</Text>
        </View>
        <ChevronDown size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.currencyItem}
                  onPress={() => {
                    onSelect(item.code);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyFlag}>{item.flag_emoji}</Text>
                    <View>
                      <Text style={styles.currencyCode}>{item.code}</Text>
                      <Text style={styles.currencyName}>{item.name}</Text>
                    </View>
                  </View>
                  {selectedCurrency === item.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: {
    fontSize: 24,
  },
  code: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    color: '#a3e635',
    fontSize: 16,
    fontWeight: '600',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyFlag: {
    fontSize: 32,
  },
  currencyCode: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    color: '#999',
    fontSize: 14,
  },
  checkmark: {
    color: '#a3e635',
    fontSize: 24,
    fontWeight: '700',
  },
});
