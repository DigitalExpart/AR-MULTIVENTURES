import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme';
import { useAuth } from '../services/authStore';

// Auth Screens
import { SplashScreen } from '../features/auth/SplashScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { SignUpScreen } from '../features/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../features/auth/ForgotPasswordScreen';

// Tab Navigators
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

type AuthScreen = 'splash' | 'login' | 'signup' | 'forgot_password';

export function RootNavigator() {
  const { isAuthenticated, activeRole } = useAuth();

  // Auth flow state
  const [authScreen, setAuthScreen] = useState<AuthScreen>('splash');

  // Authenticated screen state
  const [currentScreen, setCurrentScreen] = useState<string>('tabs');
  const [screenParams, setScreenParams] = useState<any>(null);

  const handleNavigate = (screen: string, params?: any) => {
    setCurrentScreen(screen);
    setScreenParams(params || null);
  };

  // ─── UNAUTHENTICATED FLOW ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    switch (authScreen) {
      case 'splash':
        return (
          <SplashScreen
            onGetStarted={() => setAuthScreen('signup')}
            onSignIn={() => setAuthScreen('login')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onSignUp={() => setAuthScreen('signup')}
            onForgotPassword={() => setAuthScreen('forgot_password')}
            onBack={() => setAuthScreen('splash')}
          />
        );
      case 'signup':
        return (
          <SignUpScreen
            onSignIn={() => setAuthScreen('login')}
            onBack={() => setAuthScreen('splash')}
          />
        );
      case 'forgot_password':
        return (
          <ForgotPasswordScreen
            onBack={() => setAuthScreen('login')}
          />
        );
    }
  }

  // ─── CUSTOMER AUTHENTICATED FLOW ─────────────────────────────────────────
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

  // ─── DRIVER AUTHENTICATED FLOW ────────────────────────────────────────────
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
