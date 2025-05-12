import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check active sessions and sets up an auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              isSubscriber: userData?.subscription_status === 'premium',
              subscriptionStatus: userData?.subscription_status,
            },
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to log in. Please check your credentials.' 
      }));
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Registration failed. Please try again.' 
      }));
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Logout failed.' 
      }));
    }
  };

  const isAuthenticated = !!authState.user;

  return (
    <AuthContext.Provider value={{ 
      authState, 
      login, 
      register, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};