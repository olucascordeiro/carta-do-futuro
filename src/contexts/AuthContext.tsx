// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthChangeEvent, Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  // Adicionar uma função para forçar o refresh do perfil se necessário
  refreshUserProfile: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const fetchUserProfile = async (supabaseUser: SupabaseAuthUser) => {
    console.log('[AuthContext] fetchUserProfile chamado para User ID:', supabaseUser.id);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users') // CONFIRME O NOME DA SUA TABELA DE PERFIS AQUI
        .select('id, email, name, phone, plan_type, access_expires_at, purchased_at') // Adicionado name e phone
        .eq('id', supabaseUser.id)
        .maybeSingle();

      console.log('[AuthContext] fetchUserProfile - Após buscar perfil. profileData:', profileData, 'profileError:', profileError);

      if (profileError) {
        console.error('[AuthContext] fetchUserProfile - ERRO DETECTADO ao buscar perfil:', profileError.message);
        setAuthState({
          user: {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: null, // Valor padrão
            phone: null, // Valor padrão
            planType: 'none',
            accessExpiresAt: null,
            purchasedAt: null,
          },
          isLoading: false,
          error: 'Falha ao carregar detalhes do plano.',
        });
        return;
      }

      if (profileData) {
        console.log('[AuthContext] fetchUserProfile - profileData ENCONTRADO.');
        let resolvedPlanType: 'none' | 'basic' | 'full' = 'none';
        if (profileData.plan_type === 'basic' || profileData.plan_type === 'full') {
          resolvedPlanType = profileData.plan_type;
        } else if (profileData.plan_type && profileData.plan_type !== 'none') {
          console.warn(`[AuthContext] fetchUserProfile - Valor inesperado para plan_type: "${profileData.plan_type}". Usando 'none'.`);
        }

        const appUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profileData.name || null, // Adicionado
          phone: profileData.phone || null, // Adicionado
          planType: resolvedPlanType,
          accessExpiresAt: profileData.access_expires_at ? new Date(profileData.access_expires_at) : null,
          purchasedAt: profileData.purchased_at ? new Date(profileData.purchased_at) : null,
        };
        setAuthState({ user: appUser, isLoading: false, error: null });
      } else {
        console.warn('[AuthContext] fetchUserProfile - profileData NÃO encontrado para usuário:', supabaseUser.id);
        setAuthState({
          user: {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: null,
            phone: null,
            planType: 'none',
            accessExpiresAt: null,
            purchasedAt: null,
          },
          isLoading: false,
          error: 'Perfil do usuário não encontrado.',
        });
      }
    } catch (e: any) {
      console.error('[AuthContext] fetchUserProfile - EXCEÇÃO no bloco try/catch:', e.message);
      setAuthState((prev: AuthState) => ({ ...prev, user: null, isLoading: false, error: 'Erro crítico ao processar dados do perfil.' }));
    }
  };


  useEffect(() => {
    console.log('[AuthContext] useEffect (onAuthStateChange) executado.');
    // Seta isLoading para true apenas na montagem inicial do listener
    // setAuthState(prev => ({ ...prev, isLoading: true, error: null })); // Removido isLoading:true daqui

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        console.log('[AuthContext] onAuthStateChange disparado. Evento:', _event, 'Sessão:', session);
        if (session && session.user) {
          // Se isLoading ainda for true (primeira carga com sessão), ou se for um evento de SIGNED_IN, USER_UPDATED
          // ou se não houver usuário no estado ainda, busca o perfil.
          if (authState.isLoading || _event === 'SIGNED_IN' || _event === 'USER_UPDATED' || !authState.user || authState.user.id !== session.user.id) {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null })); // Mostra loading ANTES de buscar perfil
            await fetchUserProfile(session.user);
          }
        } else {
          // No session, user is logged out or initial state without session
          setAuthState({ user: null, isLoading: false, error: null });
        }
      }
    );
    
    // Verificação inicial da sessão para setar isLoading: false se não houver sessão
    // Isso garante que o estado de loading não fique preso em true se o onAuthStateChange
    // demorar um pouco para disparar com session: null na primeira carga.
    const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setAuthState(prev => ({ ...prev, user: null, isLoading: false, error: null }));
        }
        // Se houver sessão, o onAuthStateChange acima já foi/será disparado e cuidará do resto.
    };
    checkInitialSession();


    return () => {
      subscription.unsubscribe();
    };
  }, []); // A dependência authState.isLoading foi removida para evitar loops, o controle é interno agora.

  const login = async (email: string, password: string) => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthState((prev: AuthState) => ({ ...prev, isLoading: false, error: error.message || 'Falha no login.' }));
      throw error;
    }
    // onAuthStateChange vai lidar com a atualização do estado do usuário com os dados do plano
  };

  const register = async (email: string, password: string) => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    const { data: _signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setAuthState((prev: AuthState) => ({ ...prev, isLoading: false, error: signUpError.message || 'Falha no registro.' }));
      throw signUpError;
    }
  };

  const logout = async () => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    const { error } = await supabase.auth.signOut();
    setAuthState({ user: null, isLoading: false, error: null }); // Seta imediatamente após signOut
    if (error) {
      // Mesmo que signOut tenha sucesso parcial, limpamos o user, mas reportamos o erro
      setAuthState((prev: AuthState) => ({ ...prev, error: error.message || 'Falha no logout.' })); 
      console.error('[AuthContext] Erro no signOut Supabase:', error.message);
      // Não lançar erro aqui para não quebrar a UI se o logout parcial já ocorreu
    }
  };
  
  const refreshUserProfile = async () => {
    if (authState.user) {
        console.log("[AuthContext] refreshUserProfile chamado.");
        setAuthState(prev => ({ ...prev, isLoading: true }));
        const { data: { session } } = await supabase.auth.getSession(); // Pega a sessão atual
        if (session && session.user) {
            await fetchUserProfile(session.user);
        } else {
            // Se não houver sessão, o onAuthStateChange já deve ter limpado o usuário.
            // Mas por segurança, podemos limpar aqui também.
            setAuthState({ user: null, isLoading: false, error: "Sessão não encontrada para refresh." });
        }
    }
  };

  const isAuthenticated = !!authState.user;

  return (
    <AuthContext.Provider value={{
      authState,
      login,
      register,
      logout,
      isAuthenticated,
      refreshUserProfile // Expor a função
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