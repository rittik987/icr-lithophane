"use client";

import { useState, useEffect, useCallback } from "react";
import { TemplateConfig } from "./templates";
import { fileToCompressedDataUrl, generateLithophanePreview } from "./exportPreview";
import { cartApi, uploadApi, getStoredToken, productApi } from "./api";

export const CART_STORAGE_KEY = "icr_lithophane_cart";
export const CART_EVENT_NAME = "icr_cart_updated";

export interface CartPhotoSlot {
  slotId: string;
  slotLabel: string;
  dataUrl: string; // local preview fallback or base64
  cloudinaryId?: string;
  url?: string;
  fileName?: string;
  aspectHint?: string;
  cmLabel?: string;
}

export interface CartTextField {
  fieldId: string;
  label: string;
  value: string;
}

export interface CartItem {
  id: string;
  serverItemId?: string; // backend DB cart item id
  templateId: string;
  templateName: string;
  previewDataUrl: string; // Composite preview export or Cloudinary URL
  previewUrl?: string; // Cloudinary secure URL
  price: number;
  originalPrice: number;
  quantity: number;
  photos: Record<string, CartPhotoSlot>;
  texts: Record<string, CartTextField>;
  createdAt: number;
}

/**
 * Converts a data URL to a browser File object for uploading.
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
  const binaryStr = atob(parts[1]);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

/**
 * Builds the complete dynamic payload for a CartItem from the current customization state.
 * Uploads slot photos and composite preview to Cloudinary via uploadApi.
 */
export async function buildCartItemPayload(
  template: TemplateConfig,
  uploadedFiles: Record<string, File>,
  textValues: Record<string, string>,
  customPreviewDataUrl?: string,
  prices?: { sellingPrice?: number; mrp?: number }
): Promise<Omit<CartItem, "id" | "createdAt">> {
  // Dynamically resolve pricing
  let itemPrice = prices?.sellingPrice;
  let itemOriginalPrice = prices?.mrp;

  if (itemPrice === undefined || itemOriginalPrice === undefined) {
    try {
      const activeProd = await productApi.getActiveProduct();
      if (activeProd) {
        if (itemPrice === undefined && activeProd.sellingPrice !== undefined) {
          itemPrice = Math.round(activeProd.sellingPrice / 100);
        }
        if (itemOriginalPrice === undefined && activeProd.mrp !== undefined) {
          itemOriginalPrice = Math.round(activeProd.mrp / 100);
        }
      }
    } catch {
      // Ignore network errors and fallback safely
    }
  }

  const resolvedPrice = itemPrice ?? 2999;
  const resolvedOriginalPrice = itemOriginalPrice ?? 4999;

  // 1. Generate composite preview if not provided
  let preview = customPreviewDataUrl;
  if (!preview) {
    preview = await generateLithophanePreview(template, uploadedFiles, textValues);
  }

  // 2. Prepare files to upload to Cloudinary
  const filesToUpload: File[] = [];

  for (const slot of template.photoSlots) {
    const file = uploadedFiles[slot.id];
    if (file) {
      const safeName = `${slot.id}___${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const prefixedFile = new File([file], safeName, { type: file.type });
      filesToUpload.push(prefixedFile);
    }
  }

  // Convert composite preview dataUrl to a File as well
  if (preview && preview.startsWith("data:")) {
    const previewFile = dataUrlToFile(preview, `preview___${template.id}_${Date.now()}.png`);
    filesToUpload.push(previewFile);
  }

  // 3. Upload to Cloudinary via uploadApi
  let uploadedAssets: { id: string; name: string; url: string }[] = [];
  if (filesToUpload.length > 0) {
    try {
      const uploadRes = await uploadApi.uploadFiles(filesToUpload, "icr-customizations");
      if (uploadRes.success && Array.isArray(uploadRes.assets)) {
        uploadedAssets = uploadRes.assets;
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, using local previews:", err);
    }
  }

  // Find preview asset if uploaded
  let previewCloudinaryUrl: string | undefined;
  const previewAsset = uploadedAssets.find((a) => a.name.startsWith("preview___"));
  if (previewAsset) {
    previewCloudinaryUrl = previewAsset.url;
  }

  // 4. Build photo slots
  const photos: Record<string, CartPhotoSlot> = {};
  for (const slot of template.photoSlots) {
    const file = uploadedFiles[slot.id];
    if (file) {
      const asset = uploadedAssets.find((a) => a.name.startsWith(`${slot.id}___`));
      const dataUrl = await fileToCompressedDataUrl(file, 900, 0.85);

      photos[slot.id] = {
        slotId: slot.id,
        slotLabel: slot.label,
        dataUrl,
        cloudinaryId: asset?.id,
        url: asset?.url || dataUrl,
        fileName: file.name,
        aspectHint: slot.aspectHint,
        cmLabel: slot.cmLabel,
      };
    }
  }

  // 5. Assemble dynamic text fields
  const texts: Record<string, CartTextField> = {};
  for (const field of template.textFields) {
    const val = textValues[field.id] ?? field.defaultValue;
    texts[field.id] = {
      fieldId: field.id,
      label: field.label,
      value: val,
    };
  }

  return {
    templateId: template.id,
    templateName: template.name,
    previewDataUrl: previewCloudinaryUrl || preview,
    previewUrl: previewCloudinaryUrl,
    price: resolvedPrice,
    originalPrice: resolvedOriginalPrice,
    quantity: 1,
    photos,
    texts,
  };
}

/**
 * Retrieves the current cart array from localStorage safely.
 */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read cart from localStorage:", err);
    return [];
  }
}

/**
 * Saves the cart to localStorage and notifies all components.
 */
export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_EVENT_NAME, { detail: items }));
  } catch (err) {
    console.error("Failed to save cart to localStorage:", err);
  }
}

/**
 * Adds an item to the cart and returns the created CartItem.
 * Also syncs with the server DB if user is logged in.
 */
export function addToCart(item: Omit<CartItem, "id" | "createdAt">): CartItem {
  const current = getCart();
  const newItem: CartItem = {
    ...item,
    id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    createdAt: Date.now(),
  };

  const updated = [newItem, ...current];
  saveCart(updated);

  // Sync to server in background if user is authenticated
  if (typeof window !== "undefined" && getStoredToken()) {
    cartApi
      .addItem({
        templateId: newItem.templateId,
        templateName: newItem.templateName,
        quantity: newItem.quantity || 1,
        unitPrice: Math.round(newItem.price * 100),
        originalPrice: Math.round(newItem.originalPrice * 100),
        previewUrl: newItem.previewUrl || newItem.previewDataUrl,
        photos: Object.values(newItem.photos).map((p) => ({
          slotId: p.slotId,
          slotLabel: p.slotLabel,
          cloudinaryId: p.cloudinaryId || "photo",
          url: p.url || p.dataUrl,
          fileName: p.fileName,
          aspectHint: p.aspectHint,
          cmLabel: p.cmLabel,
        })),
        texts: Object.values(newItem.texts),
      })
      .catch((err) => console.warn("Background server cart add warning:", err));
  }

  return newItem;
}

/**
 * Updates item quantity by delta (+1 or -1). Removes if quantity drops <= 0.
 */
export function updateCartQuantity(id: string, delta: number): void {
  const current = getCart();
  const targetItem = current.find((i) => i.id === id);
  const updated = current
    .map((item) => {
      if (item.id === id) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    })
    .filter((item): item is CartItem => item !== null);

  saveCart(updated);

  // Background update on server if logged in
  if (typeof window !== "undefined" && getStoredToken() && targetItem?.serverItemId) {
    const nextQty = (targetItem.quantity || 1) + delta;
    if (nextQty > 0) {
      cartApi.updateItemQuantity(targetItem.serverItemId, nextQty).catch(() => {});
    } else {
      cartApi.removeItem(targetItem.serverItemId).catch(() => {});
    }
  }
}

/**
 * Removes an item from the cart.
 */
export function removeFromCart(id: string): void {
  const current = getCart();
  const targetItem = current.find((i) => i.id === id);
  const updated = current.filter((item) => item.id !== id);
  saveCart(updated);

  if (typeof window !== "undefined" && getStoredToken() && targetItem?.serverItemId) {
    cartApi.removeItem(targetItem.serverItemId).catch(() => {});
  }
}

/**
 * Empties the cart.
 */
export function clearCart(): void {
  saveCart([]);
  if (typeof window !== "undefined" && getStoredToken()) {
    cartApi.clearCart().catch(() => {});
  }
}

/**
 * Calculates total count of all items in the cart.
 */
export function getCartTotalCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

/**
 * Calculates subtotal price of all items in the cart.
 */
export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
}

/**
 * Synchronizes local cart items into the backend database.
 * Ensures server DB has the items before checkout order creation.
 */
export async function syncCartWithServer(localItems?: CartItem[], force = false): Promise<void> {
  if (typeof window === "undefined") return;
  const token = getStoredToken();
  if (!token) return;

  const currentLocal = localItems || getCart();
  if (currentLocal.length === 0) return;

  try {
    if (force) {
      await cartApi.clearCart(false); // preserve assets for immediate re-addition
      for (const item of currentLocal) {
        await cartApi.addItem({
          templateId: item.templateId,
          templateName: item.templateName,
          quantity: item.quantity || 1,
          unitPrice: Math.round(item.price * 100),
          originalPrice: Math.round(item.originalPrice * 100),
          previewUrl: item.previewUrl || item.previewDataUrl,
          photos: Object.values(item.photos).map((p) => ({
            slotId: p.slotId,
            slotLabel: p.slotLabel,
            cloudinaryId: p.cloudinaryId || "photo",
            url: p.url || p.dataUrl,
            fileName: p.fileName,
            aspectHint: p.aspectHint,
            cmLabel: p.cmLabel,
          })),
          texts: Object.values(item.texts),
        });
      }
      return;
    }

    const serverRes = await cartApi.getCart();
    if (!serverRes.success) return;

    const serverCart = serverRes.data?.cart;
    const serverItemCount = serverCart?.items?.length || 0;

    // If server cart is empty and we have items locally, upload each item
    if (serverItemCount === 0 && currentLocal.length > 0) {
      for (const item of currentLocal) {
        await cartApi.addItem({
          templateId: item.templateId,
          templateName: item.templateName,
          quantity: item.quantity || 1,
          unitPrice: Math.round(item.price * 100),
          originalPrice: Math.round(item.originalPrice * 100),
          previewUrl: item.previewUrl || item.previewDataUrl,
          photos: Object.values(item.photos).map((p) => ({
            slotId: p.slotId,
            slotLabel: p.slotLabel,
            cloudinaryId: p.cloudinaryId || "photo",
            url: p.url || p.dataUrl,
            fileName: p.fileName,
            aspectHint: p.aspectHint,
            cmLabel: p.cmLabel,
          })),
          texts: Object.values(item.texts),
        });
      }
    }
  } catch (err) {
    console.error("Cart server sync warning:", err);
  }
}

/**
 * Custom React hook for reactive cart state synchronization across any component.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return getCart();
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isLoaded, setIsLoaded] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    const loaded = getCart();
    setItems(loaded);
    setIsLoaded(true);

    // Refresh item prices against active backend product to ensure live interactive pricing
    productApi
      .getActiveProduct()
      .then((activeProd) => {
        if (!activeProd) return;
        const currentPrice = Math.round(activeProd.sellingPrice / 100);
        const currentMrp = Math.round(activeProd.mrp / 100);
        const currentCart = getCart();
        let hasPriceDiff = false;
        const refreshedCart = currentCart.map((item) => {
          if (item.price !== currentPrice || item.originalPrice !== currentMrp) {
            hasPriceDiff = true;
            return {
              ...item,
              price: currentPrice,
              originalPrice: currentMrp,
            };
          }
          return item;
        });
        if (hasPriceDiff) {
          saveCart(refreshedCart);
        }
      })
      .catch(() => {});

    // Sync in background if authenticated
    if (getStoredToken() && loaded.length > 0) {
      syncCartWithServer(loaded).catch(() => {});
    }

    function handleCartChange() {
      setItems(getCart());
    }

    window.addEventListener(CART_EVENT_NAME, handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.removeEventListener(CART_EVENT_NAME, handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, []);

  const totalCount = getCartTotalCount(items);
  const subtotal = getCartSubtotal(items);

  const add = useCallback((item: Omit<CartItem, "id" | "createdAt">) => {
    return addToCart(item);
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    updateCartQuantity(id, delta);
  }, []);

  const remove = useCallback((id: string) => {
    removeFromCart(id);
  }, []);

  const clear = useCallback(() => {
    clearCart();
  }, []);

  return {
    items,
    totalCount,
    subtotal,
    isLoaded,
    add,
    updateQty,
    remove,
    clear,
  };
}
