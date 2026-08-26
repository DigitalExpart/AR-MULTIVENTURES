import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Shadows } from '../theme';
import { CustomerHomeScreen } from '../features/customer/CustomerHomeScreen';
import { CustomerOrdersListScreen } from '../features/customer/CustomerOrdersListScreen';
import { CustomerDeliveriesScreen } from '../features/customer/CustomerDeliveriesScreen';
import { CustomerAccountScreen } from '../features/customer/CustomerAccountScreen';

export type CustomerTabKey = 'home' | 'orders' | 'deliveries' | 'account';

export function CustomerTabs({
  onNavigateScreen,
}: {
  onNavigateScreen: (screen: string, params?: any) => void;
}) {
  const [currentTab, setCurrentTab] = useState<CustomerTabKey>('home');

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <CustomerHomeScreen onNavigate={onNavigateScreen} />;
      case 'orders':
        return <CustomerOrdersListScreen onNavigate={onNavigateScreen} />;
      case 'deliveries':
        return <CustomerDeliveriesScreen onNavigate={onNavigateScreen} />;
      case 'account':
        return <CustomerAccountScreen onNavigate={onNavigateScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCurrentTab('home')}
          style={styles.tabItem}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.activeTabLabel]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCurrentTab('orders')}
          style={styles.tabItem}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.tabLabel, currentTab === 'orders' && styles.activeTabLabel]}>
            Orders
          </Text>
        </TouchableOpacity>

        {/* Central Floating "New Order" Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateScreen('new_requisition')}
          style={styles.floatingOrderBtn}
        >
          <Text style={styles.floatingIcon}>+</Text>
          <Text style={styles.floatingText}>Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCurrentTab('deliveries')}
          style={styles.tabItem}
        >
          <Text style={styles.tabIcon}>🚛</Text>
          <Text style={[styles.tabLabel, currentTab === 'deliveries' && styles.activeTabLabel]}>
            Deliveries
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCurrentTab('account')}
          style={styles.tabItem}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={[styles.tabLabel, currentTab === 'account' && styles.activeTabLabel]}>
            Account
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
    minWidth: 60,
  },
  tabIcon: {
    fontSize: 20,
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
  floatingOrderBtn: {
    backgroundColor: Colors.primary,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    ...Shadows.lg,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  floatingIcon: {
    fontSize: 22,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  floatingText: {
    fontSize: 9,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
    marginTop: -2,
    textTransform: 'uppercase',
  },
});
