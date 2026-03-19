import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;
