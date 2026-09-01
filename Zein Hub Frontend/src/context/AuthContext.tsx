'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

export type UserRole = 'super_admin' | 'instructor' | 'student';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ user: User }>('/auth/profile');
      if (response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      setUser(null);
      return null;
    } catch (err: any) {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ user: User }>('/auth/login', {
        email,
        password,
      });

      if (response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      throw new Error('لم يتم استرجاع بيانات المستخدم');
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'فشل تسجيل الدخول، يرجى التأكد من البريد وكلمة المرور';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request completed with warning:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        checkAuth,
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
