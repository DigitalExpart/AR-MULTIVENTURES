import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: AppButtonProps) {
  const getVariantContainerStyle = (): ViewStyle => {
    if (disabled) return styles.disabledContainer;
    switch (variant) {
      case 'primary':
        return styles.primaryContainer;
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'ghost':
        return styles.ghostContainer;
    }
  };

  const getVariantTextStyle = (): TextStyle => {
    if (disabled) return styles.disabledText;
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'ghost':
        return styles.ghostText;
    }
  };

  const getSizeContainerStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return styles.smContainer;
      case 'md':
        return styles.mdContainer;
      case 'lg':
        return styles.lgContainer;
    }
  };

  const getSizeTextStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return styles.smText;
      case 'md':
        return styles.mdText;
      case 'lg':
        return styles.lgText;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseContainer,
        getSizeContainerStyle(),
        getVariantContainerStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.baseText, getSizeTextStyle(), getVariantTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  baseText: {
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  // Sizes (Ensures >= 44px touch target)
  smContainer: {
    minHeight: 38,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  mdContainer: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  lgContainer: {
    minHeight: 56,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  smText: {
    fontSize: Typography.sizes.caption,
  },
  mdText: {
    fontSize: Typography.sizes.body,
  },
  lgText: {
    fontSize: Typography.sizes.bodyLg,
  },
  // Variants
  primaryContainer: {
    backgroundColor: Colors.primary,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryContainer: {
    backgroundColor: Colors.secondaryDark,
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  outlineText: {
    color: Colors.primary,
  },
  dangerContainer: {
    backgroundColor: Colors.danger,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: Colors.primary,
  },
  disabledContainer: {
    backgroundColor: Colors.border,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});
