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
import { MoneyText, QuantityText } from '../../components/common/MoneyText';
import { ProgressBar } from '../../components/common/ProgressBar';
import { DevDataBadge, OfflineBanner } from '../../components/common/DevDataBadge';
import { useAuth } from '../../services/authStore';
import { requisitionApi, deliveryApi, financeApi } from '@ar-multiventures/api';
import type { Requisition, OrderFulfillmentSummary, CustomerFinancialSummary } from '@ar-multiventures/types';

export function CustomerHomeScreen({ onNavigate }: { onNavigate?: (screen: string, params?: any) => void }) {
  const { user, switchRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentRequisitions, setRecentRequisitions] = useState<Requisition[]>([]);
  const [activeFulfillment, setActiveFulfillment] = useState<OrderFulfillmentSummary | null>(null);
  const [financialSummary, setFinancialSummary] = useState<CustomerFinancialSummary | null>(null);

  const loadDashboardData = async () => {
    try {
      const [reqs, fulfillments, finance] = await Promise.all([
        requisitionApi.list(),
        deliveryApi.getCustomerFulfillments(),
        financeApi.getCustomerFinancialSummary('cus-buildcorp'),
      ]);
      setRecentRequisitions(reqs.slice(0, 3));
      if (fulfillments.length > 0) {
        setActiveFulfillment(fulfillments[0]);
      }
      setFinancialSummary(finance);
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Top Greeting & Brand Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>Good morning,</Text>
            <Text style={styles.userNameText}>{user?.firstName || 'Customer'} {user?.lastName || ''}</Text>
            <Text style={styles.companyText}>{user?.companyName || 'BuildCorp Nigeria Limited'}</Text>
          </View>
          <View style={styles.headerBadges}>
            <DevDataBadge />
            {process.env.EXPO_PUBLIC_DATA_PROVIDER !== 'supabase' && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => switchRole('DRIVER')}
                style={styles.switchRolePill}
              >
                <Text style={styles.switchRoleText}>Switch to Driver 🚛</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Primary CTA: New Requisition */}
        <AppCard style={styles.heroActionCard}>
          <View style={styles.heroCardContent}>
            <View style={styles.heroTextWrapper}>
              <Text style={styles.heroTitle}>Need Granite Aggregate?</Text>
              <Text style={styles.heroSubtitle}>
                Request crushed stone, stone base, or tipper haulage with instant pit-head pricing quotes.
              </Text>
            </View>
            <AppButton
              title="+ New Requisition"
              onPress={() => onNavigate?.('new_requisition')}
              size="lg"
              style={styles.newRequisitionBtn}
            />
          </View>
        </AppCard>

        {/* Financial KPI Summary Cards */}
        <View style={styles.kpiGrid}>
          <AppCard style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Outstanding Balance</Text>
            <MoneyText amount={financialSummary?.outstandingBalance || 2450000} size="md" color={Colors.danger} />
            <Text style={styles.kpiSubtext}>Due in 7 days</Text>
          </AppCard>

          <AppCard style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Available Credit</Text>
            <MoneyText amount={financialSummary?.availableCredit || 22550000} size="md" color={Colors.primary} />
            <Text style={styles.kpiSubtext}>of ₦25,000,000 Limit</Text>
          </AppCard>
        </View>

        {/* Active Delivery Operational Progress */}
        {activeFulfillment && (
          <View style={styles.sectionWrapper}>
            <SectionHeader
              title="Active Delivery Progress"
              subtitle={activeFulfillment.destinationName}
              rightActionText="View All"
              onRightAction={() => onNavigate?.('deliveries')}
            />
            <AppCard
              onPress={() => onNavigate?.('deliveries', { id: activeFulfillment.requisitionId })}
              style={styles.fulfillmentCard}
            >
              <View style={styles.fulfillmentHeader}>
                <View>
                  <Text style={styles.fulfillmentRef}>{activeFulfillment.referenceNumber}</Text>
                  <Text style={styles.fulfillmentMaterial}>{activeFulfillment.materialName}</Text>
                </View>
                <StatusBadge status={activeFulfillment.status} size="sm" />
              </View>

              <ProgressBar
                progress={activeFulfillment.fulfillmentPercent}
                showPercent
                label={`Delivered ${activeFulfillment.deliveredQuantity}T of ${activeFulfillment.orderedQuantity}T`}
                style={styles.fulfillmentProgress}
              />

              <View style={styles.tripsOverviewRow}>
                <View style={styles.tripMiniStat}>
                  <Text style={styles.tripMiniValue}>{activeFulfillment.deliveredQuantity}T</Text>
                  <Text style={styles.tripMiniLabel}>Delivered</Text>
                </View>
                <View style={styles.tripMiniStat}>
                  <Text style={styles.tripMiniValue}>{activeFulfillment.dispatchedQuantity}T</Text>
                  <Text style={styles.tripMiniLabel}>In Transit</Text>
                </View>
                <View style={styles.tripMiniStat}>
                  <Text style={styles.tripMiniValue}>{activeFulfillment.remainingQuantity}T</Text>
                  <Text style={styles.tripMiniLabel}>Remaining</Text>
                </View>
              </View>
            </AppCard>
          </View>
        )}

        {/* Recent Requisitions */}
        <View style={styles.sectionWrapper}>
          <SectionHeader
            title="Recent Orders"
            rightActionText="View All Orders"
            onRightAction={() => onNavigate?.('orders')}
          />
          {recentRequisitions.map((req) => (
            <AppCard
              key={req.id}
              onPress={() => onNavigate?.('order_detail', { id: req.id })}
              style={styles.requisitionCard}
            >
              <View style={styles.reqHeader}>
                <Text style={styles.reqNumber}>{req.requisitionNumber}</Text>
                <StatusBadge status={req.status} size="sm" />
              </View>
              <Text style={styles.reqMaterial}>
                {req.material?.name || 'Granite 3/4" (20mm Aggregate)'}
              </Text>
              <Text style={styles.reqDestination}>{req.destinationAddress}</Text>
              <View style={styles.reqFooter}>
                <QuantityText tonnes={req.quantity} size="sm" />
                <MoneyText amount={req.totalPriceSnapshot || req.totalPrice} size="sm" />
              </View>
            </AppCard>
          ))}
        </View>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  greetingText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  userNameText: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  companyText: {
    fontSize: Typography.sizes.caption,
    color: Colors.primaryDark,
    fontWeight: Typography.weights.semibold,
    marginTop: 2,
  },
  headerBadges: {
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
  heroActionCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
    marginBottom: Spacing.lg,
  },
  heroCardContent: {
    gap: Spacing.md,
  },
  heroTextWrapper: {},
  heroTitle: {
    fontSize: Typography.sizes.subheading,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: Typography.sizes.bodySm,
    color: '#E8F5E9',
    marginTop: 4,
  },
  newRequisitionBtn: {
    backgroundColor: Colors.accent,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  kpiCard: {
    flex: 1,
    padding: Spacing.md,
  },
  kpiLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
    marginBottom: 4,
  },
  kpiSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  sectionWrapper: {
    marginBottom: Spacing.lg,
  },
  fulfillmentCard: {
    backgroundColor: '#FFFFFF',
  },
  fulfillmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  fulfillmentRef: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  fulfillmentMaterial: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
  },
  fulfillmentProgress: {
    marginVertical: Spacing.sm,
  },
  tripsOverviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  tripMiniStat: {
    alignItems: 'center',
  },
  tripMiniValue: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  tripMiniLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  requisitionCard: {
    marginBottom: Spacing.sm,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reqNumber: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  reqMaterial: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  reqDestination: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  reqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
