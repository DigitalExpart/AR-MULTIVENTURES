import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '@ar-multiventures/types';

export interface MobileAuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  activeRole: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
  token: string | null;
  isDataProviderMock: boolean;
  login: (email: string, role?: 'CUSTOMER' | 'DRIVER') => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: 'CUSTOMER' | 'DRIVER') => void;
}

const mockCustomerUser: UserProfile = {
  id: 'usr-customer-01',
  email: 'procurement@buildcorp.ng',
  firstName: 'Babatunde',
  lastName: 'Alabi',
  phone: '+234 803 123 4567',
  role: 'CUSTOMER' as UserRole,
  organizationId: 'org-buildcorp',
  companyName: 'BuildCorp Nigeria Limited',
  accountNumber: 'CUS-2026-0089',
};

const mockDriverUser: UserProfile = {
  id: 'usr-driver-01',
  email: 'driver.musa@armultiventures.com',
  firstName: 'Ibrahim',
  lastName: 'Musa',
  phone: '+234 803 111 2233',
  role: 'DRIVER' as UserRole,
  organizationId: 'org-armultiventures',
  companyName: 'AR Multiventures Logistics',
};

const AuthContext = createContext<MobileAuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isDataProviderMock = process.env.EXPO_PUBLIC_DATA_PROVIDER !== 'supabase';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<'CUSTOMER' | 'DRIVER' | 'ADMIN'>('CUSTOMER');
  const [user, setUser] = useState<UserProfile | null>(mockCustomerUser);
  const [token, setToken] = useState<string | null>('mock-jwt-session-token');

  const login = async (email: string, role: 'CUSTOMER' | 'DRIVER' = 'CUSTOMER') => {
    // In Supabase mode, this calls supabase.auth.signInWithPassword
    // In Mock mode, sets authoritative mock profile
    if (role === 'DRIVER' || email.includes('driver')) {
      setUser(mockDriverUser);
      setActiveRole('DRIVER');
    } else {
      setUser(mockCustomerUser);
      setActiveRole('CUSTOMER');
    }
    setIsAuthenticated(true);
    setToken('mock-session-active');
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
  };

  const switchRole = (role: 'CUSTOMER' | 'DRIVER') => {
    if (role === 'DRIVER') {
      setUser(mockDriverUser);
      setActiveRole('DRIVER');
    } else {
      setUser(mockCustomerUser);
      setActiveRole('CUSTOMER');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        activeRole,
        token,
        isDataProviderMock,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
