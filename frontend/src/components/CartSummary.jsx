import React from "react";
import { Link } from "react-router-dom";

// Displays current cart items along with total price and checkout option
export const CartSummary = ({ cart, totalPrice }) => {
  return (
    <aside className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl h-fit sticky top-24">
      {/* Header */}
      <h2 className="text-xl font-semibold text-[#3e2723] dark:text-[#fdf6f0] mb-4 pb-4 border-b border-white/20">
        🧾 Current Order
      </h2>

      {/* Show message if cart is empty */}
      {cart.length === 0 ? (
        <p className="text-gray-500 text-center py-10">Your order is empty</p>
      ) : (
        <div className="flex flex-col h-full">
          {/* Cart items list */}
          <ul className="grow overflow-y-auto mb-6 space-y-3 pr-1">
            {cart.map((cartItem) => (
              <li
                key={cartItem._id || cartItem.id} // Supports both DB and local IDs
                className="flex justify-between items-center bg-white/70 dark:bg-gray-700/50 px-3 py-2 rounded-lg"
              >
                <div>
                  {/* Item name */}
                  <p className="text-sm font-medium text-[#3e2723] dark:text-[#fdf6f0]">
                    {cartItem.name}
                  </p>

                  {/* Quantity */}
                  <p className="text-xs text-gray-500">
                    Qty: {cartItem.quantity}
                  </p>
                </div>

                {/* Item total price */}
                <span className="text-sm font-semibold text-[#3e2723] dark:text-[#fdf6f0]">
                  ₹{(cartItem.price * cartItem.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          {/* Total and checkout section */}
          <div className="pt-4 border-t border-white/20">
            <div className="flex justify-between items-center mb-5">
              <span className="text-gray-600">Total</span>

              {/* Total cart price */}
              <span className="text-2xl font-bold text-gray-900 dark:text-[#fdf6f0]">
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Navigate to checkout page */}
            <Link to="/checkout" className="block w-full">
              <button className="w-full py-3 rounded-xl bg-linear-to-r from-[#c08457] to-[#8b5e3c] text-white font-semibold hover:scale-105 active:scale-95 transition">
                Checkout
              </button>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
};
