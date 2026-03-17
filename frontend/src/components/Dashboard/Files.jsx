import React, { useState } from "react";
import { FileText, Search, Filter, MoreVertical, Download, Trash2, Eye, Upload, X, ChevronRight } from "lucide-react";

const Drawer = ({ isOpen, onClose, children }) => (
  <>
    <div 
      className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div className={`fixed top-0 right-0 h-full w-[450px] bg-slate-900 border-l border-slate-800 z-50 transform transition-transform duration-500 ease-out p-8 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-xl font-bold text-white">Uploader un fichier</h2>
          <p className="text-sm text-slate-500 mt-1">Envoyez vos documents administratifs</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </>
);

const FileItem = ({ name, type, size, date }) => (
  <div className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800 rounded-2xl hover:bg-slate-900/50 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
        <FileText size={24} />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{name}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{type} • {size}</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <span className="text-xs text-slate-500 font-medium">{date}</span>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-slate-400 hover:text-teal-400 transition-colors">
          <Eye size={16} />
        </button>
        <button className="p-2 text-slate-400 hover:text-teal-400 transition-colors">
          <Download size={16} />
        </button>
        <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

export default function Files() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const categories = ["Contrats", "Factures", "Identités", "Rapports", "Autres"];
  
  const files = [
    { name: "Contract_Q1_2024.pdf", type: "Contrat Client", size: "1.2 MB", date: "Il y a 2m" },
    { name: "Invoice_IPSSI_78.jpg", type: "Facture", size: "450 KB", date: "Il y a 1h" },
    { name: "ID_Card_Kazad.png", type: "Identité", size: "890 KB", date: "Hier" },
    { name: "Report_March.pdf", type: "Rapport", size: "4.5 MB", date: "15 Mars" },
    { name: "Tax_Document_2023.pdf", type: "Administratif", size: "2.1 MB", date: "12 Mars" },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Espace Documentaire Client</h1>
          <p className="text-slate-500 text-sm">Gérez et archivez vos documents administratifs sécurisés.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
        >
          <Upload size={18} />
          Uploader un document
        </button>
      </div>

      <div className="space-y-3">
        {files.map((file, i) => (
          <FileItem key={i} {...file} />
        ))}
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <form className="space-y-8">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Catégorie du document</label>
            <select className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all">
              <option value="">-- Choisir une catégorie --</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Fichiers à uploader</label>
            <div className="border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center hover:border-teal-500 hover:bg-teal-500/5 transition-all group cursor-pointer">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 group-hover:border-teal-500/30 transition-all">
                <Upload className="text-slate-500 group-hover:text-teal-400 transition-colors" size={32} />
              </div>
              <p className="text-sm font-bold text-white mb-1">Cliquez pour télécharger</p>
              <p className="text-xs text-slate-500">ou glissez un fichier ici</p>
            </div>
          </div>

          <button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] mt-10">
            Envoyer le document
          </button>
        </form>
      </Drawer>
    </div>
  );
}
