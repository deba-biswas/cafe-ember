import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Sun, Moon } from "lucide-react";
import CartIcon from "./ui/CartIcon";
import logo from "../assets/logo.png";

// Main navigation bar with theme toggle, cart, and user menu
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);

  // Initialize theme from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Get authentication details from localStorage
  const token = localStorage.getItem("staffToken");
  const role = localStorage.getItem("userRole");

  // Clear auth data and redirect to login
  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  // Apply theme to document root and persist preference
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Handle token expiration (JWT)
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiryTime = payload.exp * 1000;
        const timeRemaining = expiryTime - Date.now();

        if (timeRemaining <= 0) {
          handleLogout();
        } else {
          const timer = setTimeout(() => {
            alert("Session expired. Please login again.");
            handleLogout();
          }, timeRemaining);

          return () => clearTimeout(timer);
        }
      } catch {
        // Invalid token fallback
        handleLogout();
      }
    }
  }, [token, location.pathname]);

  // Close dropdown when route changes
  useEffect(() => {
    setShowDropdown(false);
  }, [location]);

  // Common styles for dropdown items
  const itemClass =
    "px-4 py-3 text-sm cursor-pointer transition hover:bg-white/40 dark:hover:bg-gray-700/40 text-[#3e2723] dark:text-[#fdf6f0]";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-b border-white/20 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand name */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img
              src={logo}
              alt="Cafe Logo"
              className="h-8 w-auto object-contain scale-120 group-hover:scale-130 transition-transform"
            />
            <span className="text-xl font-playfair font-bold text-[#3e2723] dark:text-[#fdf6f0]">
              Café Ember
            </span>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-3 relative">
            {/* Cart button */}
            <button
              onClick={() => navigate("/cart")}
              className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur hover:scale-105 active:scale-95 transition text-gray-700 dark:text-gray-200"
              title="View Cart"
            >
              <CartIcon />
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur hover:scale-105 active:scale-95 transition text-gray-700 dark:text-gray-200"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Profile menu toggle */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur hover:scale-105 active:scale-95 transition text-gray-700 dark:text-gray-200"
              title="Profile Menu"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 top-14 w-52 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 shadow-xl overflow-hidden">
                {/* Guest options */}
                {!token ? (
                  <>
                    <div
                      onClick={() => navigate("/login")}
                      className={itemClass}
                    >
                      Login
                    </div>
                    <div
                      onClick={() => navigate("/signup")}
                      className={itemClass}
                    >
                      Signup
                    </div>
                  </>
                ) : role === "customer" ? (
                  /* Customer options */
                  <>
                    <div
                      onClick={() => navigate("/history")}
                      className={itemClass}
                    >
                      My Orders
                    </div>
                    <div className="border-t border-white/20 dark:border-gray-700"></div>
                    <div
                      onClick={handleLogout}
                      className={`${itemClass} text-red-500`}
                    >
                      Logout
                    </div>
                  </>
                ) : (
                  /* Admin / Staff options */
                  <>
                    <div
                      onClick={() =>
                        navigate(role === "admin" ? "/admin" : "/staff/queue")
                      }
                      className={itemClass}
                    >
                      {role === "admin" ? "Dashboard" : "Kitchen Queue"}
                    </div>
                    <div className="border-t border-white/20 dark:border-gray-700"></div>
                    <div
                      onClick={handleLogout}
                      className={`${itemClass} text-red-500`}
                    >
                      Logout
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
