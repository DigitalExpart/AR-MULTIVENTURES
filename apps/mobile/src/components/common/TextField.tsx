import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export function TextField({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  required,
  style,
  secureTextEntry,
  ...props
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedInputWrapper,
          !!error && styles.errorInputWrapper,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry ? !isPasswordVisible : false}
          {...props}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={styles.togglePasswordText}>
              {isPasswordVisible ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  required: {
    color: Colors.danger,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  focusedInputWrapper: {
    borderColor: Colors.primary,
  },
  errorInputWrapper: {
    borderColor: Colors.danger,
    backgroundColor: '#FEF2F2',
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  togglePasswordText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  errorText: {
    fontSize: Typography.sizes.caption,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  helperText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
