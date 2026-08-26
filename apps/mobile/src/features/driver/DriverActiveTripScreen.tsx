import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { deliveryApi } from '@ar-multiventures/api';
import type { DeliveryTripRecord } from '@ar-multiventures/types';

export function DriverActiveTripScreen({
  route,
  onNavigate,
}: {
  route?: { params?: { tripId?: string } };
  onNavigate?: (screen: string, params?: any) => void;
}) {
  const tripId = route?.params?.tripId || 'trp-01';
  const [trip, setTrip] = useState<DeliveryTripRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadTrip = async () => {
    try {
      const data = await deliveryApi.getTripById(tripId);
      setTrip(data);
    } catch (err) {
      console.error('Failed to load active driver trip:', err);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const handleUpdateStatus = async (nextAction: string) => {
    if (!trip) return;
    setIsUpdating(true);
    try {
      if (nextAction === 'CHECKIN') {
        await deliveryApi.recordQuarryCheckin(trip.id);
      } else if (nextAction === 'DISPATCH') {
        await deliveryApi.dispatchTrip(trip.id);
      }
      await loadTrip();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading driver mission data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determine current lifecycle step & primary action
  const getActionConfig = () => {
    switch (trip.status) {
      case 'SCHEDULED':
      case 'ASSIGNED':
        return {
          title: '🏭 1. CHECK IN AT QUARRY GATE',
          subtext: 'Tap when your tipper checks into the quarry security gate',
          action: () => handleUpdateStatus('CHECKIN'),
          btnColor: Colors.info,
        };
      case 'AT_QUARRY':
      case 'LOADING':
        return {
          title: '⚖️ 2. SCALED & DEPART QUARRY',
          subtext: 'Weighbridge scale recorded. Tap when departing gate with waybill.',
          action: () => handleUpdateStatus('DISPATCH'),
          btnColor: Colors.primary,
        };
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return {
          title: '🏁 3. ARRIVED AT DELIVERY SITE',
          subtext: 'Tap when truck pulls onto customer construction site',
          action: () => onNavigate?.('driver_pod_capture', { tripId: trip.id }),
          btnColor: Colors.accentDark,
        };
      case 'ARRIVED':
        return {
          title: '✍️ 4. CAPTURE DIGITAL POD',
          subtext: 'Hand phone to site engineer for touchscreen signature and offload photos',
          action: () => onNavigate?.('driver_pod_capture', { tripId: trip.id }),
          btnColor: Colors.success,
        };
      case 'DELIVERED':
        return {
          title: '✓ MISSION COMPLETED',
          subtext: 'Signed POD captured and verified. Truck returned to available fleet.',
          action: () => onNavigate?.('driver_trips'),
          btnColor: Colors.secondaryDark,
        };
      default:
        return {
          title: 'VIEW POD DETAILS',
          subtext: 'Delivery record on file',
          action: () => onNavigate?.('driver_trips'),
          btnColor: Colors.primary,
        };
    }
  };

  const actionConfig = getActionConfig();

  const handleCallSite = async () => {
    const phone = '+2348023349988';
    const url = `tel:${phone}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert(`Telephony is not available on this device. Site Engineer Contact: ${phone}`);
      }
    } catch (err) {
      alert(`Could not place call: ${err}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onNavigate?.('driver_trips')}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← All Trips</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{trip.tripNumber}</Text>
        <StatusBadge status={trip.status} size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Giant Glove-Friendly Action Banner */}
        <AppCard style={[styles.actionBannerCard, { borderColor: actionConfig.btnColor }]}>
          <Text style={styles.actionPromptHeader}>NEXT DRIVER ACTION</Text>
          <AppButton
            title={isUpdating ? 'Updating Mission...' : actionConfig.title}
            onPress={actionConfig.action}
            loading={isUpdating}
            size="lg"
            fullWidth
            style={[styles.bigActionBtn, { backgroundColor: actionConfig.btnColor }]}
          />
          <Text style={styles.actionHelperText}>{actionConfig.subtext}</Text>
        </AppCard>

        {/* Site Contact & Navigation Triggers */}
        <AppCard style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <View>
              <Text style={styles.contactTitle}>Site Destination Contact</Text>
              <Text style={styles.contactSub}>{trip.destinationName}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCallSite}
              style={styles.callBtn}
            >
              <Text style={styles.callBtnText}>📞 Call Site</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fullAddressText}>
            📍 {trip.destinationAddress || 'Block 4, Industrial Zone, Lekki Free Trade Zone, Lagos'}
          </Text>
        </AppCard>

        {/* Aggregate & Weighbridge Mission Details */}
        <AppCard style={styles.detailsCard}>
          <Text style={styles.cardHeaderTitle}>Mission Cargo</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Aggregate</Text>
            <Text style={styles.detailValBold}>{trip.materialName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source Quarry</Text>
            <Text style={styles.detailVal}>{trip.quarryName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned Truck</Text>
            <Text style={styles.detailValBold}>🚛 {trip.truckRegistration || 'LSR-492-YY'}</Text>
          </View>

          {trip.weighbridge && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Weighbridge Ticket</Text>
                <Text style={styles.detailValBold}>{trip.weighbridge.weighbridgeTicketNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Net Cargo Weight</Text>
                <Text style={styles.netHighlight}>{trip.weighbridge.netWeightTonnes} Tonnes</Text>
              </View>
            </>
          )}
        </AppCard>
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
    marginTop: Spacing.sm,
  },
  actionBannerCard: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    padding: Spacing.lg,
  },
  actionPromptHeader: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  bigActionBtn: {
    minHeight: 56,
  },
  actionHelperText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  contactCard: {
    backgroundColor: Colors.surface,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  contactSub: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  callBtnText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  fullAddressText: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
  },
  cardHeaderTitle: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  detailVal: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textPrimary,
  },
  detailValBold: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  netHighlight: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.heavy,
    color: Colors.primaryDark,
  },
});
