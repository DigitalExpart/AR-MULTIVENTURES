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
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { TextField } from '../../components/common/TextField';
import { ProgressBar } from '../../components/common/ProgressBar';
import { MoneyText } from '../../components/common/MoneyText';
import { resourceApi, requisitionApi } from '@ar-multiventures/api';
import type { Quarry, Material, Destination, TruckRecord, PriceQuoteBreakdown } from '@ar-multiventures/types';

export function NewRequisitionScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const [quarries, setQuarries] = useState<Quarry[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [trucks, setTrucks] = useState<TruckRecord[]>([]);

  const [selectedQuarryId, setSelectedQuarryId] = useState('qry-abeokuta');
  const [selectedMaterialId, setSelectedMaterialId] = useState('mat-granite-20mm');
  const [quantity, setQuantity] = useState(30);
  const [transportationType, setTransportationType] = useState<'company' | 'pickup' | 'haulage_only'>('company');
  const [selectedTruckTypeId, setSelectedTruckTypeId] = useState('trk-tipper-30t');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('dest-01');
  const [isCustomDestination, setIsCustomDestination] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState('Dangote Refinery Complex Site, Lekki, Lagos');
  const [deliveryDate, setDeliveryDate] = useState('2026-08-28');
  const [notes, setNotes] = useState('');

  // Live Price Quote State
  const [priceQuote, setPriceQuote] = useState<PriceQuoteBreakdown | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const isDataProviderMock = process.env.EXPO_PUBLIC_DATA_PROVIDER !== 'supabase';

  useEffect(() => {
    async function loadData() {
      try {
        const [qList, mList, dList, tList] = await Promise.all([
          resourceApi.getQuarries(),
          resourceApi.getMaterials(),
          resourceApi.getDestinations(),
          resourceApi.getTrucks(),
        ]);
        setQuarries(qList);
        setMaterials(mList);
        setDestinations(dList);
        setTrucks(tList);
        if (qList.length > 0) setSelectedQuarryId(qList[0].id);
        if (mList.length > 0) setSelectedMaterialId(mList[0].id);
        if (dList.length > 0) {
          setSelectedDestinationId(dList[0].id);
          setDestinationAddress(dList[0].address || dList[0].name);
        }
      } catch (err) {
        console.error('Failed to load resources for requisition wizard:', err);
      }
    }
    loadData();
  }, []);

  // Fetch live price quote when reaching Step 8 or inputs change
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
          destinationId: selectedDestinationId,
        });
        setPriceQuote(quote);
      } catch (err) {
        console.error('Price quote calculation failed:', err);
      } finally {
        setIsQuoteLoading(false);
      }
    }
    fetchQuote();
  }, [selectedQuarryId, selectedMaterialId, quantity, transportationType, selectedDestinationId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await requisitionApi.create({
        quarryId: selectedQuarryId,
        materialId: selectedMaterialId,
        quantity: Number(quantity),
        transportationType: transportationType === 'company' ? 'company' : 'pickup',
        truckId: selectedTruckTypeId,
        destination: destinationAddress,
        destinationAddress,
        deliveryDate,
        notes,
      });
      setSubmittedRef(result.requisitionNumber || 'REQ-2026-000042');
      setStep(9); // Outcome Confirmation Screen
    } catch (err: any) {
      alert(err.message || 'Failed to submit requisition');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Outcome Confirmation View
  if (step === 9) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Requisition Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your commercial aggregate request has been received and queued for commercial verification.
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
    <View style={styles.container}>
      <ScreenHeader
        title="New Requisition"
        subtitle={`Step ${step} of ${totalSteps} — ${
          step === 1 ? 'Select Quarry' :
          step === 2 ? 'Select Material' :
          step === 3 ? 'Order Quantity' :
          step === 4 ? 'Transportation' :
          step === 5 ? 'Truck Preference' :
          step === 6 ? 'Destination Site' :
          step === 7 ? 'Schedule & Notes' : 'Price Review'
        }`}
        onBack={() => (step > 1 ? setStep(step - 1) : onNavigate?.('tabs'))}
        rightAction={<Text style={styles.stepBadge}>{step}/{totalSteps}</Text>}
        showBack={true}
      />

      <ProgressBar progress={step / totalSteps} style={styles.topProgressBar} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Quarry Selection */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>1. Select Source Extraction Quarry</Text>
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
            <Text style={styles.stepHeading}>4. Transportation Option</Text>
            <Text style={styles.stepSubtitle}>Select whether AR Multiventures fulfills haulage or customer self-picks up.</Text>

            <AppCard
              onPress={() => setTransportationType('company')}
              style={[styles.optionCard, transportationType === 'company' && styles.selectedOptionCard]}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>🚛 AR Multiventures Haulage Delivery</Text>
                {transportationType === 'company' && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.optionDesc}>
                Full supply + haulage fulfillment with heavy tippers directly to your project site.
              </Text>
            </AppCard>

            <AppCard
              onPress={() => setTransportationType('pickup')}
              style={[styles.optionCard, transportationType === 'pickup' && styles.selectedOptionCard]}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>🏭 Self-Pickup at Quarry Plant</Text>
                {transportationType === 'pickup' && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.optionDesc}>
                Customer deploys own trucks to load directly at quarry extraction pit.
              </Text>
            </AppCard>

            <AppCard
              onPress={() => setTransportationType('haulage_only')}
              style={[styles.optionCard, transportationType === 'haulage_only' && styles.selectedOptionCard]}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>🚚 Haulage Only (Logistics Service)</Text>
                {transportationType === 'haulage_only' && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.optionDesc}>
                Logistics haulage transit between specified loading depot and delivery site.
              </Text>
            </AppCard>
          </View>
        )}

        {/* Step 5: Truck Type / Capacity Preference */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>5. Truck Type & Capacity Preference</Text>
            <Text style={styles.stepSubtitle}>
              {transportationType === 'pickup'
                ? 'Select the vehicle classification your drivers will deploy for quarry scale clearance.'
                : 'Select the optimal tipper configuration for site access and road conditions.'}
            </Text>

            {[
              { id: 'trk-tipper-30t', title: 'Heavy Tipper 30T (Sinotruk HOWO 6x4)', cap: '30 Tonnes Capacity', desc: 'Standard aggregate tipper for all regional highway corridors.' },
              { id: 'trk-heavy-45t', title: 'Articulated Tipper 45T (8x4 Chassis)', cap: '45 Tonnes Capacity', desc: 'High-volume haulage for large industrial foundation pours.' },
              { id: 'trk-std-20t', title: 'Standard Tipper 20T (4x2 / 6x2)', cap: '20 Tonnes Capacity', desc: 'Compact turning radius for restricted urban access sites.' },
            ].map((t) => {
              const isSelected = selectedTruckTypeId === t.id;
              return (
                <AppCard
                  key={t.id}
                  onPress={() => setSelectedTruckTypeId(t.id)}
                  style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>{t.title}</Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.optionDesc}>{t.desc}</Text>
                  <Text style={styles.optionCapacity}>{t.cap}</Text>
                </AppCard>
              );
            })}
          </View>
        )}

        {/* Step 6: Destination Selection */}
        {step === 6 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>6. Project Delivery Destination</Text>
            <Text style={styles.stepSubtitle}>Choose a verified pre-approved delivery location or enter new site address.</Text>

            {destinations.map((d) => {
              const isSelected = !isCustomDestination && selectedDestinationId === d.id;
              return (
                <AppCard
                  key={d.id}
                  onPress={() => {
                    setIsCustomDestination(false);
                    setSelectedDestinationId(d.id);
                    setDestinationAddress(d.address || d.name);
                  }}
                  style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>📍 {d.name}</Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.optionDesc}>{d.address || d.name} ({d.lga || d.state})</Text>
                  <Text style={styles.optionCapacity}>Distance: {d.distanceKm || 45} km from quarry</Text>
                </AppCard>
              );
            })}

            <AppCard
              onPress={() => setIsCustomDestination(true)}
              style={[styles.optionCard, isCustomDestination && styles.selectedOptionCard]}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>➕ Request New Delivery Site / Address</Text>
                {isCustomDestination && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.optionDesc}>
                Enter a new construction site address for route review and mileage calculation.
              </Text>
            </AppCard>

            {isCustomDestination && (
              <TextField
                label="New Delivery Site Address & LGA"
                value={destinationAddress}
                onChangeText={setDestinationAddress}
                placeholder="e.g. Plot 18, Commercial Avenue, Ikeja, Lagos"
                multiline
                numberOfLines={3}
                required
              />
            )}
          </View>
        )}

        {/* Step 7: Delivery Date & Notes */}
        {step === 7 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>7. Delivery Schedule & Instructions</Text>
            <Text style={styles.stepSubtitle}>Specify required delivery timeline and site receiving engineer notes.</Text>

            <TextField
              label="Requested Delivery Date (YYYY-MM-DD)"
              value={deliveryDate}
              onChangeText={setDeliveryDate}
              placeholder="e.g. 2026-08-28"
              required
            />

            <TextField
              label="Special Site Instructions (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Offload at Gate 2 Batching Plant. Contact Engr. Alabi upon arrival."
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Step 8: Price Quote Review & Final Submission */}
        {step === 8 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeading}>8. Commercial Price Quote Review</Text>
            <Text style={styles.stepSubtitle}>
              {isDataProviderMock
                ? 'Simulated commercial pricing breakdown based on active corridor haulage rates.'
                : 'Server-authoritative pricing calculated via PostgreSQL RPC engine.'}
            </Text>

            {isQuoteLoading ? (
              <View style={styles.quoteLoadingBox}>
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text style={styles.quoteLoadingText}>Calculating authoritative pricing breakdown...</Text>
              </View>
            ) : priceQuote ? (
              <AppCard style={styles.quoteCard}>
                <View style={styles.quoteHeaderRow}>
                  <Text style={styles.quoteCardTitle}>Pricing Breakdown</Text>
                  <Text style={styles.quoteCurrencyBadge}>NGN</Text>
                </View>

                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Pit-head Aggregate Base</Text>
                  <MoneyText amount={priceQuote.materialTotal} size="sm" />
                </View>

                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Corridor Haulage Fee</Text>
                  <MoneyText amount={priceQuote.haulageTotal} size="sm" />
                </View>

                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Quarry Loading Fee</Text>
                  <MoneyText amount={priceQuote.loadingTotal} size="sm" />
                </View>

                {priceQuote.discountTotal > 0 && (
                  <View style={styles.quoteRow}>
                    <Text style={styles.discountLabel}>Volume Discount Applied</Text>
                    <Text style={styles.discountVal}>-₦{priceQuote.discountTotal.toLocaleString()}</Text>
                  </View>
                )}

                <View style={styles.quoteTotalRow}>
                  <Text style={styles.quoteTotalLabel}>Total Commercial Quote</Text>
                  <MoneyText amount={priceQuote.totalCommercialPrice} size="lg" color={Colors.primaryDark} />
                </View>
              </AppCard>
            ) : (
              <Text style={styles.quoteErrorText}>Could not compute price quote. Please check connection.</Text>
            )}

            <Text style={styles.disclaimerText}>
              By submitting this requisition, you confirm the delivery specifications and agree to AR Multiventures standard commercial terms.
            </Text>
          </View>
        )}

        {/* Wizard Navigation Footer Button */}
        <View style={styles.navFooter}>
          {step < totalSteps ? (
            <AppButton
              title="Continue →"
              onPress={() => setStep(step + 1)}
              size="lg"
              fullWidth
            />
          ) : (
            <AppButton
              title={isSubmitting ? 'Submitting Requisition...' : 'Submit Requisition Now'}
              onPress={handleSubmit}
              loading={isSubmitting}
              size="lg"
              fullWidth
            />
          )}
        </View>
      </ScrollView>
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
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  topProgressBar: {
    height: 4,
    borderRadius: 0,
    backgroundColor: Colors.borderLight,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  stepContainer: {
    gap: Spacing.md,
  },
  stepHeading: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.xs,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  selectedOptionCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  checkmark: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.heavy,
    color: Colors.primaryDark,
  },
  optionDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  optionCapacity: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: Colors.primaryDark,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.secondaryLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activePresetBtn: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  presetText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  activePresetText: {
    color: '#FFFFFF',
  },
  truckCalculationText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.primaryDark,
    marginTop: -Spacing.xs,
  },
  quoteLoadingBox: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quoteLoadingText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  quoteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quoteCardTitle: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  quoteCurrencyBadge: {
    fontSize: 10,
    fontWeight: Typography.weights.heavy,
    color: Colors.primaryDark,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  quoteLabel: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  discountLabel: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
  },
  discountVal: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
  },
  quoteTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quoteTotalLabel: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  quoteErrorText: {
    fontSize: Typography.sizes.caption,
    color: Colors.danger,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: Spacing.xs,
  },
  navFooter: {
    marginTop: Spacing.xl,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    paddingVertical: Spacing.xs,
  },
  successLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
  },
  successValue: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  successValueBold: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.heavy,
    color: Colors.primaryDark,
  },
  successBtn: {
    marginBottom: Spacing.sm,
  },
});
