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
import { MoneyText } from '../../components/common/MoneyText';
import { EmptyState } from '../../components/common/LoadingSkeleton';
import { financeApi } from '@ar-multiventures/api';
import type { InvoiceRecord } from '@ar-multiventures/types';

export function CustomerInvoicesScreen({ onNavigate }: { onNavigate?: (screen: string, params?: any) => void }) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await financeApi.getInvoices();
      setInvoices(data);
    } catch (err) {
      console.error('Failed to load customer invoices:', err);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Invoices & Settlement"
        subtitle="Commercial Proforma & Tax Invoices"
        onBack={() => onNavigate?.('tabs')}
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {invoices.length === 0 ? (
          <EmptyState
            title="No Invoices Found"
            description="Your commercial invoices will appear here once requisitions are approved."
          />
        ) : (
          invoices.map((inv) => (
            <AppCard
              key={inv.id}
              onPress={() => onNavigate?.('payments', { invoiceId: inv.id })}
              style={styles.invoiceCard}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.invoiceNum}>{inv.invoiceNumber}</Text>
                  <Text style={styles.dateText}>
                    Issued: {inv.issueDate} • Due: {inv.dueDate}
                  </Text>
                </View>
                <StatusBadge status={inv.status} />
              </View>

              <View style={styles.divider} />

              <View style={styles.amountGrid}>
                <View>
                  <Text style={styles.label}>Total Due</Text>
                  <MoneyText amount={inv.totalAmount} size="md" weight="bold" color={Colors.primary} />
                </View>
                <View style={styles.alignRight}>
                  <Text style={styles.label}>Paid</Text>
                  <MoneyText amount={inv.paidAmount} size="md" color={Colors.textPrimary} />
                </View>
              </View>

              {inv.status !== 'PAID' && (
                <View style={styles.outstandingRow}>
                  <Text style={styles.outstandingLabel}>
                    Outstanding: ₦{(inv.totalAmount - inv.paidAmount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onNavigate?.('payments', { invoiceId: inv.id })}
                    style={styles.payBtn}
                  >
                    <Text style={styles.payBtnText}>Pay Now →</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  invoiceCard: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNum: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.heavy,
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  amountGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  outstandingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  outstandingLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.danger,
  },
  payBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
  },
  payBtnText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
});
