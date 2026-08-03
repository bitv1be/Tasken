'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { PropsWithChildren } from 'react';

import {
  authApi,
  type LoginData,
  type SignupData,
  type User,
} from '@/app/lib/api';

const TOKEN_STORAGE_KEY = 'tasken_auth_token';
const LEGACY_TOKEN_STORAGE_KEY = 'taskora_auth_token';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    setToken(null);
    setUser(null);
  }, []);

  const saveAuth = useCallback(
    (newToken: string, authenticatedUser: User) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);

      setToken(newToken);
      setUser(authenticatedUser);
    },
    [],
  );

  useEffect(() => {
    let active = true;

    async function restoreSession(): Promise<void> {
      const savedToken =
        localStorage.getItem(TOKEN_STORAGE_KEY) ??
        localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);

      if (!savedToken) {
        if (active) {
          setLoading(false);
        }

        return;
      }

      if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
        localStorage.setItem(TOKEN_STORAGE_KEY, savedToken);
        localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      }

      if (active) {
        setToken(savedToken);
      }

      try {
        const response =
          await authApi.currentUser(savedToken);

        if (active) {
          setUser(response.user);
        }
      } catch {
        if (active) {
          clearAuth();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [clearAuth]);

  const login = useCallback(
    async (data: LoginData): Promise<void> => {
      const response = await authApi.login(data);

      saveAuth(response.token, response.user);
    },
    [saveAuth],
  );

  const signup = useCallback(
    async (data: SignupData): Promise<void> => {
      const response = await authApi.signup(data);

      saveAuth(response.token, response.user);
    },
    [saveAuth],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (token) {
        await authApi.logout(token);
      }
    } finally {
      clearAuth();
    }
  }, [token, clearAuth]);

  const logoutAll = useCallback(async (): Promise<void> => {
    try {
      if (token) {
        await authApi.logoutAll(token);
      }
    } finally {
      clearAuth();
    }
  }, [token, clearAuth]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      logoutAll,
    }),
    [
      user,
      token,
      loading,
      login,
      signup,
      logout,
      logoutAll,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.',
    );
  }

  return context;
}
