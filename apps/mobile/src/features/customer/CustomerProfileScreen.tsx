import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { AppCard, SectionHeader } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { DevDataBadge } from '../../components/common/DevDataBadge';
import { useAuth } from '../../services/authStore';

export function CustomerProfileScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { user, logout, switchRole } = useAuth();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Profile & Settings"
        subtitle="Corporate Identity & Security"
        onBack={() => onNavigate?.('tabs')}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {(user?.firstName?.[0] || 'B') + (user?.lastName?.[0] || 'A')}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userRoleText}>Corporate Procurement Officer</Text>
          <Text style={styles.companyNameText}>{user?.companyName}</Text>
          <DevDataBadge />
        </View>

        {/* Company & Profile Details Card */}
        <SectionHeader title="Corporate Identity" />
        <AppCard style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Company Name</Text>
            <Text style={styles.detailValueBold}>{user?.companyName || 'BuildCorp Nigeria Limited'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <Text style={styles.detailValue}>{user?.accountNumber || 'CUS-2026-0089'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email Address</Text>
            <Text style={styles.detailValue}>{user?.email || 'procurement@buildcorp.ng'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone Number</Text>
            <Text style={styles.detailValue}>{user?.phone || '+234 803 123 4567'}</Text>
          </View>
        </AppCard>

        {/* Switch Role Mode ONLY in Mock/Dev Mode */}
        {process.env.EXPO_PUBLIC_DATA_PROVIDER !== 'supabase' && (
          <>
            <SectionHeader title="Operational Role Simulation (DEV ONLY)" />
            <AppCard style={styles.card}>
              <Text style={styles.devNote}>
                Switch between Customer and Tipper Driver companion flows for field testing:
              </Text>
              <View style={styles.roleBtnRow}>
                <AppButton
                  title="Switch to Driver"
                  onPress={() => switchRole('DRIVER')}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </AppCard>
          </>
        )}

        {/* Account Actions */}
        <View style={styles.logoutSection}>
          <AppButton
            title="Sign Out of Account"
            onPress={logout}
            variant="danger"
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
    gap: 4,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    ...Shadows.md,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: Typography.sizes.subheading,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  userRoleText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.primaryDark,
  },
  companyNameText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
  },
  card: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.sizes.bodySm,
    color: Colors.textPrimary,
  },
  detailValueBold: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  devNote: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  roleBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  logoutSection: {
    marginTop: Spacing.md,
  },
});
