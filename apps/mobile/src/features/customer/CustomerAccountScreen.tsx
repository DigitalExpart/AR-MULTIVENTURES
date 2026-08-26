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
import { MoneyText } from '../../components/common/MoneyText';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useAuth } from '../../services/authStore';
import { financeApi } from '@ar-multiventures/api';
import type { CustomerFinancialSummary } from '@ar-multiventures/types';

export function CustomerAccountScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<CustomerFinancialSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccount = async () => {
    try {
      const data = await financeApi.getCustomerFinancialSummary('cus-buildcorp');
      setSummary(data);
    } catch (err) {
      console.error('Failed to load financial summary:', err);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAccount();
    setRefreshing(false);
  };

  const creditLimit = summary?.creditLimit || 25000000;
  const outstanding = summary?.outstandingBalance || 2450000;
  const availableCredit = summary?.availableCredit || (creditLimit - outstanding);
  const utilization = creditLimit > 0 ? (outstanding / creditLimit) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Account Header */}
        <View style={styles.accountHeader}>
          <Text style={styles.companyName}>{user?.companyName || 'BuildCorp Nigeria Limited'}</Text>
          <Text style={styles.accountNo}>Account #{user?.accountNumber || 'CUS-2026-0089'}</Text>
        </View>

        {/* Financial Sub-Ledger Balance Card */}
        <AppCard style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Outstanding Sub-Ledger Balance</Text>
          <MoneyText amount={outstanding} size="display" color={Colors.danger} />
          <Text style={styles.termsText}>Payment Terms: 14 Days Net</Text>

          <View style={styles.creditBarContainer}>
            <ProgressBar
              progress={utilization}
              showPercent
              label="Credit Facility Utilization"
              color={utilization > 80 ? Colors.danger : Colors.primary}
            />
          </View>

          <View style={styles.creditStatsRow}>
            <View>
              <Text style={styles.statLabel}>Credit Limit</Text>
              <MoneyText amount={creditLimit} size="sm" />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Available Credit</Text>
              <MoneyText amount={availableCredit} size="sm" color={Colors.primaryDark} />
            </View>
          </View>
        </AppCard>

        {/* Quick Account Actions */}
        <SectionHeader title="Financial Statements" />
        <AppCard style={styles.actionRowCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('invoices')}
            style={styles.actionItem}
          >
            <Text style={styles.actionIcon}>📄</Text>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Commercial Invoices</Text>
              <Text style={styles.actionSubtitle}>View proformas, tax invoices & balances</Text>
            </View>
            <Text style={styles.actionChevron}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('payments')}
            style={styles.actionItem}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Payments & Receipts</Text>
              <Text style={styles.actionSubtitle}>Paystack settlements & official electronic receipts</Text>
            </View>
            <Text style={styles.actionChevron}>→</Text>
          </TouchableOpacity>
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  accountHeader: {
    marginBottom: Spacing.sm,
  },
  companyName: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  accountNo: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.primaryDark,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: Colors.surface,
  },
  balanceLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  termsText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  creditBarContainer: {
    marginVertical: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  creditStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  actionRowCard: {
    backgroundColor: Colors.surface,
    padding: 0,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionChevron: {
    fontSize: Typography.sizes.bodyLg,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
});
