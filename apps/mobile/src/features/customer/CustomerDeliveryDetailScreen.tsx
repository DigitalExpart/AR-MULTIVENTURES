import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { AppCard } from '../../components/common/AppCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { deliveryApi } from '@ar-multiventures/api';
import type { DeliveryTripRecord } from '@ar-multiventures/types';

export function CustomerDeliveryDetailScreen({
  route,
  onNavigate,
}: {
  route?: { params?: { tripId?: string } };
  onNavigate?: (screen: string) => void;
}) {
  const tripId = route?.params?.tripId || 'trp-02';
  const [trip, setTrip] = useState<DeliveryTripRecord | null>(null);

  useEffect(() => {
    async function loadTrip() {
      try {
        const data = await deliveryApi.getTripById(tripId);
        setTrip(data);
      } catch (err) {
        console.error('Failed to load trip detail:', err);
      }
    }
    loadTrip();
  }, [tripId]);

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading delivery trip tracking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onNavigate?.('deliveries')}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Deliveries</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{trip.tripNumber}</Text>
        <StatusBadge status={trip.status} size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mission Summary Card */}
        <AppCard style={styles.missionCard}>
          <Text style={styles.cardHeading}>Mission Specifications</Text>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Truck Registration</Text>
            <Text style={styles.specValBold}>🚛 {trip.truckRegistration || 'LSR-492-YY'}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Assigned Driver</Text>
            <Text style={styles.specVal}>{trip.driverName || 'Babatunde Adeleke'} ({trip.driverPhone || '+234 805 222 3344'})</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Source Quarry</Text>
            <Text style={styles.specVal}>{trip.quarryName}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Delivery Site</Text>
            <Text style={styles.specVal}>{trip.destinationAddress || trip.destinationName}</Text>
          </View>
        </AppCard>

        {/* Weighbridge Electronic Ticket Card */}
        {trip.weighbridge && (
          <AppCard style={styles.weighbridgeCard}>
            <View style={styles.wbHeader}>
              <Text style={styles.cardHeading}>Weighbridge Scale Ticket</Text>
              <Text style={styles.wbTicketNo}>{trip.weighbridge.weighbridgeTicketNumber}</Text>
            </View>

            <View style={styles.wbGrid}>
              <View style={styles.wbBox}>
                <Text style={styles.wbVal}>{trip.weighbridge.grossWeightTonnes}T</Text>
                <Text style={styles.wbLbl}>Gross Weight</Text>
              </View>
              <View style={styles.wbBox}>
                <Text style={styles.wbVal}>{trip.weighbridge.tareWeightTonnes}T</Text>
                <Text style={styles.wbLbl}>Tare Weight</Text>
              </View>
              <View style={[styles.wbBox, styles.wbHighlightBox]}>
                <Text style={[styles.wbVal, styles.wbNetVal]}>{trip.weighbridge.netWeightTonnes}T</Text>
                <Text style={styles.wbLbl}>Net Aggregate</Text>
              </View>
            </View>

            <View style={styles.wbFooter}>
              <Text style={styles.wbOfficerText}>Scale Officer: {trip.weighbridge.loadingOfficerName}</Text>
              <Text style={styles.wbVarianceText}>
                Variance: {trip.weighbridge.varianceTonnes > 0 ? `+${trip.weighbridge.varianceTonnes}` : trip.weighbridge.varianceTonnes}T ({trip.weighbridge.variancePercent}%)
              </Text>
            </View>
          </AppCard>
        )}

        {/* Digital Proof of Delivery (POD) Card */}
        {trip.pod && (
          <AppCard style={styles.podCard}>
            <View style={styles.podHeader}>
              <Text style={styles.podTitle}>Digital Proof of Delivery (POD)</Text>
              <Text style={styles.podVerifiedBadge}>✓ Verified</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Site Receiving Engineer</Text>
              <Text style={styles.specValBold}>{trip.pod.receiverName}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Designation / Role</Text>
              <Text style={styles.specVal}>{trip.pod.receivedByDesignation || 'Site Supervisor'}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Delivered Quantity</Text>
              <Text style={styles.specValBold}>{trip.pod.deliveredQuantityTonnes} Tonnes</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Timestamp</Text>
              <Text style={styles.specVal}>{trip.pod.deliveryTime}</Text>
            </View>

            {/* Signature Preview */}
            <View style={styles.signatureBox}>
              <Text style={styles.sigLabel}>Verified Digital Signature:</Text>
              <View style={styles.sigFrame}>
                <Text style={styles.sigPlaceholder}>✍️ [Verified Touchscreen Signature — {trip.pod.signatureStoragePath}]</Text>
              </View>
            </View>

            {trip.pod.driverRemarks && (
              <View style={styles.remarksBox}>
                <Text style={styles.remarksLabel}>Driver Transit Remarks:</Text>
                <Text style={styles.remarksText}>"{trip.pod.driverRemarks}"</Text>
              </View>
            )}
          </AppCard>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
  },
  missionCard: {
    backgroundColor: Colors.surface,
  },
  cardHeading: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  specLabel: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  specVal: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  specValBold: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    maxWidth: '60%',
    textAlign: 'right',
  },
  weighbridgeCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  wbHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  wbTicketNo: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.info,
    fontFamily: 'System',
  },
  wbGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  wbBox: {
    flex: 1,
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  wbHighlightBox: {
    backgroundColor: Colors.primaryLight,
  },
  wbVal: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  wbNetVal: {
    color: Colors.primaryDark,
  },
  wbLbl: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  wbFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  wbOfficerText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  wbVarianceText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  podCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  podHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  podTitle: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  podVerifiedBadge: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  signatureBox: {
    marginTop: Spacing.md,
  },
  sigLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  sigFrame: {
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sigPlaceholder: {
    fontSize: Typography.sizes.caption,
    color: Colors.primaryDark,
    fontStyle: 'italic',
  },
  remarksBox: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.sm,
  },
  remarksLabel: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
  remarksText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
