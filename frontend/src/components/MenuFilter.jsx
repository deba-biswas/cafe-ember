import React from "react";
import { Search } from "lucide-react";

// Handles menu filtering via search input and category selection
const MenuFilter = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search input field */}
      <div className="relative w-full md:max-w-md shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          // Update search query state on input change
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-full bg-white/50 dark:bg-gray-800 border border-gray-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-coffee-accent text-gray-900 dark:text-[#d1cbc7] transition-all placeholder-gray-500 shadow-sm"
        />
      </div>

      {/* Category filter buttons */}
      <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden w-full md:w-auto py-2 px-1 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            // Set selected category on click
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-all shadow-sm ${
              // Highlight active category
              selectedCategory === category
                ? "bg-coffee-accent text-white shadow-md shadow-coffee-accent/20"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-[#d1cbc7] border border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2a231f]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuFilter;
