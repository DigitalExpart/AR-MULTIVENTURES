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
    <SafeAreaView style={styles.safeArea}>
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
                  <Text style={styles.invNumber}>{inv.invoiceNumber}</Text>
                  <Text style={styles.dateText}>Issued: {inv.issueDate} • Due: {inv.dueDate}</Text>
                </View>
                <StatusBadge status={inv.status} size="sm" />
              </View>

              <View style={styles.cardAmounts}>
                <View>
                  <Text style={styles.amountLabel}>Total Due</Text>
                  <MoneyText amount={inv.totalAmount} size="md" color={Colors.primaryDark} />
                </View>
                <View style={styles.paidCol}>
                  <Text style={styles.amountLabel}>Paid</Text>
                  <MoneyText amount={inv.amountPaid} size="sm" color={Colors.success} />
                </View>
              </View>

              {inv.status !== 'PAID' && (
                <View style={styles.cardActionRow}>
                  <Text style={styles.payPromptText}>Outstanding: ₦{(inv.totalAmount - inv.amountPaid).toLocaleString()}</Text>
                  <Text style={styles.payCtaText}>Pay Now →</Text>
                </View>
              )}
            </AppCard>
          ))
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  invoiceCard: {
    backgroundColor: Colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  invNumber: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  amountLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  paidCol: {
    alignItems: 'flex-end',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  payPromptText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.danger,
  },
  payCtaText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
