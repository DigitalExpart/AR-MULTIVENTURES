import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { TextField } from '../../components/common/TextField';
import { AppButton } from '../../components/common/AppButton';
import { DevDataBadge } from '../../components/common/DevDataBadge';
import { useAuth } from '../../services/authStore';

interface LoginScreenProps {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onBack?: () => void;
}

export function LoginScreen({
  onSignUp,
  onForgotPassword,
  onBack,
}: LoginScreenProps) {
  const { login, isDataProviderMock } = useAuth();
  const [email, setEmail] = useState('procurement@buildcorp.ng');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'CUSTOMER' | 'DRIVER'>('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login(email, role);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoCustomer = () => {
    setEmail('procurement@buildcorp.ng');
    setRole('CUSTOMER');
  };

  const handleQuickDemoDriver = () => {
    setEmail('driver.musa@armultiventures.com');
    setRole('DRIVER');
  };

  const topPadding = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 28) + 12;

  return (
    <View style={[styles.safeArea, { paddingTop: topPadding }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Top Nav Row */}
          {onBack && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onBack}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>← Welcome</Text>
            </TouchableOpacity>
          )}

          {/* Header Banner */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandLogo}>
                <Text style={styles.brandLogoText}>AR</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>AR MULTIVENTURES</Text>
                <Text style={styles.brandSubtitle}>Granite Supply & Logistics</Text>
              </View>
            </View>
            <DevDataBadge />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Sign In to Account</Text>
            <Text style={styles.instructionText}>
              Select your role and enter credentials to access orders, dispatch tracking, or driver missions.
            </Text>

            {/* Role Tab Selector */}
            <View style={styles.roleSelector}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setRole('CUSTOMER')}
                style={[styles.roleTab, role === 'CUSTOMER' && styles.activeRoleTab]}
              >
                <Text style={[styles.roleTabText, role === 'CUSTOMER' && styles.activeRoleTabText]}>
                  🏗️ Customer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setRole('DRIVER')}
                style={[styles.roleTab, role === 'DRIVER' && styles.activeRoleTab]}
              >
                <Text style={[styles.roleTabText, role === 'DRIVER' && styles.activeRoleTabText]}>
                  🚛 Tipper Driver
                </Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>⚠️ {error}</Text>
              </View>
            )}

            <TextField
              label="Work Email / Phone Number"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. name@company.ng"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              required
            />

            {/* Forgot Password Link */}
            {onForgotPassword && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onForgotPassword}
                style={styles.forgotPasswordRow}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <AppButton
              title={isLoading ? 'Signing In...' : `Sign In as ${role === 'CUSTOMER' ? 'Customer' : 'Driver'}`}
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              fullWidth
              style={styles.signInBtn}
            />

            {/* Sign Up Link */}
            {onSignUp && role === 'CUSTOMER' && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onSignUp}
                style={styles.signUpLink}
              >
                <Text style={styles.signUpLinkText}>
                  Don't have a business account?{' '}
                  <Text style={styles.signUpLinkBold}>Register Company</Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Quick Demo Credentials ONLY in Mock Mode */}
            {isDataProviderMock && (
              <View style={styles.demoSection}>
                <Text style={styles.demoHeading}>QUICK DEV ACCOUNTS</Text>
                <View style={styles.demoButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleQuickDemoCustomer}
                    style={styles.demoPill}
                  >
                    <Text style={styles.demoPillText}>Fill Customer (BuildCorp)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleQuickDemoDriver}
                    style={styles.demoPill}
                  >
                    <Text style={styles.demoPillText}>Fill Driver (Musa)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  backBtnText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.heavy,
    fontSize: Typography.sizes.headingSm,
  },
  brandTitle: {
    fontSize: Typography.sizes.subheading,
    fontWeight: Typography.weights.heavy,
    color: Colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
  },
  welcomeText: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  instructionText: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeRoleTab: {
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  roleTabText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  activeRoleTabText: {
    color: Colors.primaryDark,
    fontWeight: Typography.weights.bold,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  errorBoxText: {
    color: Colors.danger,
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  forgotPasswordText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  signInBtn: {
    marginTop: Spacing.xs,
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  signUpLinkText: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  signUpLinkBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  demoSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  demoHeading: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  demoPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
});
