"use client";

import React, { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  searchable = true,
  disabled = false,
  className = "",
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to { value, label }
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options when searching
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (e.key === "Enter" && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full text-left font-sans ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm("");
          }
        }}
        className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm flex items-center justify-between transition-all cursor-pointer ${
          isOpen
            ? "border-[#e07a28] ring-2 ring-[#e07a28]/15 text-[#2e1e12] shadow-xs"
            : "border-[#dcd4c8] hover:border-[#c4b8a7] text-[#2e1e12]"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-[#faf7f2]" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`truncate block ${
            selectedOption ? "font-medium text-[#2e1e12]" : "text-[#8c7b70]"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[#8c7b70] transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-[#e07a28]" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#e5ddd0] rounded-xl shadow-xl overflow-hidden animate-fadeIn">
          {/* Search bar inside dropdown */}
          {searchable && normalizedOptions.length > 6 && (
            <div className="p-2 border-b border-[#f2ebdc] bg-[#fffdfa]">
              <div className="relative flex items-center">
                <svg
                  className="w-3.5 h-3.5 text-[#8c7b70] absolute left-2.5 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#e8dfd5] rounded-lg text-[#2e1e12] placeholder-[#a89887] focus:outline-none focus:border-[#e07a28]"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 text-[#8c7b70] hover:text-[#2e1e12] text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <ul
            role="listbox"
            className="max-h-52 overflow-y-auto py-1 overscroll-contain text-xs sm:text-sm font-sans"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#fff8f2] text-[#e07a28] font-semibold"
                        : "text-[#2e1e12] hover:bg-[#faf7f2] hover:text-[#e07a28]"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[#e07a28] shrink-0 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-3 text-center text-xs text-[#8c7b70]">
                No matching options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
