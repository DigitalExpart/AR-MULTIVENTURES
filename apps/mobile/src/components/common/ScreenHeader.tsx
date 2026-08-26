import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Colors, Spacing, Typography, Shadows } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showBack?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  showBack = true,
}: ScreenHeaderProps) {
  const topPadding = Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 28) + 8;

  return (
    <View style={[styles.headerContainer, { paddingTop: topPadding }]}>
      <View style={styles.headerRow}>
        {showBack && onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightContainer}>
          {rightAction || <View style={styles.backPlaceholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    ...Shadows.sm,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: Typography.weights.heavy,
    color: Colors.textPrimary,
    marginTop: -2,
  },
  backPlaceholder: {
    width: 38,
    height: 38,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.subheading,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  rightContainer: {
    minWidth: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
