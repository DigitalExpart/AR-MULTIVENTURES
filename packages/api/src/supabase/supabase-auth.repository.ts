import type { IAuthRepository } from '../interfaces';
import type { User } from '@ar-multiventures/types';
import type { LoginFormValues, RegisterFormValues } from '@ar-multiventures/validation';
import { supabase } from './supabase-client';

export class SupabaseAuthRepository implements IAuthRepository {
  async login(credentials: LoginFormValues): Promise<{ user: User; token: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.emailOrPhone,
      password: credentials.password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email or password');
    }

    // Fetch matching profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const appUser: User = {
      id: data.user.id,
      email: data.user.email || credentials.emailOrPhone,
      phone: profile?.phone || data.user.phone || '',
      firstName: profile?.first_name || 'Customer',
      lastName: profile?.last_name || '',
      role: 'customer',
      avatarUrl: profile?.avatar_url || undefined,
      isVerified: true,
      createdAt: profile?.created_at || new Date().toISOString(),
      updatedAt: profile?.updated_at || new Date().toISOString(),
    };

    return {
      user: appUser,
      token: data.session?.access_token || '',
    };
  }

  async register(data: RegisterFormValues): Promise<{ user: User; token: string }> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          company_name: data.companyName || `${data.lastName} Enterprises`,
        },
      },
    });

    if (error || !authData.user) {
      throw new Error(error?.message || 'Failed to register contractor account');
    }

    const appUser: User = {
      id: authData.user.id,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'customer',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user: appUser,
      token: authData.session?.access_token || '',
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return null;
    }

    const authUser = sessionData.session.user;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return {
      id: authUser.id,
      email: authUser.email || '',
      phone: profile?.phone || authUser.phone || '',
      firstName: profile?.first_name || 'Customer',
      lastName: profile?.last_name || '',
      role: 'customer',
      avatarUrl: profile?.avatar_url || undefined,
      isVerified: true,
      createdAt: profile?.created_at || new Date().toISOString(),
      updatedAt: profile?.updated_at || new Date().toISOString(),
    };
  }
}
