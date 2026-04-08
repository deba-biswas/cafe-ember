import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import GlassCard from "../../components/ui/GlassCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PageContainer from "../../components/PageContainer";

// Login page for customers, staff, and admin users
const Login = () => {
  const navigate = useNavigate();

  // Toggle between customer and staff/admin login
  const [isCustomer, setIsCustomer] = useState(true);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle login request
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem("staffToken", data.token);
        localStorage.setItem("userRole", data.role);

        // Redirect based on role and login state
        if (data.isFirstLogin) navigate("/staff/reset-password");
        else if (data.role === "admin") navigate("/admin");
        else if (data.role === "staff") navigate("/staff/queue");
        else navigate("/");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      {/* Centered container */}
      <div className="flex items-center justify-center min-h-[75vh]">
        <GlassCard className="w-full max-w-md p-8 animate-fade-in border border-gray-100 dark:border-white/5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">☕</div>
            <h2 className="text-3xl font-playfair font-extrabold">
              Welcome Back
            </h2>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          {/* Role switch (Customer / Staff) */}
          <div className="flex mb-8 rounded-xl bg-gray-100 dark:bg-gray-900 p-1 border shadow-inner">
            <button
              onClick={() => {
                setIsCustomer(true);
                setIdentifier("");
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                isCustomer
                  ? "bg-white dark:bg-gray-800 text-coffee-accent shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Customer
            </button>

            <button
              onClick={() => {
                setIsCustomer(false);
                setIdentifier("");
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                !isCustomer
                  ? "bg-white dark:bg-gray-800 text-coffee-accent shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Staff / Admin
            </button>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label={isCustomer ? "Phone Number" : "Username"}
              type={isCustomer ? "tel" : "text"}
              placeholder={isCustomer ? "e.g. 9876543210" : "Enter username"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Error message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-100/80 border px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button type="submit" isLoading={loading}>
              Sign In
            </Button>
          </form>

          {/* Footer links */}
          <div className="text-center mt-8 text-sm">
            {isCustomer ? (
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-coffee-accent font-bold">
                  Sign Up
                </Link>
              </p>
            ) : (
              <p className="text-gray-500 italic">Staff access only.</p>
            )}

            <button
              onClick={() => navigate("/")}
              className="mt-4 text-gray-500 hover:text-coffee-accent transition-colors"
            >
              ← Back to Menu
            </button>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
};

export default Login;
