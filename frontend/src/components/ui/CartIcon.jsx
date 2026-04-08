import React, { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";

// Cart icon component that displays total number of items in cart
const CartIcon = () => {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Fetch cart data from localStorage and calculate total quantity
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("cafeCart");

      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          const total = cart.reduce((sum, item) => sum + item.quantity, 0);
          setItemCount(total);
        } catch (e) {
          // Reset count if parsing fails (corrupted data)
          setItemCount(0);
        }
      } else {
        setItemCount(0);
      }
    };

    // Initial load
    updateCartCount();

    // Poll localStorage every 500ms to keep count updated
    const intervalId = setInterval(updateCartCount, 500);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <ShoppingBag className="h-5 w-5" />

      {/* Show badge only if there are items in cart */}
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-fade-in">
          {/* Limit display to "9+" for large counts */}
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </div>
  );
};

export default CartIcon;
