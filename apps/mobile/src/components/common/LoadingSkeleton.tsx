import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { AppButton } from './AppButton';

export interface LoadingSkeletonProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function LoadingSkeleton({
  height = 20,
  width = '100%',
  borderRadius = BorderRadius.sm,
  style,
}: LoadingSkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
          width: width as any,
          borderRadius,
        },
        style,
      ]}
    />
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  actionTitle,
  onAction,
  icon,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.emptyContainer, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDesc}>{description}</Text>
      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.emptyBtn}
        />
      )}
    </View>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.errorContainer, style]}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorDesc}>{message}</Text>
      {onRetry && (
        <AppButton
          title="Try Again"
          onPress={onRetry}
          variant="secondary"
          size="sm"
          style={styles.retryBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
    marginVertical: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.sizes.bodyLg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  emptyBtn: {
    minWidth: 140,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginVertical: Spacing.md,
  },
  errorTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.danger,
    textAlign: 'center',
  },
  errorDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.secondaryDark,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  retryBtn: {
    minWidth: 120,
  },
});
