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
import { AppCard, SectionHeader } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MoneyText, QuantityText } from '../../components/common/MoneyText';
import { ProgressBar } from '../../components/common/ProgressBar';
import { requisitionApi, deliveryApi } from '@ar-multiventures/api';
import type { Requisition, OrderFulfillmentSummary } from '@ar-multiventures/types';

export function CustomerOrderDetailScreen({
  route,
  onNavigate,
}: {
  route?: { params?: { id?: string } };
  onNavigate?: (screen: string, params?: any) => void;
}) {
  const reqId = route?.params?.id || 'req-01';
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [fulfillment, setFulfillment] = useState<OrderFulfillmentSummary | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [req, ful] = await Promise.all([
          requisitionApi.getById(reqId),
          deliveryApi.getOrderFulfillmentSummary(reqId),
        ]);
        setRequisition(req);
        setFulfillment(ful);
      } catch (err) {
        console.error('Failed to load requisition detail:', err);
      }
    }
    loadData();
  }, [reqId]);

  if (!requisition) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onNavigate?.('orders')}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Orders</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{requisition.requisitionNumber}</Text>
        <StatusBadge status={requisition.status} size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Fulfillment Hero Card */}
        {fulfillment && (
          <AppCard style={styles.fulfillmentCard}>
            <Text style={styles.cardHeaderTitle}>Delivery Fulfillment</Text>
            <ProgressBar
              progress={fulfillment.fulfillmentPercent}
              showPercent
              label={`Delivered ${fulfillment.deliveredQuantity}T of ${fulfillment.orderedQuantity}T`}
            />

            <View style={styles.fulfillmentGrid}>
              <View style={styles.miniStatBox}>
                <Text style={styles.miniStatVal}>{fulfillment.deliveredQuantity}T</Text>
                <Text style={styles.miniStatLbl}>Delivered</Text>
              </View>
              <View style={styles.miniStatBox}>
                <Text style={styles.miniStatVal}>{fulfillment.dispatchedQuantity}T</Text>
                <Text style={styles.miniStatLbl}>In Transit</Text>
              </View>
              <View style={styles.miniStatBox}>
                <Text style={styles.miniStatVal}>{fulfillment.loadedQuantity}T</Text>
                <Text style={styles.miniStatLbl}>Loaded</Text>
              </View>
              <View style={styles.miniStatBox}>
                <Text style={styles.miniStatVal}>{fulfillment.remainingQuantity}T</Text>
                <Text style={styles.miniStatLbl}>Remaining</Text>
              </View>
            </View>

            <AppButton
              title="Track Live Trips"
              onPress={() => onNavigate?.('deliveries', { id: reqId })}
              variant="outline"
              size="sm"
              style={styles.trackTripsBtn}
            />
          </AppCard>
        )}

        {/* Commercial Specifications */}
        <AppCard style={styles.detailsCard}>
          <Text style={styles.cardHeaderTitle}>Commercial Specifications</Text>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Aggregate Material</Text>
            <Text style={styles.specValue}>{requisition.material?.name || 'Granite 3/4" (20mm)'}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Total Quantity</Text>
            <QuantityText tonnes={requisition.quantity} size="sm" />
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Source Extraction Quarry</Text>
            <Text style={styles.specValue}>{requisition.quarry?.name || 'Abeokuta North Quarry'}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Destination Site</Text>
            <Text style={styles.specValue}>{requisition.destinationAddress}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Requested Delivery</Text>
            <Text style={styles.specValue}>{requisition.requestedDeliveryDate}</Text>
          </View>
        </AppCard>

        {/* Commercial Breakdown */}
        <AppCard style={styles.detailsCard}>
          <Text style={styles.cardHeaderTitle}>Commercial Settlement</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Total Invoice Amount</Text>
            <MoneyText amount={requisition.totalPriceSnapshot || requisition.totalPrice} size="md" color={Colors.primaryDark} />
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Payment Status</Text>
            <StatusBadge status={requisition.paymentStatus} size="sm" />
          </View>

          {requisition.paymentStatus === 'UNPAID' && (
            <AppButton
              title="Pay Invoice Online"
              onPress={() => onNavigate?.('payments', { reqId })}
              size="md"
              fullWidth
              style={styles.payBtn}
            />
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
  },
  fulfillmentCard: {
    backgroundColor: Colors.surface,
  },
  cardHeaderTitle: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  fulfillmentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  miniStatBox: {
    alignItems: 'center',
  },
  miniStatVal: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  miniStatLbl: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  trackTripsBtn: {
    marginTop: Spacing.xs,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  specLabel: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  specValue: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  payBtn: {
    marginTop: Spacing.md,
  },
});
