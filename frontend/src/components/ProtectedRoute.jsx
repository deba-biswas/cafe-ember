import React from "react";
import { Navigate } from "react-router-dom";

// Protects routes that require user authentication
const ProtectedRoute = ({ children }) => {
  // Retrieve authentication token from localStorage
  const token = localStorage.getItem("staffToken");

  // Redirect to login page if user is not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;
