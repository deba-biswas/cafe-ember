import React from "react";
import { Navigate } from "react-router-dom";

// Protects routes that require admin access
const AdminRoute = ({ children }) => {
  // Retrieve authentication token and user role from localStorage
  const token = localStorage.getItem("staffToken");
  const role = localStorage.getItem("userRole");

  // Redirect to login if user is not authenticated or not an admin
  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if user is authorized
  return children;
};

export default AdminRoute;
