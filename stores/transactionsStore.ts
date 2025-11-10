import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types/database';

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'reference_number'>) => Promise<string>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  getTransactionsByUser: (userId: string) => Transaction[];
  getTransactionById: (id: string) => Transaction | undefined;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      loading: false,

      addTransaction: async (transaction) => {
        set({ loading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const referenceNumber = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
          const newTransaction: Transaction = {
            ...transaction,
            id: `tx_${Date.now()}`,
            reference_number: referenceNumber,
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
            loading: false,
          }));

          return newTransaction.id;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      updateTransaction: async (id, updates) => {
        set({ loading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));

          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
            loading: false,
          }));
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      getTransactionsByUser: (userId) => {
        return get().transactions.filter((t) => t.user_id === userId);
      },

      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },
    }),
    {
      name: 'transactions-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
