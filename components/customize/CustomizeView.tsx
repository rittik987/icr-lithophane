"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { Stage as StageType } from "konva/lib/Stage";
import { TEMPLATES, getDefaultTemplate, getTemplateById, isLayoutTemplate, slotAspect } from "@/lib/templates";
import { buildCartItemPayload, addToCart } from "@/lib/cart";
import { productApi, StorefrontProduct } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import CustomizeHeader from "@/components/customize/CustomizeHeader";
import TemplateBottomSheet from "@/components/customize/TemplateBottomSheet";
import CanvasToolbar from "@/components/customize/CanvasToolbar";
import SizeSlider from "@/components/customize/SizeSlider";
import StickyOrderBar from "@/components/customize/StickyOrderBar";
import CropperModal from "@/components/customize/CropperModal";
import {
  CANVAS_H,
  CANVAS_W,
  FONT_CHOICES,
  composeFontStyle,
  isBoldStyle,
  isItalicStyle,
  MAX_FONT_SIZE,
  MAX_PHOTOS,
  MAX_TEXTS,
  MIN_FONT_SIZE,
  MIN_PHOTO_SIZE,
  TEXT_COLORS,
  applyLayout,
  clampPhoto,
  clampText,
  createTextObject,
  filesFromScene,
  isPlaceholderText,
  emptySlots,
  placeNewPhoto,
  placePhotoInSlot,
  scenePhotos,
  sceneTexts,
  textsFromScene,
  type SceneObject,
} from "@/lib/canvasScene";

const LithophaneEditor = dynamic(() => import("@/components/customize/LithophaneEditor"), {
  ssr: false,
});
const PreviewModal = dynamic(() => import("@/components/customize/PreviewModal"), {
  ssr: false,
});

interface CustomizeViewProps {
  initialProduct?: StorefrontProduct | null;
}

function readImageSize(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read photo"));
    };
    img.src = url;
  });
}

export default function CustomizeView({ initialProduct }: CustomizeViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState<StorefrontProduct | null>(initialProduct || null);

  useEffect(() => {
    productApi
      .getActiveProduct()
      .then((prod) => {
        if (prod) setProduct(prod);
      })
      .catch((err) => {
        console.error("Failed to load active product on customize:", err);
      });
  }, []);

  const sellingPrice =
    product?.sellingPrice !== undefined
      ? Math.round(product.sellingPrice / 100)
      : 2999;
  const mrp =
    product?.mrp !== undefined ? Math.round(product.mrp / 100) : 2199;

  const [selectedId, setSelectedLayoutId] = useState<string>(getDefaultTemplate().id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showMoveTip, setShowMoveTip] = useState(false);
  const [cropQueue, setCropQueue] = useState<
    { src: string; file: File; aspect?: number; slotId?: string }[]
  >([]);
  const [pendingSlotId, setPendingSlotId] = useState<string | null>(null);

  const template = getTemplateById(selectedId);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<StageType | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(320);

  useEffect(() => {
    function measure() {
      if (canvasWrapRef.current) {
        setCanvasWidth(canvasWrapRef.current.clientWidth);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    const observer = canvasWrapRef.current ? new ResizeObserver(measure) : null;
    if (canvasWrapRef.current) observer?.observe(canvasWrapRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, []);

  const photos = useMemo(() => scenePhotos(objects), [objects]);
  const texts = useMemo(() => sceneTexts(objects), [objects]);
  const isLayout = isLayoutTemplate(template);
  const openSlots = useMemo(() => emptySlots(template, objects), [template, objects]);
  const isOrderReady = photos.length > 0;
  const selectedObject = objects.find((o) => o.id === selectedObjectId) ?? null;
  const selectedText = selectedObject?.kind === "text" ? selectedObject : null;
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTextId && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [editingTextId]);

  function closeKeyboard() {
    textInputRef.current?.blur();
    setEditingTextId(null);
  }

  function updateObject(next: SceneObject) {
    setShowMoveTip(false);
    setObjects((prev) => prev.map((o) => (o.id === next.id ? next : o)));
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const slot = pendingSlotId
      ? template.photoSlots.find((item) => item.id === pendingSlotId)
      : isLayout
        ? openSlots[0]
        : undefined;
    setPendingSlotId(null);

    const remaining = slot ? 1 : MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      showToast({
        title: "4 photos is the limit",
        message: "Remove one photo if you want to add another.",
        type: "info",
      });
      return;
    }
    const picked = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const files = picked.slice(0, remaining);
    if (files.length === 0) return;
    if (!slot && picked.length > remaining) {
      showToast({
        title: "Only 4 photos",
        message: `Added ${files.length}. You can have at most 4 on one lamp.`,
        type: "info",
      });
    }
    setCropQueue(
      files.map((file) => ({
        src: URL.createObjectURL(file),
        file,
        aspect: slot ? slotAspect(slot) : undefined,
        slotId: slot?.id,
      }))
    );
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function closeCurrentCrop() {
    const current = cropQueue[0];
    if (current) URL.revokeObjectURL(current.src);
    setCropQueue((queue) => queue.slice(1));
  }

  async function handleCropConfirm(cropped: File) {
    const job = cropQueue[0];
    try {
      const slot = job?.slotId
        ? template.photoSlots.find((item) => item.id === job.slotId)
        : undefined;
      if (slot) {
        const photo = placePhotoInSlot(cropped, slot);
        setObjects((prev) => [...prev.filter((item) => !(item.kind === "photo" && item.slotId === slot.id)), photo]);
        setSelectedObjectId(photo.id);
      } else {
        const { w, h } = await readImageSize(cropped);
        let addedId = "";
        let wasEmpty = false;
        setObjects((prev) => {
          wasEmpty = scenePhotos(prev).length === 0;
          const photo = placeNewPhoto(prev, cropped, w, h);
          addedId = photo.id;
          return [...prev, photo];
        });
        setSelectedObjectId(addedId);
        if (wasEmpty) setShowMoveTip(true);
      }
    } catch {
      showToast({ title: "Photo skipped", message: "That image could not be opened.", type: "error" });
    }
    closeCurrentCrop();
  }

  function pickForSlot(slotId: string) {
    setPendingSlotId(slotId);
    photoInputRef.current?.click();
  }

  function handleSelectObject(id: string | null) {
    setSelectedObjectId(id);
    if (id !== editingTextId) setEditingTextId(null);
  }

  function handleEditText(id: string) {
    setSelectedObjectId(id);
    setEditingTextId(id);
  }

  function handleAddText() {
    if (texts.length >= MAX_TEXTS) return;
    const item = createTextObject("");
    setObjects((prev) => [...prev, item]);
    setSelectedObjectId(item.id);
    setEditingTextId(null);
  }

  function handleDeleteSelected() {
    if (!selectedObjectId) return;
    setObjects((prev) => prev.filter((o) => o.id !== selectedObjectId));
    if (editingTextId === selectedObjectId) setEditingTextId(null);
    setSelectedObjectId(null);
  }

  function handleTemplateSelect(id: string) {
    const nextTemplate = getTemplateById(id);
    setSelectedLayoutId(id);
    setObjects((prev) => applyLayout(nextTemplate, prev));
    setSelectedObjectId(null);
    setEditingTextId(null);
    setSheetOpen(false);
    showToast({
      title: nextTemplate.kind === "layout" ? "Ready design added" : "Your own layout",
      message:
        nextTemplate.kind === "layout"
          ? "Tap a dashed box to add a photo. The crop will match that space."
          : "Move photos and wishes anywhere.",
      type: "info",
    });
  }

  function exportPreviewUrl(): string | undefined {
    if (!stageRef.current || canvasWidth <= 0) return undefined;
    try {
      return stageRef.current.toDataURL({ pixelRatio: 800 / canvasWidth });
    } catch {
      return undefined;
    }
  }

  async function handleAddToCart(customPreviewUrl?: string) {
    if (isAddingToCart || !isOrderReady) return;
    setIsAddingToCart(true);
    try {
      const payload = await buildCartItemPayload(
        template,
        filesFromScene(objects),
        textsFromScene(objects),
        customPreviewUrl || exportPreviewUrl(),
        { sellingPrice, mrp },
        objects
      );
      const createdItem = addToCart(payload);
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(`/cart?added=${createdItem.id}`)}`);
        return;
      }
      showToast({
        title: "Added to your Cart!",
        message: `${template.name} · ₹${sellingPrice.toLocaleString("en-IN")}`,
        type: "success",
        action: { label: "View Cart", href: "/cart" },
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Could not add to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  }

  async function handlePlaceOrder(customPreviewUrl?: string) {
    if (isPlacingOrder || !isOrderReady) return;
    setIsPlacingOrder(true);
    try {
      const payload = await buildCartItemPayload(
        template,
        filesFromScene(objects),
        textsFromScene(objects),
        customPreviewUrl || exportPreviewUrl(),
        { sellingPrice, mrp },
        objects
      );
      const createdItem = addToCart(payload);
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(`/checkout?buyNow=${createdItem.id}`)}`);
        return;
      }
      router.push(`/checkout?buyNow=${encodeURIComponent(createdItem.id)}`);
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Something went wrong preparing your order. Please try again.");
      setIsPlacingOrder(false);
    }
  }

  return (
    <div className="h-[100dvh] bg-[#faf7f2] flex flex-col overflow-hidden">
      <CustomizeHeader />

      <div className="flex-1 min-h-0 flex flex-col pt-16 w-full max-w-lg mx-auto lg:max-w-[1180px] lg:flex-row lg:items-stretch lg:gap-0">
        <div className="shrink-0 px-4 flex flex-col gap-2.5 pt-3 lg:flex-1 lg:min-w-0 lg:justify-center lg:px-8 lg:pt-5 lg:pb-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="font-serif text-[20px] text-[#2e1e12] leading-tight">Put your photo on the lamp</h1>
              <p className="text-[#6e5c50] text-[12px] font-sans mt-0.5">
                {isLayout
                  ? "Tap a dashed box to add a photo. Crop matches that space."
                  : photos.length === 0
                    ? "Start with one photo. You can move it after."
                    : "Drag to move. Pinch or use the line below to change size."}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[#2e1e12] text-[18px] font-bold font-sans leading-none">
                ₹{sellingPrice.toLocaleString("en-IN")}
              </p>
              {mrp && mrp > sellingPrice ? (
                <p className="text-[#8a7b6e] text-[11px] line-through font-sans mt-0.5">
                  ₹{mrp.toLocaleString("en-IN")}
                </p>
              ) : null}
            </div>
          </div>

          <div
            ref={canvasWrapRef}
            className="relative w-full rounded-sm overflow-hidden border-2 border-[#d8cbb8] bg-[#fffdf8] shadow-sm"
            style={{ touchAction: objects.length === 0 ? "auto" : "none", aspectRatio: "4 / 3" }}
          >
          {canvasWidth > 0 && (
            <LithophaneEditor
              objects={objects}
              selectedId={selectedObjectId}
              onSelect={handleSelectObject}
              onChangeObject={updateObject}
              onEditText={handleEditText}
              containerWidth={canvasWidth}
              stageRef={stageRef}
            />
          )}

          {selectedObjectId && objects.length > 0 && selectedObject && (
            <>
              <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                {/* <button
                  type="button"
                  onClick={() =>
                    updateObject({
                      ...selectedObject,
                      rotation: (selectedObject.rotation + 15) % 360,
                    })
                  }
                  className="h-10 px-3 rounded-sm bg-[#2e1e12] text-white text-[13px] font-semibold font-sans shadow-[0_2px_10px_rgba(46,30,18,0.28)] cursor-pointer"
                >
                  Rotate
                </button> */}
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="h-10 px-3 rounded-sm bg-[#A82525] text-white text-[13px] font-semibold font-sans shadow-[0_2px_10px_rgba(46,30,18,0.28)] cursor-pointer"
                  aria-label={selectedObject.kind === "text" ? "Remove this message" : "Remove this photo"}
                >
                  Remove
                </button>
              </div>
              {/* <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none flex justify-center">
                <p className="bg-[#2e1e12]/80 text-white text-[11px] font-sans font-semibold px-2.5 py-1.5 rounded-sm text-center">
                  Orange dots resize · dark top circle or Rotate turns it
                </p>
              </div> */}
            </>
          )}

          {isLayout &&
            openSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => pickForSlot(slot.id)}
                className="absolute z-[5] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-[#e07a28] bg-[#fff6ed]/85 cursor-pointer"
                style={{
                  left: `${(slot.x / CANVAS_W) * 100}%`,
                  top: `${(slot.y / CANVAS_H) * 100}%`,
                  width: `${(slot.w / CANVAS_W) * 100}%`,
                  height: `${(slot.h / CANVAS_H) * 100}%`,
                }}
              >
                <span className="w-10 h-10 rounded-full bg-white border border-[#f3d2b0] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e07a28" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </span>
                <span className="text-[#c96a1e] text-[12px] font-semibold font-sans px-1 text-center leading-tight">
                  Add photo
                </span>
              </button>
            ))}

          {objects.length === 0 && !isLayout && (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center cursor-pointer"
            >
              <span className="w-14 h-14 rounded-full bg-[#fff6ed] border border-[#f3d2b0] flex items-center justify-center mb-3">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e07a28" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </span>
              <span className="text-[#2e1e12] text-[16px] font-semibold font-sans">Tap to add your photo</span>
              <span className="text-[#6e5c50] text-[13px] font-sans mt-1">From your phone gallery</span>
              <span className="mt-4 inline-flex h-11 items-center rounded-sm bg-[#e07a28] px-5 text-white text-[14px] font-semibold">
                Choose photo
              </span>
            </button>
          )}
        </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-28 flex flex-col gap-4 pt-3 lg:w-[420px] lg:max-w-[420px] lg:flex-none lg:px-8 lg:pt-5 lg:pb-5 lg:border-l lg:border-[#e5ddd0] lg:bg-[#fffdf8]">
        <ol className="flex items-center gap-2 text-[11px] font-sans font-semibold">
          <li className={`flex-1 text-center py-1.5 rounded-sm ${photos.length === 0 ? "bg-[#e07a28] text-white" : "bg-[#eaf5ec] text-[#1e7234]"}`}>
            1. Photo
          </li>
          <li className={`flex-1 text-center py-1.5 rounded-sm ${photos.length > 0 ? "bg-[#e07a28] text-white" : "bg-[#f2ebdc] text-[#8a7b6e]"}`}>
            2. Arrange
          </li>
          <li className={`flex-1 text-center py-1.5 rounded-sm ${photos.length > 0 ? "bg-[#fff6ed] text-[#c96a1e]" : "bg-[#f2ebdc] text-[#8a7b6e]"}`}>
            3. Order
          </li>
        </ol>

        {photos.length === 0 && !isLayout && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="text-center text-[13px] bg-[#e07a28] py-2 rounded-sm font-semibold text-[#ffffff] hover:text-[#d47124] cursor-pointer"
          >
            Or start with a ready design
          </button>
        )}

        {showMoveTip && photos.length > 0 && (
          <div className="rounded-sm bg-[#fff6ed] border border-[#f3d2b0] px-3.5 py-3 text-[13px] text-[#2e1e12] font-sans leading-relaxed">
            <p className="font-semibold">Now arrange it</p>
            <p className="text-[#6e5c50] mt-0.5">Hold the photo and drag. Pull the orange corners to make it bigger or smaller.</p>
          </div>
        )}

        <CanvasToolbar
          onAddPhoto={() => {
            if (isLayout && openSlots[0]) setPendingSlotId(openSlots[0].id);
            photoInputRef.current?.click();
          }}
          onAddText={handleAddText}
          onChooseLayout={() => setSheetOpen((open) => !open)}
          canAddPhoto={isLayout ? openSlots.length > 0 : photos.length < MAX_PHOTOS}
          canAddText={texts.length < MAX_TEXTS}
          layoutOpen={sheetOpen}
          hasPhoto={photos.length > 0 || isLayout}
        />
        {isLayout && openSlots.length > 0 && (
          <p className="text-center text-[12px] text-[#6e5c50] font-sans">
            Tap a dashed box on the lamp to add a photo. Crop will match that box.
          </p>
        )}
        {photos.length >= MAX_PHOTOS && (
          <p className="text-center text-[12px] text-[#6e5c50] font-sans">
            4 photos is the most you can put on one lamp.
          </p>
        )}

        {selectedObject?.kind === "photo" && (
          <div className="rounded-sm border border-[#e5ddd0] bg-white p-3 flex flex-col gap-3">
            <p className="text-[13px] text-[#6e5c50] font-sans">
              Drag with one finger. Pinch with two fingers to make it bigger or smaller.
            </p>
            <SizeSlider
              kind="photo"
              label="Photo size"
              value={selectedObject.width}
              min={MIN_PHOTO_SIZE}
              max={CANVAS_W}
              onChange={(width) => {
                setShowMoveTip(false);
                setObjects((prev) =>
                  prev.map((item) => {
                    if (item.id !== selectedObject.id || item.kind !== "photo") return item;
                    const ratio = item.height / item.width;
                    const height = width * ratio;
                    const cx = item.x + item.width / 2;
                    const cy = item.y + item.height / 2;
                    return clampPhoto({
                      ...item,
                      width,
                      height,
                      x: cx - width / 2,
                      y: cy - height / 2,
                    });
                  })
                );
              }}
            />
          </div>
        )}

        {selectedText && (
          <div className="rounded-sm border border-[#e5ddd0] bg-white p-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[#2e1e12]">Write your message</span>
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    closeKeyboard();
                  }}
                  className="h-8 px-3 rounded-sm bg-[#2e1e12] text-white text-[12px] font-semibold cursor-pointer"
                >
                  Done
                </button>
              </span>
              <input
                ref={textInputRef}
                value={selectedText.text}
                maxLength={60}
                enterKeyHint="done"
                inputMode="text"
                autoComplete="off"
                onFocus={() => {
                  setEditingTextId(selectedText.id);
                  if (isPlaceholderText(selectedText.text)) {
                    updateObject({ ...selectedText, text: "" });
                  }
                }}
                onBlur={() => {
                  window.setTimeout(() => {
                    if (document.activeElement !== textInputRef.current) {
                      setEditingTextId(null);
                    }
                  }, 0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    closeKeyboard();
                  }
                }}
                onChange={(e) =>
                  updateObject({ ...selectedText, text: e.target.value.slice(0, 60) })
                }
                className="w-full px-3.5 py-3 rounded-sm border border-[#E2D8C9] bg-[#fffdf8] text-sm font-medium text-[#2E1E12] outline-none focus:border-[#D96B27]"
                placeholder="Happy birthday, I love you..."
              />
              <span className="text-[12px] text-[#6e5c50] font-sans">
                {editingTextId === selectedText.id
                  ? "Tap Done on the keyboard when you finish."
                  : "Tap the words on the lamp again to type."}
              </span>
            </label>
            <SizeSlider
              label="Text size"
              value={selectedText.fontSize}
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              onChange={(fontSize) => {
                setObjects((prev) =>
                  prev.map((item) =>
                    item.id === selectedText.id && item.kind === "text"
                      ? clampText({ ...item, fontSize })
                      : item
                  )
                );
              }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  updateObject({
                    ...selectedText,
                    fontStyle: composeFontStyle(
                      !isBoldStyle(selectedText.fontStyle),
                      isItalicStyle(selectedText.fontStyle)
                    ),
                  })
                }
                className={`w-11 h-11 rounded-sm border text-[16px] font-bold cursor-pointer ${
                  isBoldStyle(selectedText.fontStyle)
                    ? "border-[#e07a28] bg-[#fff6ed] text-[#c96a1e]"
                    : "border-[#e5ddd0] bg-white text-[#2e1e12]"
                }`}
                aria-label="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() =>
                  updateObject({
                    ...selectedText,
                    fontStyle: composeFontStyle(
                      isBoldStyle(selectedText.fontStyle),
                      !isItalicStyle(selectedText.fontStyle)
                    ),
                  })
                }
                className={`w-11 h-11 rounded-sm border text-[16px] italic cursor-pointer ${
                  isItalicStyle(selectedText.fontStyle)
                    ? "border-[#e07a28] bg-[#fff6ed] text-[#c96a1e]"
                    : "border-[#e5ddd0] bg-white text-[#2e1e12]"
                }`}
                aria-label="Italic"
              >
                I
              </button>
              <p className="text-[12px] text-[#6e5c50] font-sans">Bold and slant</p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#2e1e12] mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {TEXT_COLORS.map((color) => {
                  const selected = selectedText.fill === color.value;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => updateObject({ ...selectedText, fill: color.value })}
                      title={color.label}
                      aria-label={color.label}
                      className={`w-9 h-9 rounded-full border-2 cursor-pointer shadow-sm ${
                        selected
                          ? "border-[#e07a28] ring-2 ring-[#f3d2b0]"
                          : color.value === "#ffffff" || color.value === "#f4e8d0"
                            ? "border-[#c9b99f]"
                            : "border-[#e5ddd0]"
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#2e1e12] mb-2">Font</p>
              <div className="grid grid-cols-3 gap-2">
                {FONT_CHOICES.map((font) => {
                  const selected = (selectedText.fontFamily || "") === font.family;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => updateObject({ ...selectedText, fontFamily: font.family })}
                      className={`h-11 rounded-sm border text-[13px] cursor-pointer ${
                        selected
                          ? "border-[#e07a28] bg-[#fff6ed] text-[#c96a1e]"
                          : "border-[#e5ddd0] bg-white text-[#2e1e12]"
                      }`}
                      style={{ fontFamily: font.family }}
                    >
                      {font.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[13px] text-[#6e5c50] font-sans">
              Pinch the words with two fingers, like Instagram. Or use the line below.
            </p>
            
          </div>
        )}

        {isOrderReady && (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="text-center bg-[#e07a28] text-[13px] font-semibold text-[#ffffff] py-2 px-4 rounded-sm hover:text-[#d47124] cursor-pointer"
          >
            See how the lamp will look
          </button>
        )}

        {isOrderReady && (
          <div className="hidden lg:flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isAddingToCart || isPlacingOrder}
              onClick={() => handleAddToCart()}
              className="flex-1 h-12 rounded-sm font-semibold font-sans text-[14px] border border-[#1a1412] text-[#1a1412] hover:bg-[#1a1412]/5 cursor-pointer disabled:opacity-50"
            >
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
            <button
              type="button"
              disabled={isAddingToCart || isPlacingOrder}
              onClick={() => handlePlaceOrder()}
              className="flex-1 h-12 rounded-sm font-semibold font-sans text-[14px] bg-[#e07a28] hover:bg-[#c96a1f] text-white cursor-pointer disabled:opacity-50"
            >
              {isPlacingOrder ? "Please wait..." : "Buy Now"}
            </button>
          </div>
        )}
        </div>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {cropQueue[0] && (
        <CropperModal
          imageSrc={cropQueue[0].src}
          aspect={cropQueue[0].aspect}
          onConfirm={handleCropConfirm}
          onCancel={closeCurrentCrop}
        />
      )}

      <TemplateBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        templates={TEMPLATES}
        selectedId={selectedId}
        onSelect={handleTemplateSelect}
      />

      {previewOpen && (
        <PreviewModal
          template={template}
          uploadedFiles={filesFromScene(objects)}
          textValues={textsFromScene(objects)}
          sceneObjects={objects}
          onClose={() => setPreviewOpen(false)}
          onAddToCart={(url) => handleAddToCart(url)}
          onContinue={(url) => {
            setPreviewOpen(false);
            handlePlaceOrder(url);
          }}
        />
      )}

      <StickyOrderBar
        isReady={isOrderReady}
        totalSlots={1}
        uploadedCount={photos.length}
        onAddToCart={() => handleAddToCart()}
        onBuyNow={() => handlePlaceOrder()}
        onNeedPhoto={() => photoInputRef.current?.click()}
        isAddingToCart={isAddingToCart}
        isPlacingOrder={isPlacingOrder}
      />
    </div>
  );
}
