"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, authApi, userApi, tryRefreshToken, handleUnauthorized, clearStoredAuth } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setAuthCookie() {
  if (typeof document !== "undefined") {
    // 7-day presence cookie for the Next.js middleware route guard (proxy.ts)
    document.cookie = "icr_auth=1; path=/; max-age=604800; SameSite=Lax";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Step 1: Restore state from localStorage immediately (zero-flicker) ──
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("icr_user");
      const storedToken = localStorage.getItem("icr_token");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setAuthCookie();
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch {
      // Silently ignore JSON parse failures
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Step 2: Background session verification on every app mount ──
  // Strategy:
  //   a) Try GET /users/me with the stored token
  //   b) If that fails with a network error (not a 401), do nothing — keep the
  //      cached user rather than logging them out over a transient failure.
  //   c) If it fails because the token is expired (apiRequest already tried to
  //      refresh internally), attempt one explicit refresh here.
  //   d) Only call handleUnauthorized() when the refresh token itself is gone/expired.
  useEffect(() => {
    let mounted = true;

    async function syncSession() {
      const storedToken = localStorage.getItem("icr_token");
      // No token stored at all — user is genuinely logged out, nothing to do
      if (!storedToken) return;

      const profileRes = await userApi.getProfile();
      if (!mounted) return;

      if (profileRes.success && profileRes.data?.user) {
        // Token still valid — update user state from server
        setUser(profileRes.data.user);
        setToken(localStorage.getItem("icr_token")); // may have been silently refreshed
        localStorage.setItem("icr_user", JSON.stringify(profileRes.data.user));
        setAuthCookie();
        return;
      }

      // Network error (no response, timeout, etc.) — don't log the user out
      // over something transient. Keep the cached session and let them continue.
      if (profileRes.error?.includes("Network error") || profileRes.error?.includes("fetch")) {
        return;
      }

      // Token is invalid / expired and apiRequest's internal retry already ran.
      // Try one explicit refresh as a last resort.
      const refreshed = await tryRefreshToken();
      if (!mounted) return;

      if (refreshed) {
        const newToken = localStorage.getItem("icr_token");
        setToken(newToken);
        // Re-fetch profile with the fresh token
        const retryRes = await userApi.getProfile();
        if (!mounted) return;
        if (retryRes.success && retryRes.data?.user) {
          setUser(retryRes.data.user);
          localStorage.setItem("icr_user", JSON.stringify(retryRes.data.user));
          setAuthCookie();
        }
        return;
      }

      // Refresh token is also gone or expired — the session is truly dead
      setUser(null);
      setToken(null);
      handleUnauthorized();
    }

    syncSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ── Auth actions ──

  const login = useCallback(async (phone: string, password: string) => {
    const res = await authApi.login(phone, password);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.accessToken);
      localStorage.setItem("icr_user", JSON.stringify(res.data.user));
      localStorage.setItem("icr_token", res.data.accessToken);
      setAuthCookie();
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed" };
  }, []);

  const register = useCallback(async (phone: string, password: string, name: string) => {
    const res = await authApi.register(phone, password, name);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.accessToken);
      localStorage.setItem("icr_user", JSON.stringify(res.data.user));
      localStorage.setItem("icr_token", res.data.accessToken);
      setAuthCookie();
      return { success: true };
    }
    return { success: false, error: res.error || "Registration failed" };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout — local cleanup always runs
    }
    setUser(null);
    setToken(null);
    clearStoredAuth();
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string; avatarUrl?: string }) => {
    const res = await userApi.updateProfile(data);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem("icr_user", JSON.stringify(res.data.user));
      return { success: true };
    }
    return { success: false, error: res.error || "Failed to update profile" };
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await userApi.getProfile();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem("icr_user", JSON.stringify(res.data.user));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
