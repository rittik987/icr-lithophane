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

// ─────────────────────────────────────────────────────────
// TOKEN UTILITIES
// ─────────────────────────────────────────────────────────

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

/**
 * Decode the JWT exp field and return true if it expires within the next 60 seconds.
 * Never throws — returns false on any parse error so requests still go through.
 */
function isTokenExpiringSoon(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds; add a 60-second buffer so we refresh before the actual expiry
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now() + 60_000;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────
// SINGLETON REFRESH — prevents race conditions when multiple
// concurrent requests all detect an expired token at once.
// All callers share a single in-flight refresh promise.
// ─────────────────────────────────────────────────────────

let _refreshPromise: Promise<boolean> | null = null;

async function executeRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // send httpOnly refreshToken cookie
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data?.success && data?.data?.accessToken) {
      localStorage.setItem("icr_token", data.data.accessToken);
      if (data.data.user) {
        localStorage.setItem("icr_user", JSON.stringify(data.data.user));
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Attempt a silent token refresh. Concurrent callers share the same promise
 * so only one refresh request is ever in-flight at a time.
 */
export function tryRefreshToken(): Promise<boolean> {
  if (!_refreshPromise) {
    _refreshPromise = executeRefresh().finally(() => {
      _refreshPromise = null;
    });
  }
  return _refreshPromise;
}

// ─────────────────────────────────────────────────────────
// CORE REQUEST WRAPPER
// ─────────────────────────────────────────────────────────

/**
 * Generic fetch wrapper. Behaviour:
 * 1. If the stored access token is expiring within 60s, proactively refresh first.
 * 2. Fire the request.
 * 3. On a 401, attempt one silent refresh then retry the original request.
 * 4. If the retry also 401s (refresh token gone/expired), call handleUnauthorized().
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  _isRetry = false   // internal flag to prevent infinite refresh loops
): Promise<ApiResponse<T>> {
  const isAuthSubmission =
    endpoint.startsWith("/auth/login") ||
    endpoint.startsWith("/auth/register") ||
    endpoint.startsWith("/auth/refresh");

  // Step 1 — proactive refresh if token expires soon (skip for auth endpoints)
  if (!isAuthSubmission && !_isRetry) {
    const token = getStoredToken();
    if (token && isTokenExpiringSoon(token)) {
      const refreshed = await tryRefreshToken();
      if (!refreshed) {
        handleUnauthorized();
        return { success: false, error: "Session expired. Please log in again." };
      }
    }
  }

  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    // Step 3 — on 401, try refresh once then retry
    if (res.status === 401 && !isAuthSubmission && !_isRetry) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry original request with the new token
        return apiRequest<T>(endpoint, options, true);
      }
      handleUnauthorized();
      return { success: false, error: "Session expired. Please log in again." };
    }

    // If already a retry and still 401 — session is truly gone
    if (res.status === 401 && !isAuthSubmission && _isRetry) {
      handleUnauthorized();
      return { success: false, error: "Session expired. Please log in again." };
    }

    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error. Please check your connection.",
    };
  }
}

// ─────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────
// USER API
// ─────────────────────────────────────────────────────────

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
   * On 401, attempts a silent token refresh and retries once before logging out.
   */
  async uploadFiles(files: File[], folder?: string): Promise<{
    success: boolean;
    uploaded: number;
    assets: UploadedAsset[];
    failed?: { name: string; error: string }[];
    error?: string;
  }> {
    const doUpload = async () => {
      const token = getStoredToken();
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const url = folder
        ? `${API_BASE_URL}/upload?folder=${encodeURIComponent(folder)}`
        : `${API_BASE_URL}/upload`;

      return fetch(url, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: formData,
      });
    };

    try {
      // Proactive refresh if token expiring soon
      const token = getStoredToken();
      if (token && isTokenExpiringSoon(token)) {
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          handleUnauthorized();
          return { success: false, uploaded: 0, assets: [], error: "Session expired. Please log in again." };
        }
      }

      let res = await doUpload();

      // On 401 — try refresh once, then retry upload
      if (res.status === 401) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          res = await doUpload();
        } else {
          handleUnauthorized();
          return { success: false, uploaded: 0, assets: [], error: "Session expired. Please log in again." };
        }
      }

      // If still 401 after retry — session truly gone
      if (res.status === 401) {
        handleUnauthorized();
        return { success: false, uploaded: 0, assets: [], error: "Session expired. Please log in again." };
      }

      const data = await res.json();
      return data as { success: boolean; uploaded: number; assets: UploadedAsset[]; failed?: { name: string; error: string }[] };
    } catch (err) {
      return { success: false, uploaded: 0, assets: [], error: String(err) };
    }
  },
};
