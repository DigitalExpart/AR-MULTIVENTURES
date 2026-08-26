import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { TextField } from '../../components/common/TextField';
import { SignaturePad } from '../../components/common/SignaturePad';
import { useOffline } from '../../services/offlineStore';
import { deliveryApi } from '@ar-multiventures/api';

export function DriverPodCaptureScreen({
  route,
  onNavigate,
}: {
  route?: { params?: { tripId?: string } };
  onNavigate?: (screen: string) => void;
}) {
  const tripId = route?.params?.tripId || 'trp-01';
  const { isOnline, stageOfflinePod } = useOffline();

  const [receiverName, setReceiverName] = useState('Engr. Babatunde Alabi');
  const [receiverRole, setReceiverRole] = useState('Site Receiving Engineer');
  const [receiverPhone, setReceiverPhone] = useState('+234 802 334 9988');
  const [deliveredTonnes, setDeliveredTonnes] = useState('30.05');
  const [signatureToken, setSignatureToken] = useState<string | null>('sig-captured-valid');
  const [driverRemarks, setDriverRemarks] = useState('Smooth transit via Sagamu-Epe corridor');
  const [photos, setPhotos] = useState<string[]>(['photo_offload_01.jpg', 'photo_offload_02.jpg']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stagedOfflineId, setStagedOfflineId] = useState<string | null>(null);

  const handleSimulateAddPhoto = () => {
    setPhotos((prev) => [...prev, `photo_offload_0${prev.length + 1}.jpg`]);
  };

  const handleSubmitPod = async () => {
    if (!signatureToken) {
      alert('Please obtain site engineer signature before submitting POD.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isOnline) {
        // Stage in local offline mutation queue
        const key = await stageOfflinePod({
          tripId,
          tripNumber: 'TRP-2026-000104',
          receiverName,
          receiverPhone,
          receiverDesignation: receiverRole,
          deliveredQuantityTonnes: Number(deliveredTonnes),
          signatureBase64: signatureToken,
          photoUris: photos,
          driverRemarks,
        });
        setStagedOfflineId(key);
        setIsSuccess(true);
      } else {
        // Online live submission
        await deliveryApi.recordTripPod({
          tripId,
          receiverName,
          receiverPhone,
          receiverDesignation: receiverRole,
          deliveredQuantityTonnes: Number(deliveredTonnes),
          signatureStoragePath: `pod-signatures/${tripId}.svg`,
          photoStoragePaths: photos,
          driverRemarks,
        });
        setIsSuccess(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit POD');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="POD Confirmed" subtitle="Proof of Delivery" showBack={false} />
        <View style={styles.successContainer}>
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>✓</Text>
          </View>
          <Text style={styles.successHeading}>
            {stagedOfflineId ? 'POD Staged Locally (Offline)' : 'Proof of Delivery Confirmed!'}
          </Text>
          <Text style={styles.successSubtitle}>
            {stagedOfflineId
              ? 'Stored securely in your mobile outbox. Will automatically sync to server once network connectivity resumes.'
              : 'Trip marked DELIVERED and truck returned to available status.'}
          </Text>

          <AppButton
            title="Return to Driver Missions"
            onPress={() => onNavigate?.('tabs')}
            size="lg"
            fullWidth
            style={styles.returnBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Capture Digital POD"
        subtitle="Site Engineer Signature & Offload Evidence"
        onBack={() => onNavigate?.('driver_active_trip')}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Offline Warning Banner */}
        {!isOnline && (
          <View style={styles.offlineBox}>
            <Text style={styles.offlineBoxText}>
              ⚠️ Working Offline — Signature & photos will be staged locally and synced when connection resumes.
            </Text>
          </View>
        )}

        <AppCard style={styles.formCard}>
          <Text style={styles.formTitle}>Site Receiving Verification</Text>
          <Text style={styles.formSubtitle}>
            Obtain details from the authorized site engineer receiving the granite delivery.
          </Text>

          <TextField
            label="Receiving Engineer / Supervisor Name"
            value={receiverName}
            onChangeText={setReceiverName}
            placeholder="e.g. Engr. Babatunde Alabi"
            required
          />

          <TextField
            label="Designation / Site Role"
            value={receiverRole}
            onChangeText={setReceiverRole}
            placeholder="e.g. Site Receiving Engineer"
            required
          />

          <TextField
            label="Receiver Phone Number"
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            keyboardType="phone-pad"
            required
          />

          <TextField
            label="Delivered Quantity (Tonnes)"
            value={deliveredTonnes}
            onChangeText={setDeliveredTonnes}
            keyboardType="numeric"
            required
          />

          {/* Signature Capture Pad */}
          <Text style={styles.sectionLabel}>Touchscreen Digital Signature *</Text>
          <SignaturePad onSave={(token) => setSignatureToken(token)} />

          {/* Delivery Site Photos */}
          <View style={styles.photosHeader}>
            <Text style={styles.sectionLabel}>Delivery Offload Photos ({photos.length})</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleSimulateAddPhoto} style={styles.addPhotoBtn}>
              <Text style={styles.addPhotoText}>+ Snap Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photosGrid}>
            {photos.map((p, idx) => (
              <View key={idx} style={styles.photoThumb}>
                <Text style={styles.photoThumbText}>📸 {p}</Text>
              </View>
            ))}
          </View>

          <TextField
            label="Driver Transit Remarks (Optional)"
            value={driverRemarks}
            onChangeText={setDriverRemarks}
            placeholder="e.g. Smooth highway transit, offloaded at bay 2."
            multiline
            numberOfLines={2}
          />

          <AppButton
            title={isSubmitting ? 'Submitting POD...' : isOnline ? 'Submit Digital POD' : 'Stage Offline POD'}
            onPress={handleSubmitPod}
            loading={isSubmitting}
            size="lg"
            fullWidth
            style={styles.submitBtn}
          />
        </AppCard>
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  offlineBox: {
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: Spacing.md,
  },
  offlineBoxText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: '#92400E',
  },
  formCard: {
    backgroundColor: Colors.surface,
  },
  formTitle: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  formSubtitle: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addPhotoBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  addPhotoText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  photoThumb: {
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoThumbText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
  },
  submitBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successBadgeText: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.heavy,
    color: Colors.success,
  },
  successHeading: {
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
  returnBtn: {
    marginTop: Spacing.md,
  },
});
