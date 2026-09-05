"use client";

import { TextField } from "@/lib/templates";

interface TextFieldsProps {
  fields: TextField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export default function TextFields({ fields, values, onChange }: TextFieldsProps) {
  return (
    <div className="bg-white border border-[#e5ddd0] rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Section header */}
      <p className="text-[#2e1e12] text-[16px] font-semibold font-sans">
        Personalise
      </p>

      {fields.map((field) => {
        const value = values[field.id] ?? field.defaultValue;
        const remaining = field.maxLength - value.length;

        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label
              htmlFor={`text-field-${field.id}`}
              className="text-[#2e1e12] text-[13px] font-semibold font-sans"
            >
              {field.label}
            </label>

            <div className="relative">
              <input
                id={`text-field-${field.id}`}
                type="text"
                value={value}
                maxLength={field.maxLength}
                onChange={(e) => onChange(field.id, e.target.value)}
                className="w-full bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-3 text-[#2e1e12] text-[14px] font-sans placeholder:text-[#c9b99f] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[rgba(224,122,40,0.15)] transition-all"
                placeholder={field.defaultValue}
              />
            </div>

            {/* Character counter */}
            <div className="flex justify-between items-center">
              <p className="text-[#6e5c50] text-[11px] font-sans">
                Shown on your lithophane
              </p>
              <p
                className={`text-[11px] font-sans ${
                  remaining <= 5 ? "text-[#e07a28]" : "text-[#c9b99f]"
                }`}
              >
                {remaining} left
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
