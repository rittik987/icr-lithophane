"use client";

import { useRef, useState, useEffect } from "react";
import { TemplateConfig, PhotoSlot } from "@/lib/templates";
import CropperModal from "./CropperModal";

interface UploadSlotsProps {
  template: TemplateConfig;
  uploadedFiles: Record<string, File>;
  onUpload: (slotId: string, file: File) => void;
  onRemove: (slotId: string) => void;
}

export default function UploadSlots({
  template,
  uploadedFiles,
  onUpload,
  onRemove,
}: UploadSlotsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <p className="text-[#2e1e12] text-[16px] font-semibold font-sans">
          Upload {template.photoSlots.length > 1 ? "Your Photos" : "Your Photo"}
        </p>
        <span className="text-[#6e5c50] text-[12px] font-sans">
          {Object.keys(uploadedFiles).length} / {template.photoSlots.length}
        </span>
      </div>

      {template.photoSlots.map((slot) => (
        <UploadBox
          key={slot.id}
          slot={slot}
          file={uploadedFiles[slot.id] ?? null}
          onUpload={(file) => onUpload(slot.id, file)}
          onRemove={() => onRemove(slot.id)}
        />
      ))}
    </div>
  );
}

// ─── Single upload box ───────────────────────────────────

interface UploadBoxProps {
  slot: PhotoSlot;
  file: File | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

function UploadBox({ slot, file, onUpload, onRemove }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Stable blob URL — created once per file, revoked on cleanup ──
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ── Cropper state ────────────────────────────────────────
  const [cropSrc, setCropSrc] = useState<string | null>(null); // raw selected file src
  const [cropRawFile, setCropRawFile] = useState<File | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith("image/")) return;
    // Open cropper instead of uploading directly
    const url = URL.createObjectURL(f);
    setCropRawFile(f);
    setCropSrc(url);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleCropConfirm(croppedFile: File) {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropRawFile(null);
    onUpload(croppedFile);
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropRawFile(null);
  }

  // Aspect ratio from slot dimensions (w/h)
  const aspectRatio = slot.w / slot.h;

  return (
    <>
      <div className="bg-white border border-[#e5ddd0] rounded-2xl overflow-hidden shadow-sm">
        {/* Slot header */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${file ? "bg-[#1e7234]" : "bg-[#e5ddd0]"}`} />
            <p className="text-[#2e1e12] text-[14px] font-semibold font-sans">
              {slot.label}
            </p>
          </div>
          <p className="text-[#6e5c50] text-[11px] font-sans">{slot.cmLabel}</p>
        </div>

        {/* Content area */}
        {file && previewUrl ? (
          /* ── Uploaded: show preview thumbnail ── */
          <div
            className="relative mx-4 mb-4 rounded-xl overflow-hidden bg-[#f2ebdc]"
            style={{ aspectRatio: `${slot.w} / ${slot.h}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />

            {/* ✓ badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#1e7234] rounded-full px-2 py-1 shadow-sm">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5l2.5 2.5 3.5-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white text-[10px] font-semibold font-sans">Added</span>
            </div>

            {/* Change / Remove buttons */}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                style={{ color: "#2e1e12" }}
                className="bg-white/90 backdrop-blur-sm border border-white/60 rounded-full px-3 py-1.5 text-[11px] font-semibold font-sans shadow-sm hover:bg-white transition-colors"
              >
                Change
              </button>
              <button
                onClick={onRemove}
                style={{ color: "#c0392b" }}
                className="bg-white/90 backdrop-blur-sm border border-white/60 rounded-full px-3 py-1.5 text-[11px] font-semibold font-sans shadow-sm hover:bg-white transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          /* ── Empty: upload zone ── */
          <div
            role="button"
            tabIndex={0}
            aria-label={`Upload ${slot.label}`}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            className={`mx-4 mb-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-8 cursor-pointer transition-colors ${
              isDragging
                ? "border-[#e07a28] bg-[#fdf3e8]"
                : "border-[rgba(224,122,40,0.4)] bg-[#faf7f2] hover:border-[#e07a28] hover:bg-[#fdf3e8]"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#f2ebdc] border border-[#e5ddd0] flex items-center justify-center shadow-sm">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path d="M11 15V7M11 7l-3 3M11 7l3 3" stroke="#e07a28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17h14" stroke="#e07a28" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[#2e1e12] text-[13px] font-semibold font-sans">Tap to upload</p>
              <p className="text-[#6e5c50] text-[11px] font-sans mt-0.5">{slot.aspectHint}</p>
              <p className="text-[#c9b99f] text-[10px] font-sans mt-0.5">
                Cropper will open to select area
              </p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.heic,.heif,.webp"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* ── Cropper modal — full screen, rendered in portal via z-[60] ── */}
      {cropSrc && (
        <CropperModal
          imageSrc={cropSrc}
          aspectRatio={aspectRatio}
          slotLabel={slot.label}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
