"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, authApi, userApi } from "@/lib/api";

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
    // 7 days cookie for proxy.ts server interceptor
    document.cookie = "icr_auth=1; path=/; max-age=604800; SameSite=Lax";
  }
}

function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "icr_auth=; path=/; max-age=0; SameSite=Lax";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage immediately for fast, zero-flicker UI
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
      // fallback if parsing fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Background token verification and silent refresh
  useEffect(() => {
    let mounted = true;

    async function syncSession() {
      const storedToken = localStorage.getItem("icr_token");
      if (!storedToken) return;

      const profileRes = await userApi.getProfile();
      if (!mounted) return;

      if (profileRes.success && profileRes.data?.user) {
        setUser(profileRes.data.user);
        localStorage.setItem("icr_user", JSON.stringify(profileRes.data.user));
        setAuthCookie();
      } else {
        // Token might have expired — try silent refresh via httpOnly cookie
        const refreshRes = await authApi.refresh();
        if (!mounted) return;

        if (refreshRes.success && refreshRes.data) {
          setUser(refreshRes.data.user);
          setToken(refreshRes.data.accessToken);
          localStorage.setItem("icr_user", JSON.stringify(refreshRes.data.user));
          localStorage.setItem("icr_token", refreshRes.data.accessToken);
          setAuthCookie();
        } else {
          // Session expired or revoked
          setUser(null);
          setToken(null);
          localStorage.removeItem("icr_user");
          localStorage.removeItem("icr_token");
          clearAuthCookie();
        }
      }
    }

    syncSession();

    return () => {
      mounted = false;
    };
  }, []);

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
      // ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("icr_user");
    localStorage.removeItem("icr_token");
    clearAuthCookie();
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
