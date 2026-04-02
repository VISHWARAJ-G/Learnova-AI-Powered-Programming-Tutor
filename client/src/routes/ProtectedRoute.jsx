import React from "react";
import { useAuth } from "../context/AuthContext";
import { RotatingLines } from "react-loader-spinner";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <RotatingLines strokeColor="#0284C7" width="40" height="40" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to={"/"} replace />;
  }
  return children;
}

export default ProtectedRoute;
