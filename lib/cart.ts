"use client";

import { useState, useEffect, useCallback } from "react";
import { TemplateConfig } from "./templates";
import { fileToCompressedDataUrl, generateLithophanePreview } from "./exportPreview";

export const CART_STORAGE_KEY = "icr_lithophane_cart";
export const CART_EVENT_NAME = "icr_cart_updated";

export interface CartPhotoSlot {
  slotId: string;
  slotLabel: string;
  dataUrl: string; // Base64 data URL
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
  templateId: string;
  templateName: string;
  previewDataUrl: string; // Composite lithophane preview export
  price: number;
  originalPrice: number;
  quantity: number;
  photos: Record<string, CartPhotoSlot>;
  texts: Record<string, CartTextField>;
  createdAt: number;
}

/**
 * Builds the complete dynamic payload for a CartItem from the current customization state.
 */
export async function buildCartItemPayload(
  template: TemplateConfig,
  uploadedFiles: Record<string, File>,
  textValues: Record<string, string>,
  customPreviewDataUrl?: string
): Promise<Omit<CartItem, "id" | "createdAt">> {
  // 1. Generate preview if not provided
  let preview = customPreviewDataUrl;
  if (!preview) {
    preview = await generateLithophanePreview(template, uploadedFiles, textValues);
  }

  // 2. Compress and encode each slot photo into base64
  const photos: Record<string, CartPhotoSlot> = {};
  for (const slot of template.photoSlots) {
    const file = uploadedFiles[slot.id];
    if (file) {
      const dataUrl = await fileToCompressedDataUrl(file, 900, 0.85);
      photos[slot.id] = {
        slotId: slot.id,
        slotLabel: slot.label,
        dataUrl,
        fileName: file.name,
        aspectHint: slot.aspectHint,
        cmLabel: slot.cmLabel,
      };
    }
  }

  // 3. Assemble dynamic text fields
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
    previewDataUrl: preview,
    price: 2999,
    originalPrice: 4999,
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
    // If quota exceeded, try trimming previews or alert
    alert("Could not save to bag — browser storage is full. Please clear some items.");
  }
}

/**
 * Adds an item to the cart and returns the created CartItem.
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
  return newItem;
}

/**
 * Updates item quantity by delta (+1 or -1). Removes if quantity drops <= 0.
 */
export function updateCartQuantity(id: string, delta: number): void {
  const current = getCart();
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
}

/**
 * Removes an item from the cart.
 */
export function removeFromCart(id: string): void {
  const current = getCart();
  const updated = current.filter((item) => item.id !== id);
  saveCart(updated);
}

/**
 * Empties the cart.
 */
export function clearCart(): void {
  saveCart([]);
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
 * Custom React hook for reactive cart state synchronization across any component.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(getCart());
    setIsLoaded(true);

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
