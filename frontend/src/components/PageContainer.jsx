import React from "react";

// Layout wrapper to provide consistent page spacing and background
const PageContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#faf7f5] dark:bg-gray-900">
      {/* Main content container with responsive padding and max width */}
      <div className="max-w-400 w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
