import React from "react";

// Displays a styled badge based on order status
const StatusBadge = ({ status }) => {
  // Mapping of status values to corresponding styles
  const styles = {
    pending:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    preparing:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    ready:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  };

  // Fallback style if status is unknown
  const currentStyle =
    styles[status] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border ${currentStyle}`}
    >
      {/* Display current status */}
      {status}
    </span>
  );
};

export default StatusBadge;
