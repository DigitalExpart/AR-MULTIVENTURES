import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { AppCard, SectionHeader } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { DevDataBadge } from '../../components/common/DevDataBadge';
import { useAuth } from '../../services/authStore';

export function CustomerProfileScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { user, logout, switchRole } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
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

        {/* Switch Role Mode */}
        <SectionHeader title="Operational Role Simulation" />
        <AppCard style={styles.card}>
          <Text style={styles.switchRoleDesc}>
            Switch between Customer procurement view and Heavy Tipper Driver transit view:
          </Text>
          <View style={styles.roleBtnRow}>
            <AppButton
              title="Customer Mode"
              onPress={() => switchRole('CUSTOMER')}
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
            />
            <AppButton
              title="Driver Mode 🚛"
              onPress={() => switchRole('DRIVER')}
              size="sm"
              style={{ flex: 1 }}
            />
          </View>
        </AppCard>

        {/* Logout Action */}
        <AppButton
          title="Sign Out of AR Multiventures"
          onPress={logout}
          variant="danger"
          size="md"
          fullWidth
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  avatarInitials: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  userRoleText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  companyNameText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  card: {
    backgroundColor: Colors.surface,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  switchRoleDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  roleBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  logoutBtn: {
    marginTop: Spacing.lg,
  },
});
