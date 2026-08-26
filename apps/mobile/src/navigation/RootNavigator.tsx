import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme';
import { useAuth } from '../services/authStore';
import { LoginScreen } from '../features/auth/LoginScreen';
import { CustomerTabs } from './CustomerTabs';
import { DriverTabs } from './DriverTabs';

// Customer Stack Screens
import { NewRequisitionScreen } from '../features/customer/NewRequisitionScreen';
import { CustomerOrderDetailScreen } from '../features/customer/CustomerOrderDetailScreen';
import { CustomerDeliveryDetailScreen } from '../features/customer/CustomerDeliveryDetailScreen';
import { CustomerInvoicesScreen } from '../features/customer/CustomerInvoicesScreen';
import { CustomerPaymentsScreen } from '../features/customer/CustomerPaymentsScreen';
import { CustomerNotificationsScreen } from '../features/customer/CustomerNotificationsScreen';
import { CustomerProfileScreen } from '../features/customer/CustomerProfileScreen';

// Driver Stack Screens
import { DriverActiveTripScreen } from '../features/driver/DriverActiveTripScreen';
import { DriverPodCaptureScreen } from '../features/driver/DriverPodCaptureScreen';

export function RootNavigator() {
  const { isAuthenticated, activeRole } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<string>('tabs');
  const [screenParams, setScreenParams] = useState<any>(null);

  const handleNavigate = (screen: string, params?: any) => {
    setCurrentScreen(screen);
    setScreenParams(params || null);
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Active Customer Mode
  if (activeRole === 'CUSTOMER') {
    switch (currentScreen) {
      case 'new_requisition':
        return <NewRequisitionScreen onNavigate={handleNavigate} />;
      case 'order_detail':
        return <CustomerOrderDetailScreen route={{ params: screenParams }} onNavigate={handleNavigate} />;
      case 'delivery_detail':
        return <CustomerDeliveryDetailScreen route={{ params: screenParams }} onNavigate={handleNavigate} />;
      case 'invoices':
        return <CustomerInvoicesScreen onNavigate={handleNavigate} />;
      case 'payments':
        return <CustomerPaymentsScreen route={{ params: screenParams }} onNavigate={handleNavigate} />;
      case 'notifications':
        return <CustomerNotificationsScreen onNavigate={handleNavigate} />;
      case 'profile':
        return <CustomerProfileScreen onNavigate={handleNavigate} />;
      case 'tabs':
      default:
        return <CustomerTabs onNavigateScreen={handleNavigate} />;
    }
  }

  // Active Driver Mode
  if (activeRole === 'DRIVER') {
    switch (currentScreen) {
      case 'driver_active_trip':
        return <DriverActiveTripScreen route={{ params: screenParams }} onNavigate={handleNavigate} />;
      case 'driver_pod_capture':
        return <DriverPodCaptureScreen route={{ params: screenParams }} onNavigate={handleNavigate} />;
      case 'notifications':
        return <CustomerNotificationsScreen onNavigate={handleNavigate} />;
      case 'profile':
        return <CustomerProfileScreen onNavigate={handleNavigate} />;
      case 'tabs':
      default:
        return <DriverTabs onNavigateScreen={handleNavigate} />;
    }
  }

  return <CustomerTabs onNavigateScreen={handleNavigate} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
