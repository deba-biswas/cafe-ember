import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import PageContainer from "../../components/PageContainer";

// Cart page for managing selected items and checkout
const Cart = () => {
  const navigate = useNavigate();

  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cafeCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persist cart changes to localStorage
  useEffect(() => {
    localStorage.setItem("cafeCart", JSON.stringify(cart));
  }, [cart]);

  // Increase quantity of an existing item
  const addToCart = (item) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      ),
    );
  };

  // Decrease quantity (minimum 1)
  const decrementItem = (itemId) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === itemId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }),
    );
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Navigate to checkout with cart data
  const handleCheckout = () => {
    navigate("/checkout", {
      state: { cart, total: calculateTotal() },
    });
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 border p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />

            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>

            <p className="text-gray-500 mb-8">
              Add some delicious items from our menu
            </p>

            <Link
              to="/"
              className="w-full bg-coffee-accent text-white px-6 py-3.5 rounded-xl font-bold transition"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Menu
        </button>

        {/* Page title */}
        <h1 className="text-3xl font-extrabold mb-8">Your Cart</h1>

        {/* Cart items list */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
            >
              {/* Item details */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  ₹{item.price.toFixed(2)} each
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                {/* Quantity controls */}
                <div className="flex items-center gap-2 p-1.5 rounded-xl border">
                  <button onClick={() => decrementItem(item._id)}>
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-8 text-center font-bold">
                    {item.quantity}
                  </span>

                  <button onClick={() => addToCart(item)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Item subtotal */}
                <div className="text-right min-w-20">
                  <p className="font-bold text-lg">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Remove item */}
                <button onClick={() => removeFromCart(item._id)}>
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mt-8 shadow-xl">
          {/* Total */}
          <div className="flex justify-between items-center text-xl font-bold mb-6 pb-4 border-b">
            <span>Total to Pay</span>
            <span className="text-2xl text-coffee-accent">
              ₹{calculateTotal().toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={clearCart}
              className="flex-1 py-3.5 rounded-xl border"
            >
              Clear Cart
            </button>

            <button
              onClick={handleCheckout}
              className="flex-2 py-3.5 rounded-xl bg-coffee-accent text-white font-bold"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Cart;
