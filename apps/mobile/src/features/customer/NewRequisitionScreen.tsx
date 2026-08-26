import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { TextField } from '../../components/common/TextField';
import { ProgressBar } from '../../components/common/ProgressBar';
import { MoneyText } from '../../components/common/MoneyText';
import { resourceApi, requisitionApi } from '@ar-multiventures/api';
import type { Quarry, Material, PriceQuoteBreakdown } from '@ar-multiventures/types';

export function NewRequisitionScreen({ onNavigate, onComplete }: { onNavigate?: (screen: string) => void; onComplete?: () => void }) {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const [quarries, setQuarries] = useState<Quarry[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedQuarryId, setSelectedQuarryId] = useState('qry-abeokuta');
  const [selectedMaterialId, setSelectedMaterialId] = useState('mat-granite-20mm');
  const [quantity, setQuantity] = useState(30);
  const [transportationType, setTransportationType] = useState<'company' | 'pickup' | 'haulage_only'>('company');
  const [destinationAddress, setDestinationAddress] = useState('Dangote Refinery Complex Site, Lekki, Lagos');
  const [deliveryDate, setDeliveryDate] = useState('2026-08-28');
  const [notes, setNotes] = useState('');

  // Live Price Quote State
  const [priceQuote, setPriceQuote] = useState<PriceQuoteBreakdown | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [qList, mList] = await Promise.all([
          resourceApi.getQuarries(),
          resourceApi.getMaterials(),
        ]);
        setQuarries(qList);
        setMaterials(mList);
        if (qList.length > 0) setSelectedQuarryId(qList[0].id);
        if (mList.length > 0) setSelectedMaterialId(mList[0].id);
      } catch (err) {
        console.error('Failed to load resources for requisition wizard:', err);
      }
    }
    loadData();
  }, []);

  // Fetch live price quote when reaching Step 6 or inputs change
  useEffect(() => {
    async function fetchQuote() {
      if (!selectedQuarryId || !selectedMaterialId || quantity < 1) return;
      setIsQuoteLoading(true);
      try {
        const quote = await requisitionApi.calculatePriceQuote({
          quarryId: selectedQuarryId,
          materialId: selectedMaterialId,
          quantity: Number(quantity),
          transportationType: transportationType === 'company' ? 'company' : 'pickup',
          destinationId: 'dest-01',
        });
        setPriceQuote(quote);
      } catch (err) {
        console.error('Price quote calculation failed:', err);
      } finally {
        setIsQuoteLoading(false);
      }
    }
    fetchQuote();
  }, [selectedQuarryId, selectedMaterialId, quantity, transportationType]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await requisitionApi.create({
        quarryId: selectedQuarryId,
        materialId: selectedMaterialId,
        quantity: Number(quantity),
        transportationType: transportationType === 'company' ? 'company' : 'pickup',
        truckId: 'trk-01',
        destination: destinationAddress,
        destinationAddress,
        deliveryDate,
        notes,
      });
      setSubmittedRef(result.requisitionNumber || 'REQ-2026-000042');
      setStep(8); // Success Step
    } catch (err: any) {
      alert(err.message || 'Failed to submit requisition');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 8: Success View
  if (step === 8) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Requisition Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your commercial aggregate request has been received and queued for sales verification.
          </Text>

          <AppCard style={styles.successDetailsCard}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Reference #</Text>
              <Text style={styles.successValueBold}>{submittedRef}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Quantity</Text>
              <Text style={styles.successValue}>{quantity} Tonnes</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Estimated Total</Text>
              <MoneyText amount={priceQuote?.totalCommercialPrice || 396000} size="md" />
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Delivery Date</Text>
              <Text style={styles.successValue}>{deliveryDate}</Text>
            </View>
          </AppCard>

          <AppButton
            title="View Order Status"
            onPress={() => onNavigate?.('orders')}
            size="lg"
            fullWidth
            style={styles.successBtn}
          />
          <AppButton
            title="Return to Dashboard"
            onPress={() => onNavigate?.('home')}
            variant="outline"
            size="md"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => (step > 1 ? setStep(step - 1) : onNavigate?.('home'))}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Requisition</Text>
        <Text style={styles.stepBadge}>Step {step} of {totalSteps}</Text>
      </View>

      <ProgressBar progress={step / totalSteps} style={styles.topProgressBar} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Quarry Selection */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>1. Select Source Quarry</Text>
            <Text style={styles.stepSubtitle}>Choose the certified extraction plant closest to your project site.</Text>
            {quarries.map((q) => {
              const isSelected = selectedQuarryId === q.id;
              return (
                <AppCard
                  key={q.id}
                  onPress={() => setSelectedQuarryId(q.id)}
                  style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>{q.name}</Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.optionDesc}>{q.location}, {q.state}</Text>
                  <Text style={styles.optionCapacity}>{q.operationalCapacityTonsPerDay.toLocaleString()} Tonnes/Day Cap.</Text>
                </AppCard>
              );
            })}
          </View>
        )}

        {/* Step 2: Material Selection */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>2. Select Aggregate Type</Text>
            <Text style={styles.stepSubtitle}>Crushed granite aggregates, stone base, and industrial quarry dust.</Text>
            {materials.map((m) => {
              const isSelected = selectedMaterialId === m.id;
              return (
                <AppCard
                  key={m.id}
                  onPress={() => setSelectedMaterialId(m.id)}
                  style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>{m.name}</Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.optionDesc}>{m.description || 'Standard high-strength aggregate'}</Text>
                </AppCard>
              );
            })}
          </View>
        )}

        {/* Step 3: Quantity */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>3. Order Quantity</Text>
            <Text style={styles.stepSubtitle}>Standard 30-tonne tipper capacity increments.</Text>

            <View style={styles.presetsRow}>
              {[30, 60, 90, 150, 300].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  activeOpacity={0.7}
                  onPress={() => setQuantity(preset)}
                  style={[styles.presetBtn, quantity === preset && styles.activePresetBtn]}
                >
                  <Text style={[styles.presetText, quantity === preset && styles.activePresetText]}>
                    {preset}T
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextField
              label="Tonnage (Tonnes)"
              value={String(quantity)}
              onChangeText={(v) => setQuantity(Number(v) || 0)}
              keyboardType="numeric"
              required
            />
            <Text style={styles.truckCalculationText}>
              ≈ {Math.ceil(quantity / 30)} Heavy Tipper {Math.ceil(quantity / 30) === 1 ? 'Trip' : 'Trips'} (30 Tonnes / Truck)
            </Text>
          </View>
        )}

        {/* Step 4: Transportation */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>4. Transportation Mode</Text>
            <Text style={styles.stepSubtitle}>Select haulage and logistics option.</Text>

            <AppCard
              onPress={() => setTransportationType('company')}
              style={[styles.optionCard, transportationType === 'company' && styles.selectedOptionCard]}
            >
              <Text style={styles.optionTitle}>🚛 AR Multiventures Delivery (Recommended)</Text>
              <Text style={styles.optionDesc}>Full supply & dedicated haulage to your construction site.</Text>
            </AppCard>

            <AppCard
              onPress={() => setTransportationType('pickup')}
              style={[styles.optionCard, transportationType === 'pickup' && styles.selectedOptionCard]}
            >
              <Text style={styles.optionTitle}>🏭 Self-Pickup at Quarry Pit-Head</Text>
              <Text style={styles.optionDesc}>You arrange your own licensed trucks for loading at quarry dock.</Text>
            </AppCard>

            <AppCard
              onPress={() => setTransportationType('haulage_only')}
              style={[styles.optionCard, transportationType === 'haulage_only' && styles.selectedOptionCard]}
            >
              <Text style={styles.optionTitle}>🛣️ Haulage Only</Text>
              <Text style={styles.optionDesc}>Transport pre-purchased aggregate from pit-head to site.</Text>
            </AppCard>
          </View>
        )}

        {/* Step 5: Destination */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>5. Delivery Site Destination</Text>
            <Text style={styles.stepSubtitle}>Provide site address and receiving engineer contact details.</Text>

            <TextField
              label="Site Address / Location"
              value={destinationAddress}
              onChangeText={setDestinationAddress}
              placeholder="e.g. Plot 4, Coastal Road Extension, Lekki Phase 1, Lagos"
              required
            />
          </View>
        )}

        {/* Step 6: Delivery Schedule */}
        {step === 6 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>6. Requested Delivery Date</Text>
            <Text style={styles.stepSubtitle}>Schedule when site offloading should commence.</Text>

            <TextField
              label="Delivery Date (YYYY-MM-DD)"
              value={deliveryDate}
              onChangeText={setDeliveryDate}
              placeholder="2026-08-28"
              required
            />

            <TextField
              label="Special Delivery Instructions"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Call site supervisor 1 hour prior to arrival."
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Step 7: Commercial Price Quote Review */}
        {step === 7 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>7. Commercial Price Review</Text>
            <Text style={styles.stepSubtitle}>Authoritative quote calculated using the 7-level pricing engine.</Text>

            {isQuoteLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Calculating pit-head pricing and corridor haulage...</Text>
              </View>
            ) : priceQuote ? (
              <AppCard style={styles.quoteCard}>
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Material Base ({quantity}T)</Text>
                  <MoneyText amount={priceQuote.materialCostTotal} size="sm" />
                </View>
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Haulage Freight</Text>
                  <MoneyText amount={priceQuote.haulageCostTotal} size="sm" />
                </View>
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Pit-Head Loading Fee</Text>
                  <MoneyText amount={priceQuote.loadingCostTotal} size="sm" />
                </View>
                {priceQuote.discountTotal > 0 && (
                  <View style={styles.quoteRow}>
                    <Text style={[styles.quoteLabel, { color: Colors.success }]}>Volume Discount</Text>
                    <Text style={{ color: Colors.success, fontWeight: 'bold' }}>
                      -₦{priceQuote.discountTotal.toLocaleString()}
                    </Text>
                  </View>
                )}
                <View style={[styles.quoteRow, styles.quoteTotalRow]}>
                  <Text style={styles.quoteTotalLabel}>Total Commercial Quote</Text>
                  <MoneyText amount={priceQuote.totalCommercialPrice} size="lg" color={Colors.primaryDark} />
                </View>
              </AppCard>
            ) : null}
          </View>
        )}

        {/* Wizard Navigation Footer */}
        <View style={styles.wizardFooter}>
          {step < totalSteps ? (
            <AppButton
              title="Continue →"
              onPress={() => setStep(step + 1)}
              size="lg"
              fullWidth
            />
          ) : (
            <AppButton
              title={isSubmitting ? 'Submitting Requisition...' : 'Submit Commercial Requisition'}
              onPress={handleSubmit}
              loading={isSubmitting}
              size="lg"
              fullWidth
              style={styles.submitOrderBtn}
            />
          )}
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
  stepBadge: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.semibold,
  },
  topProgressBar: {
    marginVertical: 0,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  stepContainer: {
    marginBottom: Spacing.xl,
  },
  stepHeading: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  optionCard: {
    marginBottom: Spacing.md,
    borderColor: Colors.border,
  },
  selectedOptionCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  checkmark: {
    color: Colors.primary,
    fontWeight: Typography.weights.heavy,
    fontSize: Typography.sizes.subheading,
  },
  optionDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  optionCapacity: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    marginTop: Spacing.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  activePresetBtn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  presetText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  activePresetText: {
    color: Colors.primaryDark,
  },
  truckCalculationText: {
    fontSize: Typography.sizes.caption,
    color: Colors.primaryDark,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.xs,
  },
  quoteCard: {
    backgroundColor: Colors.surface,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  quoteLabel: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  quoteTotalRow: {
    borderBottomWidth: 0,
    paddingTop: Spacing.md,
  },
  quoteTotalLabel: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  loadingBox: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  loadingText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  wizardFooter: {
    marginTop: Spacing.xl,
  },
  submitOrderBtn: {
    backgroundColor: Colors.primary,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successCheck: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.heavy,
    color: Colors.success,
  },
  successTitle: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  successDetailsCard: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  successLabel: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  successValue: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  successValueBold: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.heavy,
    color: Colors.primaryDark,
  },
  successBtn: {
    marginBottom: Spacing.md,
  },
});
