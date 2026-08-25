import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, CustomerProfile } from '@ar-multiventures/types';
import type { LoginFormValues, RegisterFormValues } from '@ar-multiventures/validation';
import { authApi, customerApi, supabase, useSupabase } from '@ar-multiventures/api';

interface AuthContextType {
  user: User | null;
  customerProfile: CustomerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginFormValues) => Promise<void>;
  registerUser: (data: RegisterFormValues) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const profile = await customerApi.getProfile(currentUser.id);
          setCustomerProfile(profile);
        }
      } catch (err) {
        console.error('Error loading current user:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();

    // Attach Supabase Realtime Auth Listener if running in Supabase mode
    if (useSupabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
          if (currentUser) {
            const profile = await customerApi.getProfile(currentUser.id);
            setCustomerProfile(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCustomerProfile(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (credentials: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await authApi.login(credentials);
      setUser(loggedInUser);
      const profile = await customerApi.getProfile(loggedInUser.id);
      setCustomerProfile(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { user: registeredUser } = await authApi.register(data);
      setUser(registeredUser);
      const profile = await customerApi.getProfile(registeredUser.id);
      setCustomerProfile(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setCustomerProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerUser,
        logout,
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
