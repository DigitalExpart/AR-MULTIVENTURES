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
import { StatusBadge } from '../../components/common/StatusBadge';
import { MoneyText, QuantityText } from '../../components/common/MoneyText';
import { EmptyState } from '../../components/common/LoadingSkeleton';
import { requisitionApi } from '@ar-multiventures/api';
import type { Requisition } from '@ar-multiventures/types';

export function CustomerOrdersListScreen({ onNavigate }: { onNavigate?: (screen: string, params?: any) => void }) {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequisitions = async () => {
    try {
      const data = await requisitionApi.list();
      setRequisitions(data);
    } catch (err) {
      console.error('Failed to load requisitions:', err);
    }
  };

  useEffect(() => {
    loadRequisitions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequisitions();
    setRefreshing(false);
  };

  const filteredRequisitions = requisitions.filter((r) => {
    if (activeTab === 'ACTIVE') return !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(r.status);
    if (activeTab === 'COMPLETED') return ['COMPLETED', 'DELIVERED'].includes(r.status);
    return true;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Granite Orders"
        subtitle="Customer Requisitions & Tracking"
        showBack={false}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('new_requisition')}
            style={styles.newOrderBtn}
          >
            <Text style={styles.newOrderText}>+ New</Text>
          </TouchableOpacity>
        }
      />

      {/* Tab Filter Header */}
      <View style={styles.tabHeader}>
        {(['ACTIVE', 'COMPLETED', 'ALL'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'ACTIVE' ? 'Active Orders' : tab === 'COMPLETED' ? 'Delivered' : 'All Orders'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {filteredRequisitions.length === 0 ? (
          <EmptyState
            title="No Requisitions Found"
            description="You have no requisitions in this tab. Tap + New above to create an aggregate supply order."
          />
        ) : (
          filteredRequisitions.map((req) => (
            <AppCard
              key={req.id}
              onPress={() => onNavigate?.('order_detail', { id: req.id })}
              style={styles.orderCard}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.orderNumber}>{req.requisitionNumber}</Text>
                <StatusBadge status={req.status} />
              </View>

              <Text style={styles.materialName}>
                {req.material?.name || 'Granite 3/4" (20mm Aggregate)'}
              </Text>
              <Text style={styles.destinationText}>{req.destinationAddress}</Text>

              <View style={styles.cardFooter}>
                <QuantityText tonnes={req.quantity} size="sm" />
                <MoneyText amount={req.totalPriceSnapshot || req.totalPrice} size="sm" />
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
  newOrderBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  newOrderText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondaryLight,
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
  orderCard: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  orderNumber: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  materialName: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    marginTop: 2,
  },
  destinationText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
