import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';

export interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof Spacing;
}

export function AppCard({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 'lg',
}: AppCardProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.border,
          ...Shadows.sm,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.surface,
          borderWidth: 1.5,
          borderColor: Colors.border,
        };
      case 'flat':
        return {
          backgroundColor: Colors.secondaryLight,
        };
    }
  };

  const containerStyle: ViewStyle = {
    borderRadius: BorderRadius.lg,
    padding: Spacing[padding],
    ...getVariantStyle(),
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={containerStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightActionText?: string;
  onRightAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  subtitle,
  rightActionText,
  onRightAction,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.headerContainer, style]}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightActionText && onRightAction && (
        <TouchableOpacity activeOpacity={0.7} onPress={onRightAction} style={styles.actionBtn}>
          <Text style={styles.actionText}>{rightActionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.subheading,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  actionText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
