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
import { AppCard, SectionHeader } from '../../components/common/AppCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { QuantityText } from '../../components/common/MoneyText';
import { EmptyState } from '../../components/common/LoadingSkeleton';
import { deliveryApi } from '@ar-multiventures/api';
import type { OrderFulfillmentSummary, DeliveryTripRecord } from '@ar-multiventures/types';

export function CustomerDeliveriesScreen({ onNavigate }: { onNavigate?: (screen: string, params?: any) => void }) {
  const [fulfillment, setFulfillment] = useState<OrderFulfillmentSummary | null>(null);
  const [trips, setTrips] = useState<DeliveryTripRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDeliveryData = async () => {
    try {
      const [fuls, tripList] = await Promise.all([
        deliveryApi.getCustomerFulfillments(),
        deliveryApi.getTrips(),
      ]);
      if (fuls.length > 0) setFulfillment(fuls[0]);
      setTrips(tripList);
    } catch (err) {
      console.error('Failed to load customer deliveries:', err);
    }
  };

  useEffect(() => {
    loadDeliveryData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDeliveryData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Order Fulfillment Progress Header */}
        {fulfillment && (
          <AppCard style={styles.fulfillmentCard}>
            <View style={styles.fulHeader}>
              <View>
                <Text style={styles.fulRef}>{fulfillment.referenceNumber}</Text>
                <Text style={styles.fulDest}>{fulfillment.destinationName}</Text>
              </View>
              <StatusBadge status={fulfillment.status} size="sm" />
            </View>

            <ProgressBar
              progress={fulfillment.fulfillmentPercent}
              showPercent
              label={`Delivered ${fulfillment.deliveredQuantity}T of ${fulfillment.orderedQuantity}T`}
            />

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{fulfillment.deliveredQuantity}T</Text>
                <Text style={styles.statLbl}>Delivered</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{fulfillment.dispatchedQuantity}T</Text>
                <Text style={styles.statLbl}>In Transit</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{fulfillment.remainingQuantity}T</Text>
                <Text style={styles.statLbl}>Remaining</Text>
              </View>
            </View>
          </AppCard>
        )}

        {/* Trips List */}
        <SectionHeader title="Operational Trips" subtitle="Live dispatch, transit & verified deliveries" />

        {trips.length === 0 ? (
          <EmptyState
            title="No Active Trips"
            description="Your scheduled delivery trips will appear here once trucks are assigned."
          />
        ) : (
          trips.map((trip) => (
            <AppCard
              key={trip.id}
              onPress={() => onNavigate?.('delivery_detail', { tripId: trip.id })}
              style={styles.tripCard}
            >
              <View style={styles.tripHeader}>
                <View>
                  <Text style={styles.tripNumber}>{trip.tripNumber}</Text>
                  <Text style={styles.truckText}>🚛 {trip.truckRegistration || 'Heavy Tipper 30T'}</Text>
                </View>
                <StatusBadge status={trip.status} size="sm" />
              </View>

              <View style={styles.tripBody}>
                <Text style={styles.driverText}>Driver: {trip.driverName || 'Assigned Driver'}</Text>
                <Text style={styles.siteText}>Destination: {trip.destinationName}</Text>
              </View>

              <View style={styles.tripFooter}>
                <Text style={styles.weightText}>
                  Scale Net: {trip.weighbridge?.netWeightTonnes || trip.plannedQuantityTonnes} Tonnes
                </Text>
                {trip.pod ? (
                  <Text style={styles.podBadge}>✓ Signed POD Available</Text>
                ) : (
                  <Text style={styles.trackingText}>Operational Tracking →</Text>
                )}
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  fulfillmentCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  fulHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  fulRef: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  fulDest: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  statLbl: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tripCard: {
    marginBottom: Spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tripNumber: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  truckText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.primaryDark,
    marginTop: 2,
  },
  tripBody: {
    marginVertical: Spacing.xs,
  },
  driverText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textPrimary,
  },
  siteText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing.xs,
  },
  weightText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.secondaryDark,
  },
  podBadge: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
  },
  trackingText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
