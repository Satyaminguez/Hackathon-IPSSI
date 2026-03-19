import React from "react";
import { Bell, User } from "lucide-react";
import { useSelector } from "react-redux";

export default function Header() {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-16 border-b border-white/5 bg-[#0B1120]/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <h2 className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
          Centre de Supervision Sécurisé
        </h2>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
           <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">Live System</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full border-2 border-[#0B1120]" />
          </button>
          
          <div className="flex items-center gap-3 pl-2 group cursor-pointer border-l border-white/5">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-extrabold text-white leading-tight uppercase tracking-tight">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Accès Administrateur
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-teal-400 group-hover:border-teal-500/50 transition-all shadow-lg">
              <User size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
