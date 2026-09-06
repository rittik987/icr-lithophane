const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").trim().replace(/\/+$/, "");
export const API_BASE_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

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

let isRedirectingToLogin = false;

// helper to get stored access token
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("icr_token");
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("icr_token");
  localStorage.removeItem("icr_user");
  document.cookie = "icr_auth=; path=/; max-age=0; SameSite=Lax";
}

export function handleUnauthorized(): void {
  if (typeof window === "undefined" || isRedirectingToLogin) return;
  isRedirectingToLogin = true;
  clearStoredAuth();

  const currentPath = window.location.pathname;
  if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
    const redirectQuery = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?redirect=${redirectQuery}`;
  }
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

    const isAuthSubmission =
      endpoint.startsWith("/auth/login") || endpoint.startsWith("/auth/register");

    if (res.status === 401 && !isAuthSubmission) {
      handleUnauthorized();
      return {
        success: false,
        error: "Invalid or expired session. Redirecting to login...",
      };
    }

    const data = await res.json();

    if (
      !isAuthSubmission &&
      (data?.error === "Invalid or expired token" || data?.error === "Authentication required")
    ) {
      handleUnauthorized();
    }

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

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

export interface CartPhoto {
  slotId: string;
  slotLabel: string;
  cloudinaryId: string;
  url: string;
  fileName?: string;
  aspectHint?: string;
  cmLabel?: string;
}

export interface CartText {
  fieldId: string;
  label: string;
  value: string;
}

export interface ServerCartItem {
  id: string;
  cartId: string;
  templateId: string;
  templateName: string;
  quantity: number;
  unitPrice: number;     // in paise
  originalPrice: number; // in paise
  previewUrl: string | null;
  photos: CartPhoto[];
  texts: CartText[];
  createdAt: string;
  updatedAt: string;
}

export interface ServerCart {
  id: string;
  userId: string;
  items: ServerCartItem[];
  itemCount: number;
  subtotal: number; // in paise
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  coupon: {
    id: string;
    code: string;
    description: string | null;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
  };
  discountAmount: number; // in paise
  finalAmount: number;    // in paise
}

export interface RazorpayOrderDetails {
  orderId: string;
  amount: number;   // in paise
  currency: string;
  keyId: string;
}

export interface InlineAddress {
  fullName: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderPhotoAsset {
  slotId: string;
  slotLabel: string;
  cloudinaryId?: string;
  url: string;
  fileName?: string;
  aspectHint?: string;
  cmLabel?: string;
}

export interface OrderTextAsset {
  fieldId: string;
  label: string;
  value: string;
}

export interface OrderItemDetail {
  cartItemId?: string;
  templateId: string;
  templateName: string;
  quantity: number;
  unitPrice: number;     // in paise
  originalPrice?: number;// in paise
  previewUrl?: string | null;
  photos: OrderPhotoAsset[];
  texts: OrderTextAsset[];
}

export interface OrderShippingAddress {
  fullName?: string;
  phone?: string;
  email?: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface ServerOrder {
  id: string;
  status: string;
  subtotal: number;       // in paise
  discountAmount: number; // in paise
  finalAmount: number;    // in paise
  items: OrderItemDetail[];
  shippingAddress: OrderShippingAddress;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  coupon?: {
    code: string;
    description?: string | null;
    discountType: string;
    discountValue: number;
  } | null;
  payment?: {
    id?: string;
    status: string;
    method?: string | null;
    razorpayPaymentId?: string | null;
    amount?: number;
    createdAt?: string;
  } | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────
// CART API
// ─────────────────────────────────────────────────────────

export const cartApi = {
  async getCart() {
    return apiRequest<{ cart: ServerCart }>("/cart");
  },

  async addItem(item: {
    templateId: string;
    templateName: string;
    quantity?: number;
    unitPrice: number;
    originalPrice: number;
    previewUrl?: string;
    photos: CartPhoto[];
    texts: CartText[];
  }) {
    return apiRequest<{ cart: ServerCart }>("/cart/items", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  async updateItemQuantity(itemId: string, quantity: number) {
    return apiRequest<{ cart: ServerCart }>(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },

  async removeItem(itemId: string) {
    return apiRequest<{ cart: ServerCart }>(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
  },

  async clearCart(purgeAssets = true) {
    const query = purgeAssets ? "" : "?purgeAssets=false";
    return apiRequest<void>(`/cart${query}`, { method: "DELETE" });
  },
};

// ─────────────────────────────────────────────────────────
// COUPON API
// ─────────────────────────────────────────────────────────

export const couponApi = {
  /** Validate coupon — subtotal in paise */
  async validate(code: string, subtotal: number) {
    return apiRequest<CouponValidation>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    });
  },
};

// ─────────────────────────────────────────────────────────
// ORDER API
// ─────────────────────────────────────────────────────────

export const orderApi = {
  /** Create order + Razorpay order. Returns ICR order + Razorpay SDK details. */
  async createOrder(data: {
    addressId?: string;
    inlineAddress?: InlineAddress;
    couponCode?: string;
    notes?: string;
    paymentMethod?: "upi" | "card" | "netbanking" | "wallet";
  }) {
    return apiRequest<{ order: ServerOrder; razorpay: RazorpayOrderDetails }>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Verify Razorpay payment signature and capture the order. */
  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return apiRequest<{ orderId: string; status: string }>(`/orders/${data.razorpayOrderId}/verify-payment`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getOrders() {
    return apiRequest<{ orders: ServerOrder[] }>("/orders");
  },

  async getOrder(id: string) {
    return apiRequest<{ order: ServerOrder }>(`/orders/${id}`);
  },
};

// ─────────────────────────────────────────────────────────
// UPLOAD API
// ─────────────────────────────────────────────────────────

export interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const uploadApi = {
  /**
   * Upload one or more image files to Cloudinary via the backend.
   * Pass an optional folder name (defaults to "icr-uploads").
   */
  async uploadFiles(files: File[], folder?: string) {
    const token = getStoredToken();
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const url = folder
      ? `${API_BASE_URL}/upload?folder=${encodeURIComponent(folder)}`
      : `${API_BASE_URL}/upload`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: formData,
      });

      if (res.status === 401) {
        handleUnauthorized();
        return {
          success: false,
          uploaded: 0,
          assets: [] as UploadedAsset[],
          error: "Invalid or expired session. Redirecting to login...",
        };
      }

      const data = await res.json();

      if (data?.error === "Invalid or expired token" || data?.error === "Authentication required") {
        handleUnauthorized();
      }

      return data as { success: boolean; uploaded: number; assets: UploadedAsset[]; failed?: { name: string; error: string }[] };
    } catch (err) {
      return { success: false, uploaded: 0, assets: [] as UploadedAsset[], error: String(err) };
    }
  },
};
