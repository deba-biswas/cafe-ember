import React from "react";
import { Plus } from "lucide-react";

// Displays a single menu item with image, details, and add-to-cart action
const MenuItemCard = ({ item, addToCart }) => {
  return (
    <article className="relative flex flex-col rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/5 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group aspect-3/4">
      {/* Background image (or fallback icon) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-gray-800">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-20">☕</span>
          </div>
        )}
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-linear-to-t from-white via-white/80 dark:from-gray-900 dark:via-gray-900/80 to-transparent from-10% via-50%"></div>

      {/* Category badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="bg-black/40 backdrop-blur-md text-white border border-white/10 text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full shadow-sm">
          {item.category}
        </span>
      </div>

      {/* Content section (bottom aligned) */}
      <div className="relative z-10 flex flex-col p-4 mt-auto h-full justify-end">
        {/* Item name */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1 drop-shadow-md">
          {item.name}
        </h3>

        {/* Item description */}
        <p className="text-xs text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 font-medium drop-shadow-md">
          {item.description || "Rich and freshly prepared"}
        </p>

        {/* Price and action button */}
        <div className="flex justify-between items-center">
          {/* Item price */}
          <span className="font-extrabold text-gray-900 dark:text-white text-lg drop-shadow-md">
            ₹{item.price.toFixed(2)}
          </span>

          {/* Add to cart button */}
          <button
            onClick={() => addToCart(item)}
            className="w-8 h-8 rounded-full bg-coffee-accent hover:bg-[#9c5a30] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shrink-0 group-hover:shadow-coffee-accent/30"
            title="Add to Order"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default MenuItemCard;
