import React from "react";

// Reusable glassmorphism-style card container
const GlassCard = ({ children, className = "" }) => {
  return (
    <div
      // Applies glass effect with blur, transparency, and border
      className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl ${className}`}
    >
      {/* Render child components inside the card */}
      {children}
    </div>
  );
};

export default GlassCard;
