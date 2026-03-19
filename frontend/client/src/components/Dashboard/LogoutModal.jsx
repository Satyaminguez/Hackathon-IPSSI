import React from "react";
import { LogOut, X } from "lucide-react";

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-lg p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
            <LogOut size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Déconnexion</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à vos documents sécurisés.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onConfirm}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] cursor-pointer"
            >
              Oui, déconnexion
            </button>
            <button
              onClick={onClose}
              className="w-full bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-lg transition-all cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
