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
import Files from "./components/Dashboard/Files";
import OCRValidation from "./components/Dashboard/OCRValidation";
import DataLake from "./components/Dashboard/DataLake";
import Clients from "./components/Dashboard/Clients";
import NotFound from "./components/NotFound";
import Pricing from "./components/payments/Pricing";
import Payment from "./components/payments/Payment";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" />}
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
            
            {/* Espace Client */}
            <Route path="files" element={<Files />} />
            
            {/* Espace Admin (Supervision OCR & Data Lake) */}
            <Route path="admin/ocr" element={<OCRValidation />} />
            <Route path="admin/data-lake" element={<DataLake />} />
            <Route path="admin/clients" element={<Clients />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
