import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Shadows } from '../theme';
import { DriverHomeScreen } from '../features/driver/DriverHomeScreen';
import { DriverTripsListScreen } from '../features/driver/DriverTripsListScreen';
import { CustomerProfileScreen } from '../features/customer/CustomerProfileScreen';

export type DriverTabKey = 'home' | 'trips' | 'profile';

export function DriverTabs({
  onNavigateScreen,
}: {
  onNavigateScreen: (screen: string, params?: any) => void;
}) {
  const [currentTab, setCurrentTab] = useState<DriverTabKey>('home');

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <DriverHomeScreen onNavigate={onNavigateScreen} />;
      case 'trips':
        return <DriverTripsListScreen onNavigate={onNavigateScreen} />;
      case 'profile':
        return <CustomerProfileScreen onNavigate={onNavigateScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Driver Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCurrentTab('home')}
          style={styles.tabItem}
        >
          <Text style={styles.tabIcon}>🚛</Text>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.activeTabLabel]}>
            Shift Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCurrentTab('trips')}
          style={styles.tabItem}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.tabLabel, currentTab === 'trips' && styles.activeTabLabel]}>
            Missions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCurrentTab('profile')}
          style={styles.tabItem}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={[styles.tabLabel, currentTab === 'profile' && styles.activeTabLabel]}>
            Driver Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.xs,
    paddingBottom: Spacing.sm,
    ...Shadows.md,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    minWidth: 80,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeTabLabel: {
    color: Colors.primaryDark,
    fontWeight: Typography.weights.heavy,
  },
});
