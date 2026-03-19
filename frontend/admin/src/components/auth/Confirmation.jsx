import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, message, redirectPath } = location.state || {
    title: "Confirmation",
    message: "Action réussie.",
    redirectPath: "/",
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden text-slate-300">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg p-10 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full mb-6 border border-emerald-500/20">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">{message}</p>
          
          <button
            onClick={() => navigate(redirectPath)}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-md transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </button>
        </div>

        <p className="mt-8 text-center text-slate-600 text-xs text-balance">
          &copy; 2026 DocSafe AI. Traitement de données confidentielles géré par pipeline automatisé.
        </p>
      </div>
    </div>
  );
}
