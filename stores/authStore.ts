import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  country?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  kyc_verified: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      signUp: async (email: string, password: string, fullName: string) => {
        set({ loading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const newUser: User = {
            id: `user_${Date.now()}`,
            email,
            full_name: fullName,
            kyc_verified: false,
            created_at: new Date().toISOString(),
          };

          const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');

          if (users.find((u: any) => u.email === email)) {
            throw new Error('User already exists');
          }

          users.push({ ...newUser, password });
          await AsyncStorage.setItem('users', JSON.stringify(users));

          set({ user: newUser, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signIn: async (email: string, password: string) => {
        set({ loading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
          const user = users.find(
            (u: any) => u.email === email && u.password === password
          );

          if (!user) {
            throw new Error('Invalid email or password');
          }

          const { password: _, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        const updatedUser = { ...user, ...updates };
        set({ user: updatedUser });

        const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          await AsyncStorage.setItem('users', JSON.stringify(users));
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
