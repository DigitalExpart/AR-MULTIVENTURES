import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { AppCard, SectionHeader } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { TextField } from '../../components/common/TextField';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MoneyText } from '../../components/common/MoneyText';
import { financeApi } from '@ar-multiventures/api';
import type { PaymentRecord, InvoiceRecord } from '@ar-multiventures/types';

export function CustomerPaymentsScreen({
  route,
  onNavigate,
}: {
  route?: { params?: { invoiceId?: string; reqId?: string } };
  onNavigate?: (screen: string) => void;
}) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  // Paystack Modal State
  const [isPaystackLoading, setIsPaystackLoading] = useState(false);
  const [paystackSuccess, setPaystackSuccess] = useState<string | null>(null);

  // Bank Transfer Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('2450000');
  const [transferRef, setTransferRef] = useState('NIP-20260826-0918');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [payList, invList] = await Promise.all([
          financeApi.getPayments(),
          financeApi.getInvoices(),
        ]);
        setPayments(payList);
        setInvoices(invList);
        if (invList.length > 0) {
          const matched = invList.find((i) => i.id === route?.params?.invoiceId) || invList[0];
          setSelectedInvoice(matched);
        }
      } catch (err) {
        console.error('Failed to load payments:', err);
      }
    }
    loadData();
  }, [route?.params?.invoiceId]);

  const handlePaystackCheckout = async () => {
    if (!selectedInvoice) return;
    setIsPaystackLoading(true);
    try {
      const response = await financeApi.initializeOnlinePayment({
        invoiceId: selectedInvoice.id,
        requisitionId: selectedInvoice.requisitionId || 'req-01',
        amount: selectedInvoice.totalAmount - selectedInvoice.amountPaid,
        customerEmail: 'procurement@buildcorp.ng',
      });
      // In production mobile, opens WebBrowser or Paystack SDK with authorizationUrl
      // Simulates verification callback
      await financeApi.verifyOnlinePayment(response.reference);
      setPaystackSuccess(response.reference);
      // Reload payments
      const updated = await financeApi.getPayments();
      setPayments(updated);
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setIsPaystackLoading(false);
    }
  };

  const handleSubmitBankTransfer = async () => {
    setIsSubmittingTransfer(true);
    try {
      await financeApi.submitBankTransfer({
        invoiceId: selectedInvoice?.id || 'inv-01',
        amount: Number(transferAmount),
        depositSlipPath: 'proofs/cus-buildcorp/nip_slip_0918.jpg',
        bankReference: transferRef,
      });
      setIsBankModalOpen(false);
      alert('Bank transfer proof submitted for finance verification.');
      const updated = await financeApi.getPayments();
      setPayments(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to submit bank transfer proof');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Commercial Settlement"
        subtitle="Paystack Card & Bank Wire Settlement"
        onBack={() => onNavigate?.('tabs')}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Selected Invoice Payment Card */}
        {selectedInvoice && selectedInvoice.status !== 'PAID' && (
          <AppCard style={styles.payCard}>
            <Text style={styles.payCardTitle}>Pending Commercial Settlement</Text>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Invoice Ref</Text>
              <Text style={styles.payValueBold}>{selectedInvoice.invoiceNumber}</Text>
            </View>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Outstanding Due</Text>
              <MoneyText
                amount={selectedInvoice.totalAmount - selectedInvoice.amountPaid}
                size="lg"
                color={Colors.primaryDark}
              />
            </View>

            {paystackSuccess ? (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>✓ Payment Verified ({paystackSuccess})</Text>
                <Text style={styles.successSubtext}>Electronic receipt issued and posted to sub-ledger.</Text>
              </View>
            ) : (
              <View style={styles.payActions}>
                <AppButton
                  title={isPaystackLoading ? 'Connecting Paystack...' : '💳 Pay with Paystack (Instant)'}
                  onPress={handlePaystackCheckout}
                  loading={isPaystackLoading}
                  size="md"
                  fullWidth
                  style={styles.paystackBtn}
                />
                <AppButton
                  title="🏦 Direct Bank Transfer (NIP)"
                  onPress={() => setIsBankModalOpen(true)}
                  variant="outline"
                  size="md"
                  fullWidth
                />
              </View>
            )}
          </AppCard>
        )}

        {/* Corporate Bank Transfer Guidelines */}
        <AppCard style={styles.bankInfoCard}>
          <Text style={styles.bankHeaderTitle}>Corporate Bank Transfer (NIP / RTGS)</Text>
          <Text style={styles.bankDesc}>
            Official corporate bank account details and wire transfer instructions will be provided directly by AR Multiventures finance administration for commercial settlements.
          </Text>

          <View style={styles.bankNoticeBox}>
            <Text style={styles.bankNoticeText}>
              ℹ️ To remit payments via direct bank transfer, request current verified corporate account numbers from your dedicated account officer or upload your stamped bank deposit slip below.
            </Text>
          </View>
        </AppCard>

        {/* Payment History */}
        <SectionHeader title="Payment History" subtitle="Verified transactions & receipts" />

        {payments.map((p) => (
          <AppCard key={p.id} style={styles.historyCard}>
            <View style={styles.histHeader}>
              <View>
                <Text style={styles.histRef}>{p.paymentReference}</Text>
                <Text style={styles.histDate}>{p.paymentDate} • {p.paymentMethod}</Text>
              </View>
              <StatusBadge status={p.status} size="sm" />
            </View>

            <View style={styles.histFooter}>
              <MoneyText amount={p.amount} size="md" color={Colors.primaryDark} />
              {p.receiptId && (
                <Text style={styles.receiptLink}>Receipt Available ✓</Text>
              )}
            </View>
          </AppCard>
        ))}
      </ScrollView>

      {/* Bank Transfer Submission Modal */}
      <Modal visible={isBankModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Bank Transfer Proof</Text>
            <Text style={styles.modalSubtitle}>
              Enter your NIP transaction session ID / reference and attach deposit receipt.
            </Text>

            <TextField
              label="Amount Paid (NGN)"
              value={transferAmount}
              onChangeText={setTransferAmount}
              keyboardType="numeric"
              required
            />

            <TextField
              label="Bank Reference / Session ID"
              value={transferRef}
              onChangeText={setTransferRef}
              placeholder="e.g. NIP-20260826-0918"
              required
            />

            <View style={styles.uploadBox}>
              <Text style={styles.uploadBoxIcon}>📎</Text>
              <Text style={styles.uploadBoxText}>Deposit Slip Attached: nip_slip_0918.jpg</Text>
            </View>

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                onPress={() => setIsBankModalOpen(false)}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <AppButton
                title={isSubmittingTransfer ? 'Submitting...' : 'Submit Proof'}
                onPress={handleSubmitBankTransfer}
                loading={isSubmittingTransfer}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  payCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
  },
  payCardTitle: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  payLabel: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  payValueBold: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  payActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  paystackBtn: {
    backgroundColor: Colors.primary,
  },
  successBanner: {
    backgroundColor: Colors.successLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  successBannerText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
  },
  successSubtext: {
    fontSize: 11,
    color: Colors.primaryDark,
    marginTop: 2,
  },
  bankInfoCard: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondaryDark,
  },
  bankHeaderTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  bankDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  bankNoticeBox: {
    backgroundColor: '#EFF6FF',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  bankNoticeText: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
  },
  historyCard: {
    backgroundColor: Colors.surface,
  },
  histHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  histRef: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  histDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  histFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  receiptLink: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  uploadBoxIcon: {
    fontSize: 18,
  },
  uploadBoxText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: Colors.primaryDark,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
