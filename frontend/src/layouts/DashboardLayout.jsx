// DashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans selection:bg-teal-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="fixed top-0 left-64 right-0 h-96 bg-gradient-to-b from-teal-600/5 to-transparent pointer-events-none" />
      
      <Sidebar />

      <div className="flex-1 p-8 ml-64 relative z-10">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
