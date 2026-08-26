import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/LoadingSkeleton';
import { notificationApi } from '@ar-multiventures/api';
import type { Notification } from '@ar-multiventures/types';

export function CustomerNotificationsScreen({ onNavigate }: { onNavigate?: (screen: string, params?: any) => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications({ isRead: unreadOnly ? false : undefined });
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
    loadNotifications();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notifications"
        subtitle="Real-time Dispatch, Weighbridge & Invoice Alerts"
        onBack={() => onNavigate?.('tabs')}
        rightAction={
          <TouchableOpacity activeOpacity={0.7} onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark Read</Text>
          </TouchableOpacity>
        }
        showBack={true}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You are all caught up! Order and delivery updates will appear here."
          />
        ) : (
          notifications.map((n) => (
            <AppCard key={n.id} style={n.isRead ? styles.notifCard : [styles.notifCard, styles.unreadCard] as any}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifIcon}>
                  {n.type === 'delivery' ? '🚚' :
                   n.type === 'payment' ? '💳' :
                   n.type === 'order' ? '📋' :
                   n.type === 'alert' ? '⚠️' : '🔔'}
                </Text>
                <View style={styles.notifTextCol}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notifTitle, !n.isRead && styles.unreadTitle]}>{n.title}</Text>
                    {!n.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMessage}>{n.message}</Text>
                  <Text style={styles.notifTime}>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            </AppCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
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
  markAllBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  notifCard: {
    padding: Spacing.md,
  },
  unreadCard: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  notifIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  notifTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  unreadTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
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
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
