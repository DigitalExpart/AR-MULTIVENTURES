import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useAuth } from '../../services/authStore';
import { useOffline } from '../../services/offlineStore';

export function DevDataBadge() {
  const { isDataProviderMock } = useAuth();

  if (!isDataProviderMock) return null;

  return (
    <View style={styles.devBadge}>
      <View style={styles.devDot} />
      <Text style={styles.devText}>DEV MOCK DATA</Text>
    </View>
  );
}

export function OfflineBanner() {
  const { isOnline, mutationQueue, pendingCount, syncPendingMutations } = useOffline();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncPendingMutations();
    setIsSyncing(false);
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <View style={[styles.bannerContainer, !isOnline ? styles.offlineBg : styles.syncBg]}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerText}>
          {!isOnline
            ? '⚠️ OFFLINE MODE — Actions staged locally'
            : `🔄 ${pendingCount} pending mutation${pendingCount === 1 ? '' : 's'} to sync`}
        </Text>
        {isOnline && pendingCount > 0 && (
          <TouchableOpacity activeOpacity={0.7} onPress={handleSync} disabled={isSyncing} style={styles.syncBtn}>
            <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  devDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  devText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: '#92400E',
    letterSpacing: 0.5,
  },
  bannerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  offlineBg: {
    backgroundColor: '#DC2626',
  },
  syncBg: {
    backgroundColor: '#D97706',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
  },
  syncBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  syncBtnText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
});
