import React from "react";
import { User } from "lucide-react";
import { useSelector } from "react-redux";

export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || "user";

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <h2 className="text-sm font-bold text-slate-400 tracking-wider">
          {userRole === "admin" ? "CENTRE DE SUPERVISION" : "ESPACE CLIENT SÉCURISÉ"}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">

          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold text-white leading-tight">
                {user?.prenom || "Demo"} {user?.nom || (userRole === "admin" ? "Admin" : "Client")}
              </p>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                Accès {userRole === "admin" ? "admin" : "client"}
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
