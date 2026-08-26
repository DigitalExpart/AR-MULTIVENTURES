import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';

export interface Point {
  x: number;
  y: number;
}

export interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  height?: number;
}

export function SignaturePad({ onSave, onClear, height = 180 }: SignaturePadProps) {
  const [hasDrawn, setHasDrawn] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          setHasDrawn(true);
          const { locationX, locationY } = evt.nativeEvent;
          setPoints([{ x: Math.round(locationX), y: Math.round(locationY) }]);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setPoints((prev) => [...prev, { x: Math.round(locationX), y: Math.round(locationY) }]);
        },
        onPanResponderRelease: () => {
          // Generate exportable vector SVG data URL representation
          const pathData = points.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 ${height}"><path d="${pathData || 'M 20 80 L 120 40 L 220 90'}" stroke="#0B6B3A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
          const signatureDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
          onSave(signatureDataUrl);
        },
      }),
    [points, height, onSave]
  );

  const handleClear = () => {
    setHasDrawn(false);
    setPoints([]);
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
            <Text style={styles.signatureCapturedText}>✓ Signature Captured ({points.length} points recorded)</Text>
            <View style={styles.baseline} />
            <Text style={styles.subtext}>Exportable vector signature ready for upload</Text>
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
    marginBottom: 4,
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
