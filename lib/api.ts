export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: "CUSTOMER" | "PARTNER" | "ADMIN";
  avatarUrl: string | null;
  createdAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// helper to get stored access token
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("icr_token");
}

// generic request wrapper handling bearer token and credentials
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // send httpOnly cookies like refreshToken
    });

    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error. Please check your connection.",
    };
  }
}

export const authApi = {
  async register(phone: string, password: string, name: string) {
    return apiRequest<{ accessToken: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ phone, password, name }),
    });
  },

  async login(phone: string, password: string) {
    return apiRequest<{ accessToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
  },

  async refresh() {
    return apiRequest<{ accessToken: string; user: User }>("/auth/refresh", {
      method: "POST",
    });
  },

  async logout() {
    return apiRequest<void>("/auth/logout", {
      method: "POST",
    });
  },
};

export const userApi = {
  async getProfile() {
    return apiRequest<{ user: User }>("/users/me", {
      method: "GET",
    });
  },

  async updateProfile(data: { name?: string; phone?: string; avatarUrl?: string }) {
    return apiRequest<{ user: User }>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getAddresses() {
    return apiRequest<{ addresses: Address[] }>("/users/me/addresses", {
      method: "GET",
    });
  },

  async addAddress(data: Omit<Address, "id" | "userId" | "createdAt">) {
    return apiRequest<{ address: Address }>("/users/me/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAddress(id: string, data: Partial<Omit<Address, "id" | "userId" | "createdAt">>) {
    return apiRequest<{ address: Address }>(`/users/me/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteAddress(id: string) {
    return apiRequest<void>(`/users/me/addresses/${id}`, {
      method: "DELETE",
    });
  },
};
