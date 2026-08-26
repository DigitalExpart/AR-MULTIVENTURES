import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
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
  const outstanding = (summary as any)?.outstandingBalance || 2450000;
  const availableCredit = summary?.availableCredit || (creditLimit - outstanding);
  const utilization = creditLimit > 0 ? (outstanding / creditLimit) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Sub-Ledger & Account"
        subtitle="Running Balances & Credit Limits"
        showBack={false}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('profile')}
            style={styles.profileIconBtn}
          >
            <Text style={styles.profileIconText}>👤</Text>
          </TouchableOpacity>
        }
      />

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
          <Text style={styles.cardHeaderTitle}>Sub-Ledger Position</Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Outstanding Payable</Text>
              <MoneyText amount={outstanding} size="lg" weight="bold" color={Colors.danger} />
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigate?.('invoices')}
              style={styles.payInvoicesBtn}
            >
              <Text style={styles.payInvoicesText}>Pay Invoices →</Text>
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* Credit Limit & Utilization */}
        <SectionHeader title="Commercial Credit Facility" />
        <AppCard style={styles.creditCard}>
          <View style={styles.creditGrid}>
            <View>
              <Text style={styles.creditLabel}>Approved Credit Limit</Text>
              <MoneyText amount={creditLimit} size="md" color={Colors.textPrimary} />
            </View>
            <View style={styles.alignRight}>
              <Text style={styles.creditLabel}>Available Credit</Text>
              <MoneyText amount={availableCredit} size="md" color={Colors.success} />
            </View>
          </View>

          <View style={styles.progressWrapper}>
            <ProgressBar
              progress={utilization}
              color={utilization > 80 ? Colors.danger : Colors.primary}
              showPercent
              label={`Credit Utilization (${utilization.toFixed(1)}%)`}
            />
          </View>
        </AppCard>

        {/* Quick Financial Shortcuts */}
        <SectionHeader title="Financial Documents & Actions" />
        <AppCard style={styles.menuCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('invoices')}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>📄</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Proforma & Tax Invoices</Text>
              <Text style={styles.menuSubtitle}>View pending and settled VAT invoices</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('payments')}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>💳</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Online & Bank Settlements</Text>
              <Text style={styles.menuSubtitle}>Paystack checkout and deposit slips</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate?.('profile')}
            style={styles.menuItem}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Company Profile & Role Settings</Text>
              <Text style={styles.menuSubtitle}>CAC number, registered address & auth</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </AppCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontSize: 16,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  accountHeader: {
    paddingVertical: Spacing.xs,
  },
  companyName: {
    fontSize: Typography.sizes.subheading,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  accountNo: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  balanceCard: {
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  cardHeaderTitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  payInvoicesBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
  },
  payInvoicesText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  creditCard: {
    padding: Spacing.md,
  },
  creditGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  creditLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  progressWrapper: {
    marginTop: Spacing.xs,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.md,
  },
});
