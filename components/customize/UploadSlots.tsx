"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
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
      <div className="bg-white border border-[#e5ddd0] rounded-sm overflow-hidden shadow-sm">
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
            className="relative mx-4 mb-4 rounded-sm overflow-hidden bg-[#f2ebdc]"
            style={{ aspectRatio: `${slot.w} / ${slot.h}` }}
          >
            <Image
              src={previewUrl}
              alt="Uploaded preview"
              fill
              sizes="(max-width: 640px) 100vw, 450px"
              className="object-cover"
              unoptimized
            />

            {/* ✓ badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#1e7234] rounded-sm px-2 py-0.5 shadow-sm">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5l2.5 2.5 3.5-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white text-[10px] font-semibold font-sans">Added</span>
            </div>

            {/* Change / Remove buttons */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white/95 hover:bg-white backdrop-blur-sm border border-[#e5ddd0] hover:border-[#d47124] rounded-sm px-2 py-1 text-[11px] font-medium font-sans text-[#2e1e12] shadow-2xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Change</span>
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="bg-white/95 hover:bg-white backdrop-blur-sm border border-[#e5ddd0] hover:border-[#c0392b] rounded-sm px-2 py-1 text-[11px] font-medium font-sans text-[#c0392b] shadow-2xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Remove</span>
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
            className={`mx-4 mb-4 rounded-sm border-2 border-dashed flex flex-col items-center justify-center gap-3 py-8 cursor-pointer transition-colors ${
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
