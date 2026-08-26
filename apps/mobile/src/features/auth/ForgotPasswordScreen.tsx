import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { TextField } from '../../components/common/TextField';
import { AppButton } from '../../components/common/AppButton';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate password reset request
      await new Promise((r) => setTimeout(r, 600));
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Reset Password"
        subtitle="Account Recovery"
        onBack={onBack}
        showBack={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isSubmitted ? (
            <View style={styles.successCard}>
              <View style={styles.successIconBadge}>
                <Text style={styles.successIcon}>✉️</Text>
              </View>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successMessage}>
                We have sent password reset instructions to <Text style={styles.emailBold}>{email}</Text>. Please check your inbox and spam folder.
              </Text>
              <AppButton
                title="Return to Sign In"
                onPress={onBack}
                variant="primary"
              />
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.headerIconRow}>
                <View style={styles.iconCircle}>
                  <Text style={styles.headerEmoji}>🔒</Text>
                </View>
              </View>

              <Text style={styles.promptTitle}>Forgot Your Password?</Text>
              <Text style={styles.promptDesc}>
                Enter the corporate email associated with your AR Multiventures account and we'll send you instructions to reset your password.
              </Text>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              <TextField
                label="Registered Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="procurement@buildcorp.ng"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.actionRow}>
                <AppButton
                  title={isLoading ? 'Sending Instructions...' : 'Send Reset Link'}
                  onPress={handleSendReset}
                  loading={isLoading}
                  variant="primary"
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onBack}
                  style={styles.backLink}
                >
                  <Text style={styles.backLinkText}>← Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  headerIconRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 28,
  },
  promptTitle: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  promptDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.xl,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
  },
  actionRow: {
    marginTop: Spacing.md,
  },
  backLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backLinkText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  successIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    fontSize: 34,
  },
  successTitle: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  successMessage: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  emailBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
});
