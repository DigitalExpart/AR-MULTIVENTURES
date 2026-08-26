import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';

export interface ProgressBarProps {
  progress: number; // 0 to 1 or 0 to 100
  color?: string;
  backgroundColor?: string;
  height?: number;
  showPercent?: boolean;
  label?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  color = Colors.primary,
  backgroundColor = Colors.border,
  height = 8,
  showPercent = false,
  label,
  style,
}: ProgressBarProps) {
  const normalized = Math.min(100, Math.max(0, progress <= 1 ? progress * 100 : progress));

  return (
    <View style={[styles.container, style]}>
      {(label || showPercent) && (
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {showPercent && (
            <Text style={styles.percentText}>{Math.round(normalized)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${normalized}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  percentText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  track: {
    width: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
