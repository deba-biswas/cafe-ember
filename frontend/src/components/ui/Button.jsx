import React from "react";
import { Loader2 } from "lucide-react";

// Reusable Button component with support for variants, loading state, and disabled state
const Button = ({
  children,
  onClick,
  type = "button", // Default button type
  variant = "primary", // Default style variant
  isLoading = false, // Shows loader and disables button when true
  disabled = false,
  className = "",
}) => {
  // Base styling applied to all buttons
  const baseClasses =
    "w-full py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95";

  // Style variants for different button types
  const variants = {
    primary:
      "bg-gradient-to-r from-[#c08457] to-[#8b5e3c] text-white hover:scale-[1.02]",
    secondary:
      "bg-white/50 dark:bg-gray-700/50 text-[#3e2723] dark:text-[#fdf6f0] border border-gray-300 dark:border-gray-600 hover:bg-white/70 dark:hover:bg-gray-600 shadow-sm",
    danger:
      "bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 shadow-sm",
    success:
      "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-[1.02]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      // Disable button when loading or explicitly disabled
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${
        disabled ? "opacity-70 cursor-not-allowed" : ""
      } ${className}`}
    >
      {/* Show spinner when loading */}
      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}

      {/* Replace button text during loading */}
      {isLoading ? "Please wait..." : children}
    </button>
  );
};

export default Button;
