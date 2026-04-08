import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../components/ui/GlassCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PageContainer from "../../components/PageContainer";

// Password reset page for first-time login users
const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Handle password reset request
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("staffToken");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        // Clear session and redirect to login after successful update
        localStorage.clear();
        navigate("/login");
      } else {
        alert("Failed to update password");
      }
    } catch {
      alert("Network error");
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
            <div className="text-5xl mb-3">🔐</div>
            <h2 className="text-3xl font-extrabold">Reset Password</h2>
            <p className="text-gray-500 mt-2">
              First time login: Set a new secure password
            </p>
          </div>

          {/* Reset form */}
          <form onSubmit={handleReset} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            {/* Submit button */}
            <Button type="submit" isLoading={loading}>
              Save & Login
            </Button>
          </form>
        </GlassCard>
      </div>
    </PageContainer>
  );
};

export default ResetPassword;
