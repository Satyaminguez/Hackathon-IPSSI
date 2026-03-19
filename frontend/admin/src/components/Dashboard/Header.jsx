import React from "react";
import { User } from "lucide-react";
import { useSelector } from "react-redux";

export default function Header() {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-16 border-b border-white/5 bg-[#0B1120]/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <h2 className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
          Centre de Supervision Sécurisé
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-2 group cursor-pointer border-l border-white/5">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-extrabold text-white leading-tight uppercase tracking-tight">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Accès Administrateur
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-orange-400 group-hover:border-orange-500/50 transition-all shadow-lg">
              <User size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
