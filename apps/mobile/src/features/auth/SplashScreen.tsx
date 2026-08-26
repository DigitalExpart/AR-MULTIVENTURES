import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../../theme';

interface SplashScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function SplashScreen({ onGetStarted, onSignIn }: SplashScreenProps) {
  const topPadding = Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 30) + 20;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074826" />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}>
        {/* Brand Hero Container */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>AR</Text>
          </View>
          <Text style={styles.brandTitle}>AR MULTIVENTURES</Text>
          <Text style={styles.brandTagline}>Granite Supply & Heavy Truck Haulage</Text>
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>🇳🇬 NIGERIA'S AGGREGATE LOGISTICS NETWORK</Text>
          </View>
        </View>

        {/* Feature Cards Showcase */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🏭</Text>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Certified Quarry Extraction</Text>
              <Text style={styles.featureDesc}>
                Direct pit-head granite aggregates (3/4", 1/2", 1", Stone Base, Dust).
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⚖️</Text>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Certified Weighbridge Scales</Text>
              <Text style={styles.featureDesc}>
                Automated gross & tare scale tickets with zero weight discrepancy.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💳</Text>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Paystack & Bank Settlement</Text>
              <Text style={styles.featureDesc}>
                Instant electronic proforma invoices, card checkouts, and receipts.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✍️</Text>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Digital Touchscreen POD</Text>
              <Text style={styles.featureDesc}>
                Site engineer vector signatures and offload photo proof of delivery.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onGetStarted}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Get Started — Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onSignIn}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>I already have an account → Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Enterprise Aggregate Supply & Commercial Transport Management
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074826', // Deep Pine Green brand canvas
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.lg,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  logoBadgeText: {
    fontSize: 34,
    fontWeight: Typography.weights.heavy,
    color: '#074826',
    letterSpacing: -1,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: '#D1FAE5',
    marginTop: 4,
    textAlign: 'center',
  },
  pillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  featureIcon: {
    fontSize: 26,
    marginRight: Spacing.md,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  featureDesc: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.regular,
    color: '#A7F3D0',
    marginTop: 2,
    lineHeight: 16,
  },
  actionContainer: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  primaryBtnText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.heavy,
    color: '#074826',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  secondaryBtnText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  footerNote: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
});
