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
    <View style={styles.container}>
      <ScreenHeader
        title="Delivery Tracking"
        subtitle="Active Fleet Dispatches & Digital Scale Tickets"
        showBack={false}
      />

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
              <StatusBadge status={fulfillment.fulfillmentPercent === 100 ? 'DELIVERED' : 'IN_TRANSIT'} size="sm" />
            </View>

            <ProgressBar
              progress={fulfillment.fulfillmentPercent}
              showPercent
              label={`Delivered ${fulfillment.deliveredQuantity}T of ${fulfillment.orderedQuantity}T`}
            />

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{fulfillment.deliveredQuantity}T</Text>
                <Text style={styles.statLbl}>Delivered</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{fulfillment.dispatchedQuantity}T</Text>
                <Text style={styles.statLbl}>In Transit</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{(fulfillment as any).remainingQuantity ?? fulfillment.orderedQuantity - fulfillment.deliveredQuantity}T</Text>
                <Text style={styles.statLbl}>Remaining</Text>
              </View>
            </View>
          </AppCard>
        )}

        <SectionHeader title="Active Delivery Trips & Waybills" />

        {trips.length === 0 ? (
          <EmptyState
            title="No Active Delivery Trips"
            description="When your orders are loaded at the quarry and dispatched, real-time waybills will appear here."
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
                  <Text style={styles.truckText}>
                    🚛 {(trip as any).truck?.registrationNumber || trip.truckId || 'Sinotruk HOWO 371'}
                  </Text>
                </View>
                <StatusBadge status={trip.status} />
              </View>

              <View style={styles.tripDivider} />

              <View style={styles.tripDetails}>
                <View>
                  <Text style={styles.tripLabel}>Driver</Text>
                  <Text style={styles.tripVal}>{(trip as any).driver?.fullName || trip.driverId || 'Ibrahim Musa'}</Text>
                </View>
                <View style={styles.alignRight}>
                  <Text style={styles.tripLabel}>Weighbridge Net</Text>
                  <QuantityText
                    tonnes={(trip as any).weighbridgeTicket?.netWeightTonnes || (trip as any).plannedTonnage || 30}
                    size="sm"
                  />
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  fulfillmentCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    padding: Spacing.md,
  },
  fulHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  fulRef: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.heavy,
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
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  statLbl: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tripCard: {
    padding: Spacing.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  tripDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  tripLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  tripVal: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  ticketBadge: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  ticketText: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
    color: Colors.info,
  },
});
