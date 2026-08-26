import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text } from 'react-native';
import { AuthProvider } from './src/services/authStore';
import { OfflineProvider } from './src/services/offlineStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors, Spacing, Typography } from './src/theme';

export default function App() {
  // Production Safety Guard: Prohibit accidental production releases with mock data provider
  const isProductionRelease = process.env.NODE_ENV === 'production' && !__DEV__;
  const isMockProvider = process.env.EXPO_PUBLIC_DATA_PROVIDER === 'mock';

  if (isProductionRelease && isMockProvider) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>🚨 CONFIGURATION SAFETY ERROR</Text>
          <Text style={styles.errorMessage}>
            This production build is configured with EXPO_PUBLIC_DATA_PROVIDER=mock.
            Production releases must connect to authoritative hosted backend (EXPO_PUBLIC_DATA_PROVIDER=supabase).
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AuthProvider>
      <OfflineProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
          <RootNavigator />
        </SafeAreaView>
      </OfflineProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  errorTitle: {
    fontSize: Typography.sizes.headingSm,
    fontWeight: Typography.weights.heavy,
    color: '#DC2626',
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: Typography.sizes.bodySm,
    color: '#7F1D1D',
    lineHeight: 20,
  },
});
