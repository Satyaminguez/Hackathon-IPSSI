import React from "react";
import { Bell, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setRole } from "../../store/authSlice";

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || "client";

  const toggleRole = () => {
    const newRole = userRole === "admin" ? "client" : "admin";
    dispatch(setRole(newRole));
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <h2 className="text-sm font-bold text-slate-400 tracking-wider">
          {userRole === "admin" ? "CENTRE DE SUPERVISION" : "ESPACE CLIENT SÉCURISÉ"}
        </h2>
        
        {/* Toggle Mode Démo */}
        <button 
          onClick={toggleRole}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition-all group"
        >
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-teal-400 uppercase tracking-widest whitespace-nowrap">
            Mode : {userRole === "admin" ? "Admin" : "Client"}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full border-2 border-slate-950" />
          </button>
          
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold text-white leading-tight">
                {user?.firstname || "Demo"} {user?.lastname || (userRole === "admin" ? "Admin" : "Client")}
              </p>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                Accès {userRole === "admin" ? "Système" : "Premium"}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 group-hover:border-teal-500/50 transition-all">
              <User size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
