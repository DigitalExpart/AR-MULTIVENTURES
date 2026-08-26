import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const normalized = (status || '').toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case 'DELIVERED':
      case 'PAID':
      case 'COMPLETED':
      case 'APPROVED':
      case 'OPERATIONAL':
      case 'CLEARED_CASH':
      case 'CLEARED_CREDIT':
      case 'CONFIRMED':
        return {
          bg: Colors.successLight,
          text: Colors.success,
          border: '#A7F3D0',
          label: normalized.replace(/_/g, ' '),
        };
      case 'IN_TRANSIT':
      case 'DISPATCHED':
      case 'LOADING':
      case 'SUBMITTED':
      case 'SCHEDULED':
      case 'PARTIALLY_PAID':
      case 'DUE_FOR_SERVICE':
        return {
          bg: Colors.warningLight,
          text: Colors.warning,
          border: '#FDE68A',
          label: normalized.replace(/_/g, ' '),
        };
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
      case 'OVERDUE':
      case 'BLOCKED':
      case 'GROUNDED':
        return {
          bg: Colors.dangerLight,
          text: Colors.danger,
          border: '#FECACA',
          label: normalized.replace(/_/g, ' '),
        };
      case 'DRAFT':
      case 'UNPAID':
      case 'AVAILABLE':
      case 'PENDING':
      default:
        return {
          bg: Colors.secondaryLight,
          text: Colors.secondaryDark,
          border: Colors.border,
          label: normalized.replace(/_/g, ' ') || 'UNKNOWN',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: config.text },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    gap: 4,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: Typography.sizes.caption,
  },
});
