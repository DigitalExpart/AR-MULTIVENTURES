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
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { AppCard, SectionHeader } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DevDataBadge, OfflineBanner } from '../../components/common/DevDataBadge';
import { useAuth } from '../../services/authStore';
import { deliveryApi } from '@ar-multiventures/api';
import type { DeliveryTripRecord } from '@ar-multiventures/types';

export function DriverHomeScreen({ onNavigate }: { onNavigate?: (screen: string, params?: any) => void }) {
  const { user, switchRole } = useAuth();
  const [activeTrip, setActiveTrip] = useState<DeliveryTripRecord | null>(null);
  const [trips, setTrips] = useState<DeliveryTripRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDriverData = async () => {
    try {
      const allTrips = await deliveryApi.getTrips();
      setTrips(allTrips);
      const active = allTrips.find((t) => t.status !== 'DELIVERED' && t.status !== 'CANCELLED') || allTrips[0];
      setActiveTrip(active);
    } catch (err) {
      console.error('Failed to load driver trips:', err);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDriverData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Driver Header */}
        <View style={styles.driverHeader}>
          <View>
            <Text style={styles.dutyBadge}>🟢 ON ACTIVE DUTY</Text>
            <Text style={styles.driverName}>Driver {user?.firstName} {user?.lastName}</Text>
            <Text style={styles.truckReg}>Assigned Tipper: 🚛 LSR-492-YY (Sinotruk HOWO 371)</Text>
          </View>
          <View style={styles.rightBadges}>
            <DevDataBadge />
            {process.env.EXPO_PUBLIC_DATA_PROVIDER !== 'supabase' && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => switchRole('CUSTOMER')}
                style={styles.switchRolePill}
              >
                <Text style={styles.switchRoleText}>Customer View 🏗️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Card: Active Mission */}
        {activeTrip ? (
          <AppCard style={styles.activeMissionCard}>
            <View style={styles.missionHeader}>
              <View>
                <Text style={styles.missionLabel}>CURRENT ACTIVE MISSION</Text>
                <Text style={styles.missionTripNo}>{activeTrip.tripNumber}</Text>
              </View>
              <StatusBadge status={activeTrip.status} size="md" />
            </View>

            <View style={styles.routeBox}>
              <View style={styles.routeStop}>
                <Text style={styles.routeDot}>🟢</Text>
                <View>
                  <Text style={styles.routeLabel}>SOURCE QUARRY</Text>
                  <Text style={styles.routeName}>{activeTrip.quarryName}</Text>
                </View>
              </View>

              <View style={styles.routeConnector} />

              <View style={styles.routeStop}>
                <Text style={styles.routeDot}>🏁</Text>
                <View>
                  <Text style={styles.routeLabel}>DELIVERY SITE</Text>
                  <Text style={styles.routeName}>{activeTrip.destinationAddress || activeTrip.destinationName}</Text>
                </View>
              </View>
            </View>

            <View style={styles.missionStatsRow}>
              <View style={styles.mStat}>
                <Text style={styles.mStatVal}>{activeTrip.plannedQuantityTonnes}T</Text>
                <Text style={styles.mStatLbl}>Target Weight</Text>
              </View>
              <View style={styles.mStat}>
                <Text style={styles.mStatVal}>
                  {activeTrip.weighbridge ? `${activeTrip.weighbridge.netWeightTonnes}T` : 'Pending Scale'}
                </Text>
                <Text style={styles.mStatLbl}>Weighbridge Net</Text>
              </View>
              <View style={styles.mStat}>
                <Text style={styles.mStatVal}>{activeTrip.scheduledDate}</Text>
                <Text style={styles.mStatLbl}>Mission Date</Text>
              </View>
            </View>

            {/* Giant Glove-Friendly Action Button */}
            <AppButton
              title="CONTINUE TRIP ACTIONS →"
              onPress={() => onNavigate?.('driver_active_trip', { tripId: activeTrip.id })}
              size="lg"
              fullWidth
              style={styles.continueMissionBtn}
            />
          </AppCard>
        ) : null}

        {/* Today's Mission Queue */}
        <SectionHeader
          title="Today's Assignments"
          rightActionText="View All"
          onRightAction={() => onNavigate?.('driver_trips')}
        />

        {trips.map((t) => (
          <AppCard
            key={t.id}
            onPress={() => onNavigate?.('driver_active_trip', { tripId: t.id })}
            style={styles.tripCard}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTripNo}>{t.tripNumber}</Text>
              <StatusBadge status={t.status} size="sm" />
            </View>

            <Text style={styles.cardMaterial}>{t.materialName}</Text>
            <Text style={styles.cardDest}>{t.destinationName}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.tonnesText}>{t.plannedQuantityTonnes} Tonnes</Text>
              <Text style={styles.actionPrompt}>Open Mission →</Text>
            </View>
          </AppCard>
        ))}
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
    gap: Spacing.md,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  dutyBadge: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    color: Colors.success,
    letterSpacing: 1,
  },
  driverName: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  truckReg: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.primaryDark,
    marginTop: 2,
  },
  rightBadges: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  switchRolePill: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchRoleText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.secondaryDark,
  },
  activeMissionCard: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
    padding: Spacing.xl,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  missionLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    color: Colors.accent,
    letterSpacing: 1,
  },
  missionTripNo: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
    marginTop: 2,
  },
  routeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.sm,
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  routeDot: {
    fontSize: 16,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  routeName: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  routeConnector: {
    width: 2,
    height: 16,
    backgroundColor: '#64748B',
    marginLeft: 8,
    marginVertical: 4,
  },
  missionStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mStat: {
    alignItems: 'center',
  },
  mStatVal: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  mStatLbl: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  continueMissionBtn: {
    backgroundColor: Colors.accent,
    marginTop: Spacing.xs,
    minHeight: 56,
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
  cardTripNo: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  cardMaterial: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  cardDest: {
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
  actionPrompt: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
