import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipient } from '@/types/database';

interface RecipientsState {
  recipients: Recipient[];
  loading: boolean;
  addRecipient: (recipient: Omit<Recipient, 'id' | 'created_at'>) => Promise<void>;
  updateRecipient: (id: string, updates: Partial<Recipient>) => Promise<void>;
  deleteRecipient: (id: string) => Promise<void>;
  getRecipientsByUser: (userId: string) => Recipient[];
  getRecipientsByCurrency: (userId: string, currency: string) => Recipient[];
}

export const useRecipientsStore = create<RecipientsState>()(
  persist(
    (set, get) => ({
      recipients: [],
      loading: false,

      addRecipient: async (recipient) => {
        set({ loading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));

          const newRecipient: Recipient = {
            ...recipient,
            id: `recipient_${Date.now()}`,
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            recipients: [...state.recipients, newRecipient],
            loading: false,
          }));
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      updateRecipient: async (id, updates) => {
        set({ loading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));

          set((state) => ({
            recipients: state.recipients.map((r) =>
              r.id === id ? { ...r, ...updates } : r
            ),
            loading: false,
          }));
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      deleteRecipient: async (id) => {
        set({ loading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));

          set((state) => ({
            recipients: state.recipients.filter((r) => r.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      getRecipientsByUser: (userId) => {
        return get().recipients.filter((r) => r.user_id === userId);
      },

      getRecipientsByCurrency: (userId, currency) => {
        return get().recipients.filter(
          (r) => r.user_id === userId && r.currency === currency
        );
      },
    }),
    {
      name: 'recipients-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
