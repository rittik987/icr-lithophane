export default function Footer() {
  return (
    <footer className="border-t border-[#e5ddd0] flex flex-col items-center gap-3 px-4 pt-6 pb-24 lg:pb-6 w-full">
      {/* Brand name */}
      <p className="text-[#2e1e12] text-base font-bold tracking-wide text-center font-serif">
        ICR CUSTOM CREATIONS
      </p>

      {/* Tagline */}
      <p className="text-[#6e5c50] text-[11px] text-center leading-relaxed max-w-xs font-sans">
        Crafted with pride in India. Each natural walnut frame is individually
        carved and quality inspected.
      </p>

      {/* Copyright */}
      <p className="text-[rgba(110,92,80,0.8)] text-[10px] tracking-widest uppercase text-center font-sans">
        &copy; ICR CUSTOM CREATIONS. ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
}
