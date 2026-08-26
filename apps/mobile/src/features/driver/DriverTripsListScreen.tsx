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
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/LoadingSkeleton';
import { deliveryApi } from '@ar-multiventures/api';
import type { DeliveryTripRecord } from '@ar-multiventures/types';

export function DriverTripsListScreen({ onNavigate }: { onNavigate?: (screen: string, params?: any) => void }) {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');
  const [trips, setTrips] = useState<DeliveryTripRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = async () => {
    try {
      const data = await deliveryApi.getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Failed to load driver trips:', err);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const filteredTrips = trips.filter((t) => {
    if (activeTab === 'ACTIVE') return t.status !== 'DELIVERED' && t.status !== 'CANCELLED';
    if (activeTab === 'COMPLETED') return t.status === 'DELIVERED';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tabHeader}>
        {(['ACTIVE', 'COMPLETED', 'ALL'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'ACTIVE' ? 'Active Missions' : tab === 'COMPLETED' ? 'Delivered' : 'All Missions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {filteredTrips.length === 0 ? (
          <EmptyState
            title="No Missions Found"
            description="You don't have any delivery missions in this queue."
          />
        ) : (
          filteredTrips.map((trip) => (
            <AppCard
              key={trip.id}
              onPress={() => onNavigate?.('driver_active_trip', { tripId: trip.id })}
              style={styles.tripCard}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.tripNo}>{trip.tripNumber}</Text>
                <StatusBadge status={trip.status} size="sm" />
              </View>

              <Text style={styles.materialName}>{trip.materialName}</Text>
              <Text style={styles.destName}>{trip.destinationName}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.tonnesText}>
                  {trip.weighbridge?.netWeightTonnes || trip.plannedQuantityTonnes} Tonnes
                </Text>
                <Text style={styles.actionText}>View Mission Steps →</Text>
              </View>
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
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  activeTabBtn: {
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primaryDark,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  tripCard: {
    backgroundColor: Colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tripNo: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  materialName: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  destName: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  tonnesText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  actionText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
