import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Confirmation from "./components/auth/Confirmation";
import Forgot from "./components/auth/Forgot";
import Confirm from "./components/auth/confirm";
import Reset from "./components/auth/Reset";
import Profile from "./components/Dashboard/Profile/Profile";
import NavAuth from "./components/auth/NavAuth";
import PrivateRoute from "./components/auth/PrivateRoot";

import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import NotFound from "./components/NotFound";
import Pricing from "./components/payments/Pricing";
import Payment from "./components/payments/Payment";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      {!isAuthenticated && <NavAuth />}

      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/confirm-email" element={<Confirm />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/reset-password" element={<Reset />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="setting" element={<div>Mes paramètres</div>} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
