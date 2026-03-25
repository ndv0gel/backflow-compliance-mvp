"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest } from '@/lib/api';
import type { AuthUser, LoginResponse } from '@/lib/types';

const TOKEN_STORAGE_KEY = 'backflow.token';
const USER_STORAGE_KEY = 'backflow.user';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const loading = false;

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const payload = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setToken(payload.accessToken);
    setUser(payload.user);

    window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.accessToken);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user));

    return payload.user;
  };

  const logout = async (): Promise<void> => {
    if (token) {
      try {
        await apiRequest('/auth/logout', { method: 'POST' }, token);
      } catch {
        // Session may already be invalid on the server.
      }
    }

    setToken(null);
    setUser(null);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
