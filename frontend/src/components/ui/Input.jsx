import React from "react";

// Reusable Input component with label and configurable attributes
const Input = ({
  label,
  type = "text", // Default input type
  value,
  onChange,
  placeholder,
  required = false,
  readOnly = false,
  min,
  step,
}) => {
  return (
    <div className="w-full">
      {/* Render label if provided */}
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        min={min}
        step={step}
        // Input styling with glass effect and focus states
        className={`w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-gray-700/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]/30 text-[#3e2723] dark:text-[#fdf6f0] transition-all ${
          // Apply visual feedback when input is read-only
          readOnly ? "opacity-70 cursor-not-allowed border-dashed" : ""
        }`}
      />
    </div>
  );
};

export default Input;
