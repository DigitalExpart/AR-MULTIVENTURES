import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { AuthProvider } from './src/services/authStore';
import { OfflineProvider } from './src/services/offlineStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/theme';

export default function App() {
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
});
