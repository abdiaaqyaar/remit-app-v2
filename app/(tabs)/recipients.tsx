import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, User, Globe } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipientsStore } from '@/stores/recipientsStore';
import { Recipient } from '@/types/database';

export default function RecipientsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getRecipientsByUser } = useRecipientsStore();
  const [loading, setLoading] = useState(false);

  const recipients = user ? getRecipientsByUser(user.id) : [];

  const loadRecipients = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipients</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-recipient')}
        >
          <Plus size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRecipients} />
        }
      >
        {recipients.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={64} color="#333" />
            <Text style={styles.emptyTitle}>No recipients yet</Text>
            <Text style={styles.emptySubtitle}>
              Add recipients to send them money quickly
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/add-recipient')}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Add recipient</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.recipientsGrid}>
            {recipients.map((recipient) => (
              <TouchableOpacity
                key={recipient.id}
                style={styles.recipientCard}
                onPress={() =>
                  router.push(`/recipient-detail?id=${recipient.id}`)
                }
              >
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientInitials}>
                    {recipient.full_name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.recipientName} numberOfLines={1}>
                  {recipient.full_name}
                </Text>
                <View style={styles.recipientCountry}>
                  <Globe size={14} color="#999" />
                  <Text style={styles.recipientCountryText}>
                    {recipient.country}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#a3e635',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a3e635',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  recipientsGrid: {
    padding: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  recipientCard: {
    width: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 56,
    height: 56,
    backgroundColor: '#a3e635',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recipientInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  recipientCountry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipientCountryText: {
    fontSize: 12,
    color: '#999',
  },
});
