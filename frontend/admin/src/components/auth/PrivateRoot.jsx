import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0B1120] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Protection : Doit être authentifié ET Admin
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;
