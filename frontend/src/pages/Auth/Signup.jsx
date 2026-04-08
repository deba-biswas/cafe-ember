import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import GlassCard from "../../components/ui/GlassCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PageContainer from "../../components/PageContainer";

// Signup page for new customers
const Signup = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    password: "",
  });

  // UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle user registration
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/customer/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // MAP THE DATA TO MATCH FLASK
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone_number, // Backend wants 'phone'
            password: formData.password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      {/* Centered layout */}
      <div className="flex items-center justify-center min-h-[75vh]">
        <GlassCard className="w-full max-w-md p-8 animate-fade-in border border-gray-100 dark:border-white/5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">✨</div>
            <h2 className="text-3xl font-playfair font-extrabold">
              Create Account
            </h2>
            <p className="text-gray-500 mt-2">
              Join us for fresh coffee and bites!
            </p>
          </div>

          {/* Signup form */}
          <form onSubmit={handleSignup} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="10-digit number"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone_number: e.target.value,
                })
              }
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
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
              Sign Up
            </Button>
          </form>

          {/* Footer links */}
          <div className="text-center mt-8 text-sm">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-coffee-accent font-bold">
                Log in
              </Link>
            </p>

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

export default Signup;
