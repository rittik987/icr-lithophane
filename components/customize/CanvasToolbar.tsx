"use client";

interface CanvasToolbarProps {
  onAddPhoto: () => void;
  onAddText: () => void;
  onChooseLayout: () => void;
  canAddPhoto: boolean;
  canAddText: boolean;
  layoutOpen: boolean;
  hasPhoto: boolean;
}

export default function CanvasToolbar({
  onAddPhoto,
  onAddText,
  onChooseLayout,
  canAddPhoto,
  canAddText,
  layoutOpen,
  hasPhoto,
}: CanvasToolbarProps) {
  if (!hasPhoto) return null;

  const btn =
    "flex-1 min-h-12 px-2 py-2 rounded-sm border border-[#e5ddd0] bg-white text-[#2e1e12] text-[12px] font-semibold font-sans flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-[#d47124] hover:text-[#d47124] transition-colors";

  return (
    <div className="grid grid-cols-3 gap-2">
      <button type="button" onClick={onAddPhoto} disabled={!canAddPhoto} className={btn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        Another photo
      </button>
      <button type="button" onClick={onAddText} disabled={!canAddText} className={btn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 7V5h16v2M12 5v14M8 19h8" />
        </svg>
        Write a wish
      </button>
      <button
        type="button"
        onClick={onChooseLayout}
        className={`${btn} ${layoutOpen ? "border-[#d47124] text-[#d47124] bg-[#fffbf7]" : ""}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        Ready design
      </button>
    </div>
  );
}
