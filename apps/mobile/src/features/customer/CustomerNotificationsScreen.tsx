import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/LoadingSkeleton';
import { notificationApi } from '@ar-multiventures/api';
import type { NotificationRecord } from '@ar-multiventures/types';

export function CustomerNotificationsScreen({ onNavigate }: { onNavigate?: (screen: string, params?: any) => void }) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications({ unreadOnly });
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [unreadOnly]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    loadNotifications();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.filterPills}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setUnreadOnly(false)}
            style={[styles.pill, !unreadOnly && styles.activePill]}
          >
            <Text style={[styles.pillText, !unreadOnly && styles.activePillText]}>All Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setUnreadOnly(true)}
            style={[styles.pill, unreadOnly && styles.activePill]}
          >
            <Text style={[styles.pillText, unreadOnly && styles.activePillText]}>Unread Only</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={handleMarkAllRead} style={styles.markReadBtn}>
          <Text style={styles.markReadText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You are fully caught up with all aggregate orders, dispatch waybills, and payment receipts."
          />
        ) : (
          notifications.map((n) => (
            <AppCard
              key={n.id}
              style={[styles.notifCard, !n.isRead && styles.unreadCard]}
              onPress={async () => {
                if (!n.isRead) {
                  await notificationApi.markAsRead(n.id);
                  loadNotifications();
                }
                if (n.entityType === 'requisition') onNavigate?.('order_detail', { id: n.entityId });
                if (n.entityType === 'trip') onNavigate?.('delivery_detail', { tripId: n.entityId });
              }}
            >
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                {!n.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifMessage}>{n.message}</Text>
              <Text style={styles.notifDate}>{n.createdAt}</Text>
            </AppCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterPills: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondaryLight,
  },
  activePill: {
    backgroundColor: Colors.primaryLight,
  },
  pillText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  activePillText: {
    color: Colors.primaryDark,
    fontWeight: Typography.weights.bold,
  },
  markReadBtn: {
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.sm,
  },
  notifCard: {
    backgroundColor: Colors.surface,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  notifMessage: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  notifDate: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
