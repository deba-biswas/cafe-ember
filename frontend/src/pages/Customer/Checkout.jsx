import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PageContainer from "../../components/PageContainer";

// Checkout page for placing an order
const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve cart data from navigation state
  const cart = location.state?.cart || [];
  const total = location.state?.total || 0;

  // Form state (only phone number required)
  const [formData, setFormData] = useState({
    phone_number: "",
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // Initialize form and validate cart
  useEffect(() => {
    // Redirect if cart is empty
    if (cart.length === 0) {
      navigate("/");
      return;
    }

    const token = localStorage.getItem("staffToken");
    const role = localStorage.getItem("userRole");

    // Auto-fill phone number for logged-in customers
    if (token && role === "customer") {
      setIsUserLoggedIn(true);

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        setFormData({
          phone_number: payload.user,
        });
      } catch {
        // Ignore invalid token
      }
    }
  }, [cart, navigate]);

  // Handle order placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("http://127.0.0.1:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          items: cart,
          total_price: total,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear cart after successful order
        localStorage.removeItem("cafeCart");

        // Navigate to success page with order details
        navigate("/order-success", {
          state: {
            order_number: data.order_number,
            cart: cart,
            total: total,
            phone_number: formData.phone_number,
            date: new Date().toLocaleString(),
          },
        });
      } else {
        setMessage({
          text: data.error || "Failed to place order",
          type: "error",
        });
        setLoading(false);
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-xl mx-auto animate-fade-in">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Menu
        </button>

        {/* Page title */}
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8" /> Checkout
        </h1>

        <GlassCard>
          {/* Order summary */}
          <div className="p-6 border-b">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>

            <ul className="space-y-3">
              {cart.map((item) => (
                <li
                  key={item._id}
                  className="flex justify-between text-sm px-4 py-3 rounded-xl border"
                >
                  <span>
                    <span className="font-bold mr-2">{item.quantity}x</span>
                    {item.name}
                  </span>

                  <span className="font-bold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Total */}
            <div className="flex justify-between mt-6 pt-4 border-t text-lg font-bold">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout form */}
          <div className="p-6">
            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* Phone input */}
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone_number: e.target.value,
                  })
                }
                required
                readOnly={isUserLoggedIn}
              />

              {/* Submit button */}
              <Button type="submit" isLoading={loading}>
                Place Order
              </Button>
            </form>

            {/* Feedback message */}
            {message.text && (
              <div
                className={`mt-6 p-4 rounded-xl text-center border ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
};

export default Checkout;
