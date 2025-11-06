'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { authApi } from '@/lib/api/auth';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/lib/constants/auth';
import type { AuthResponse, User } from '@/lib/types';

interface AuthContextValue {
  user?: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (
    payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    },
  ) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<User | undefined>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isBrowser = typeof window !== 'undefined';

const persistAuth = (data: AuthResponse) => {
  if (!isBrowser) return;
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
};

const clearPersistedAuth = () => {
  if (!isBrowser) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isBrowser) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch (error) {
        console.warn('No se pudo parsear el usuario almacenado', error);
        clearPersistedAuth();
      }
    }

    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .me()
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        persistAuth({ user: currentUser, token });
      })
      .catch(() => {
        clearPersistedAuth();
        setUser(undefined);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleAuthSuccess = useCallback((data: AuthResponse) => {
    persistAuth(data);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback<
    AuthContextValue['login']
  >(async (credentials) => {
    const data = await authApi.login(credentials);
    return handleAuthSuccess(data);
  }, [handleAuthSuccess]);

  const register = useCallback<
    AuthContextValue['register']
  >(async (payload) => {
    const data = await authApi.register(payload);
    return handleAuthSuccess(data);
  }, [handleAuthSuccess]);

  const logout = useCallback(() => {
    clearPersistedAuth();
    setUser(undefined);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { user: currentUser } = await authApi.me();
      if (isBrowser) {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          persistAuth({ user: currentUser, token });
        }
      }
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      clearPersistedAuth();
      setUser(undefined);
      return undefined;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, isLoading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
