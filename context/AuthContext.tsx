"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  authApi,
  userApi,
  tryRefreshToken,
  handleUnauthorized,
  clearStoredAuth,
  getStoredRefreshToken,
  setStoredRefreshToken,
  isTokenExpiringSoon,
} from "@/lib/api";
import { syncCartWithServer } from "@/lib/cart";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string, name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; phone?: string; avatarUrl?: string | null }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setAuthCookie() {
  if (typeof document !== "undefined") {
    const isHttps = window.location.protocol === "https:";
    const host = window.location.hostname;
    const domainPart = host.includes("icrcustomcreations.in")
      ? "; domain=.icrcustomcreations.in"
      : "";
    const securePart = isHttps ? "; Secure" : "";
    document.cookie = `icr_auth=1; path=/; max-age=2592000; SameSite=Lax${securePart}${domainPart}`;
    // Also set host-only fallback in case domain attribute is ignored by browser
    if (domainPart) {
      document.cookie = `icr_auth=1; path=/; max-age=2592000; SameSite=Lax${securePart}`;
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Unified initialization lifecycle (zero-flicker & race-condition free) ──
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const storedUser = localStorage.getItem("icr_user");
        const storedToken = localStorage.getItem("icr_token");
        const storedRefreshToken = getStoredRefreshToken();

        // Case 1: No stored credentials at all — user is genuinely logged out
        if (!storedToken && !storedRefreshToken) {
          if (mounted) {
            setUser(null);
            setToken(null);
            setIsLoading(false);
          }
          return;
        }

        // Case 2: Check if current access token is missing or expiring soon
        let activeToken = storedToken;
        const needsRefresh = !activeToken || isTokenExpiringSoon(activeToken);

        if (needsRefresh) {
          // Proactively refresh before unlocking loading state to prevent 401 kickout
          const refreshed = await tryRefreshToken();
          if (!mounted) return;

          if (refreshed) {
            activeToken = localStorage.getItem("icr_token");
            const freshUserStr = localStorage.getItem("icr_user");
            if (freshUserStr) {
              try {
                setUser(JSON.parse(freshUserStr));
              } catch {
                // ignore parse error
              }
            }
            setToken(activeToken);
            setAuthCookie();
            setIsLoading(false);
            return;
          } else {
            // Both access token and refresh token failed — session is dead
            setUser(null);
            setToken(null);
            clearStoredAuth();
            setIsLoading(false);
            return;
          }
        }

        // Case 3: Token is valid and fresh — render immediately (zero flicker)
        if (storedUser && mounted) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore parse error
          }
          setToken(activeToken);
          setAuthCookie();
          setIsLoading(false);
        }

        // Background sync: verify server session & update profile data
        const profileRes = await userApi.getProfile();
        if (!mounted) return;

        if (profileRes.success && profileRes.data?.user) {
          setUser(profileRes.data.user);
          setToken(localStorage.getItem("icr_token"));
          localStorage.setItem("icr_user", JSON.stringify(profileRes.data.user));
          setAuthCookie();
        } else if (!profileRes.error?.includes("Network error") && !profileRes.error?.includes("fetch")) {
          // Token rejected by server — attempt one silent refresh
          const refreshed = await tryRefreshToken();
          if (!mounted) return;

          if (refreshed) {
            const freshUserStr = localStorage.getItem("icr_user");
            if (freshUserStr) setUser(JSON.parse(freshUserStr));
            setToken(localStorage.getItem("icr_token"));
            setAuthCookie();
          } else {
            setUser(null);
            setToken(null);
            handleUnauthorized();
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("[AuthContext] Init error:", err);
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
      }
    }

    initAuth();

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
      if (res.data.refreshToken) {
        setStoredRefreshToken(res.data.refreshToken);
      }
      setAuthCookie();
      syncCartWithServer().catch(() => {});
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed" };
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await authApi.googleAuth(idToken);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.accessToken);
      localStorage.setItem("icr_user", JSON.stringify(res.data.user));
      localStorage.setItem("icr_token", res.data.accessToken);
      if (res.data.refreshToken) {
        setStoredRefreshToken(res.data.refreshToken);
      }
      setAuthCookie();
      syncCartWithServer().catch(() => {});
      return { success: true };
    }
    return { success: false, error: res.error || "Google sign-in failed" };
  }, []);

  const register = useCallback(async (phone: string, password: string, name: string, email: string) => {
    const res = await authApi.register(phone, password, name, email);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.accessToken);
      localStorage.setItem("icr_user", JSON.stringify(res.data.user));
      localStorage.setItem("icr_token", res.data.accessToken);
      if (res.data.refreshToken) {
        setStoredRefreshToken(res.data.refreshToken);
      }
      setAuthCookie();
      syncCartWithServer().catch(() => {});
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

  const updateProfile = useCallback(async (data: { name?: string; email?: string; phone?: string; avatarUrl?: string | null }) => {
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
        loginWithGoogle,
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
