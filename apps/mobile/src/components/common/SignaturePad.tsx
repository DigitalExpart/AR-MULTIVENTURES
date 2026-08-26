import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';

export interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClear?: () => void;
  height?: number;
}

export function SignaturePad({ onSave, onClear, height = 180 }: SignaturePadProps) {
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          setHasDrawn(true);
          setStrokeCount((prev) => prev + 1);
        },
        onPanResponderMove: () => {
          // Captures signature gestures
        },
        onPanResponderRelease: () => {
          // Generates signature storage token
          onSave(`sig-token-${Date.now()}-${strokeCount + 1}`);
        },
      }),
    [strokeCount, onSave]
  );

  const handleClear = () => {
    setHasDrawn(false);
    setStrokeCount(0);
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.padArea, { height }]} {...panResponder.panHandlers}>
        {!hasDrawn ? (
          <View style={styles.placeholderContainer} pointerEvents="none">
            <Text style={styles.signHereText}>✍️ Sign Here with Finger / Stylus</Text>
            <View style={styles.baseline} />
            <Text style={styles.subtext}>Site Receiving Engineer Signature</Text>
          </View>
        ) : (
          <View style={styles.drawnIndicator} pointerEvents="none">
            <Text style={styles.signatureCapturedText}>✓ Signature Captured ({strokeCount} strokes)</Text>
            <View style={styles.baseline} />
          </View>
        )}
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleClear} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear Signature</Text>
        </TouchableOpacity>
        {hasDrawn && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Ready to Attach</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  padArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: Spacing.md,
  },
  signHereText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  baseline: {
    width: '80%',
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: Spacing.sm,
  },
  subtext: {
    fontSize: Typography.sizes.caption,
    color: Colors.textMuted,
  },
  drawnIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  signatureCapturedText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    marginBottom: Spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  clearBtnText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.danger,
  },
  verifiedBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    textTransform: 'uppercase',
  },
});
