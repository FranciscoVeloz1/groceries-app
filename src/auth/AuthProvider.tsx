import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { GROCERIES_APP_SLUG } from '../api/config';
import * as authApi from '../api/auth';
import { ApiError, request, type RequestOptions } from '../api/http';
import type { AuthUser } from '../api/types';
import { setGroceriesApiSession } from './groceries-api-session';
import { clearRefreshToken, readRefreshToken, writeRefreshToken } from './session-storage';

export type AuthStatus = 'bootstrapping' | 'authenticated' | 'anonymous';

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  isGroceriesAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authorizedRequest: <T>(
    path: string,
    options?: Omit<RequestOptions, 'accessToken'>
  ) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveIsGroceriesAdmin(user: AuthUser | null): boolean {
  if (!user) {
    return false;
  }

  return user.permissions.some((permission) => {
    return permission.applicationSlug === GROCERIES_APP_SLUG && permission.role === 'ADMIN';
  });
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('bootstrapping');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const refreshInFlightRef = useRef<Promise<string> | null>(null);

  const clearSession = useCallback(() => {
    refreshTokenRef.current = null;
    clearRefreshToken();
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
    setGroceriesApiSession(null);
  }, []);

  const persistTokens = useCallback((nextAccessToken: string, nextRefreshToken: string) => {
    refreshTokenRef.current = nextRefreshToken;
    writeRefreshToken(nextRefreshToken);
    setAccessToken(nextAccessToken);
  }, []);

  const applyAuthenticatedUser = useCallback((nextUser: AuthUser, nextAccessToken: string) => {
    setUser(nextUser);
    setAccessToken(nextAccessToken);
    setStatus('authenticated');

    const isAdmin = deriveIsGroceriesAdmin(nextUser);
    if (isAdmin) {
      setGroceriesApiSession({
        userId: nextUser.id,
        request: async <T,>(path: string, options: Omit<RequestOptions, 'accessToken'> = {}) => {
          return request<T>(path, { ...options, accessToken: nextAccessToken });
        }
      });
    } else {
      setGroceriesApiSession(null);
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<string> => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const currentRefresh = refreshTokenRef.current;
    if (!currentRefresh) {
      clearSession();
      throw new ApiError(401, 'Missing refresh token', 'UNAUTHORIZED');
    }

    const pending = (async () => {
      try {
        const tokens = await authApi.refresh({ refreshToken: currentRefresh });
        persistTokens(tokens.accessToken, tokens.refreshToken);
        const meResponse = await authApi.me(tokens.accessToken);
        applyAuthenticatedUser(meResponse.user, tokens.accessToken);
        return tokens.accessToken;
      } catch (caught) {
        clearSession();
        throw caught;
      } finally {
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = pending;
    return pending;
  }, [applyAuthenticatedUser, clearSession, persistTokens]);

  const bootstrap = useEffectEvent(async () => {
    const storedRefresh = readRefreshToken();
    if (!storedRefresh) {
      setStatus('anonymous');
      setGroceriesApiSession(null);
      return;
    }

    refreshTokenRef.current = storedRefresh;

    try {
      await refreshSession();
    } catch {
      // refreshSession already cleared state
    }
  });

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        void bootstrap();
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      persistTokens(result.accessToken, result.refreshToken);
      const meResponse = await authApi.me(result.accessToken);
      applyAuthenticatedUser(meResponse.user, result.accessToken);
    },
    [applyAuthenticatedUser, persistTokens]
  );

  const logout = useCallback(async () => {
    const refreshToken = refreshTokenRef.current;
    clearSession();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Local session already cleared; ignore remote logout failures.
      }
    }
  }, [clearSession]);

  const authorizedRequest = useCallback(
    async <T,>(path: string, options: Omit<RequestOptions, 'accessToken'> = {}): Promise<T> => {
      const token = accessToken;
      if (!token) {
        throw new ApiError(401, 'Not authenticated', 'UNAUTHORIZED');
      }

      try {
        return await request<T>(path, { ...options, accessToken: token });
      } catch (caught) {
        if (!(caught instanceof ApiError) || caught.status !== 401) {
          throw caught;
        }

        const nextToken = await refreshSession();
        return request<T>(path, { ...options, accessToken: nextToken });
      }
    },
    [accessToken, refreshSession]
  );

  const isGroceriesAdmin = status === 'authenticated' && deriveIsGroceriesAdmin(user);

  useEffect(() => {
    if (!isGroceriesAdmin || !user || !accessToken) {
      if (status !== 'bootstrapping') {
        setGroceriesApiSession(null);
      }
      return;
    }

    setGroceriesApiSession({
      userId: user.id,
      request: authorizedRequest
    });
  }, [accessToken, authorizedRequest, isGroceriesAdmin, status, user]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      status,
      user,
      accessToken,
      isGroceriesAdmin,
      login,
      logout,
      authorizedRequest
    };
  }, [status, user, accessToken, isGroceriesAdmin, login, logout, authorizedRequest]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook colocated with provider for a single auth module surface.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
