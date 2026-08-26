import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { TextField } from '../../components/common/TextField';
import { AppButton } from '../../components/common/AppButton';
import { useAuth } from '../../services/authStore';

interface SignUpScreenProps {
  onSignIn: () => void;
  onBack: () => void;
}

export function SignUpScreen({ onSignIn, onBack }: SignUpScreenProps) {
  const { login } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [stateRegion, setStateRegion] = useState('Lagos');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!companyName.trim()) {
      setError('Please enter your registered company name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a direct contact phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate / perform registration
      await new Promise((r) => setTimeout(r, 800));
      // Log the customer in automatically
      await login(email, 'CUSTOMER');
      onSignIn();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Create Business Account"
        subtitle="Commercial Granite Procurement"
        onBack={onBack}
        showBack={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Note */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🏗️ Corporate Customer Onboarding</Text>
            <Text style={styles.infoDesc}>
              Register your company to request pit-head granite pricing, proforma invoices, automated dispatch tracking, and digital weighbridge tickets.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formSection}>
            <TextField
              label="Company / Trading Name *"
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. BuildCorp Nigeria Limited"
            />

            <TextField
              label="Contact Person Name *"
              value={contactName}
              onChangeText={setContactName}
              placeholder="e.g. Engr. Babatunde Alabi"
            />

            <TextField
              label="Corporate Work Email *"
              value={email}
              onChangeText={setEmail}
              placeholder="procurement@company.ng"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextField
              label="Direct Phone Number *"
              value={phone}
              onChangeText={setPhone}
              placeholder="+234 803 123 4567"
              keyboardType="phone-pad"
            />

            <TextField
              label="CAC Registration Number (Optional)"
              value={rcNumber}
              onChangeText={setRcNumber}
              placeholder="RC-1489201"
            />

            <TextField
              label="Operating State / Region"
              value={stateRegion}
              onChangeText={setStateRegion}
              placeholder="Lagos, Ogun, Oyo, etc."
            />

            <TextField
              label="Account Password *"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <TextField
              label="Confirm Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          </View>

          {/* Submit Action */}
          <View style={styles.submitSection}>
            <AppButton
              title={isLoading ? 'Creating Account...' : 'Complete Registration'}
              onPress={handleRegister}
              loading={isLoading}
              variant="primary"
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onSignIn}
              style={styles.loginLink}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: Spacing.xxxl,
  },
  infoCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoTitle: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
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
  formSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  submitSection: {
    marginTop: Spacing.sm,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  loginLinkText: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  loginLinkBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
