import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { TextField } from '../../components/common/TextField';
import { AppButton } from '../../components/common/AppButton';
import { DevDataBadge } from '../../components/common/DevDataBadge';
import { useAuth } from '../../services/authStore';

export function LoginScreen({ navigation }: { navigation?: any }) {
  const { login } = useAuth();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.instructionText}>
              Sign in to manage requisitions, track aggregate deliveries, or execute driver missions.
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
                <Text style={styles.errorBoxText}>{error}</Text>
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

            <AppButton
              title={isLoading ? 'Signing In...' : `Sign In as ${role === 'CUSTOMER' ? 'Customer' : 'Driver'}`}
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              fullWidth
              style={styles.signInBtn}
            />

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
    </SafeAreaView>
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
    padding: Spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  welcomeText: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  instructionText: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.secondaryLight,
    padding: 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  roleTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeRoleTab: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: '#FEE2E2',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorBoxText: {
    color: Colors.danger,
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
  },
  signInBtn: {
    marginTop: Spacing.sm,
  },
  demoSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
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
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  demoPill: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoPillText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
});
