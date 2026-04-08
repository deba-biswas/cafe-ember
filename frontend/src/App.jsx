import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Page imports
import Home from "./pages/Customer/Home";
import Cart from "./pages/Customer/Cart";
import Checkout from "./pages/Customer/Checkout";
import OrderQueue from "./pages/Staff/OrderQueue";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ResetPassword from "./pages/Auth/ResetPassword";
import History from "./pages/Customer/History";
import AdminDashboard from "./pages/Admin/Dashboard";
import OrderSuccess from "./pages/Customer/OrderSuccess";

// Component imports
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Main application entry point with routing configuration
const App = () => {
  // Global cart state (used in some routes)
  const [cart, setCart] = useState([]);

  // Add item to cart or increment quantity
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Calculate total cart value
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <BrowserRouter>
      {/* Global navigation bar */}
      <Navbar />

      <Routes>
        {/* Public customer routes */}
        <Route
          path="/"
          element={
            <Home
              cart={cart}
              addToCart={addToCart}
              calculateTotal={calculateTotal}
            />
          }
        />

        <Route path="/cart" element={<Cart />} />

        <Route
          path="/checkout"
          element={<Checkout cart={cart} totalPrice={calculateTotal()} />}
        />

        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/staff/reset-password" element={<ResetPassword />} />

        {/* Protected staff route */}
        <Route
          path="/staff/queue"
          element={
            <ProtectedRoute>
              <OrderQueue />
            </ProtectedRoute>
          }
        />

        {/* Protected admin route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Customer order history */}
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
