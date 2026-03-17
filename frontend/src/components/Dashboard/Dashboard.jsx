import React, { useState, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ShieldCheck,
  Search,
  ChevronRight,
  TrendingUp,
  Workflow
} from "lucide-react";

const DocStatusRow = ({ name, type, status, time }) => {
  const getStatusStyle = (s) => {
    switch(s) {
      case 'Terminé': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Traitement': return 'bg-teal-500/10 text-teal-400 border-teal-500/20 animate-pulse';
      case 'Attente': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <tr className="border-b border-slate-800/50 group hover:bg-slate-800/20 transition-colors">
      <td className="py-4 pl-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-700 transition-colors">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{name}</p>
            <p className="text-xs text-slate-500 uppercase">{type}</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-xs text-slate-500 font-medium">{time}</td>
      <td className="py-4 text-right pr-4">
        <button className="p-2 text-slate-500 hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
      </td>
    </tr>
  );
};

function Dashboard() {
  const [dragActive, setDragActive] = useState(false);

  const stats = [
    { label: "Documents Traités", value: "2,458", change: "+12%", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "OCR En attente", value: "43", change: "En cours", icon: Workflow, color: "text-teal-400" },
    { label: "Classification Auto", value: "98.2%", change: "+0.4%", icon: Zap, color: "text-amber-400" },
    { label: "Niveau de Sécurité", value: "SSL v3", change: "Maximum", icon: ShieldCheck, color: "text-indigo-400" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Centre de Commande</h1>
          <p className="text-slate-400 text-sm">Surveillance du pipeline OCR et orchestration en temps réel.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un document..." 
              className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-64"
            />
          </div>
          <button className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20 active:scale-95">
            <Upload size={18} />
            Nouvel Upload
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-900 transition-all group">
            <div className="flex justify-between items-center mb-4">
              <stat.icon className={`${stat.color} filter drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]`} size={20} />
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8 mb-10">
        {/* Main Content Area: Upload & Tracking */}
        <div className="col-span-8 space-y-8">
          {/* Upload Dropzone */}
          <div 
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
              dragActive ? "border-teal-500 bg-teal-500/5" : "border-slate-800 bg-slate-900/30 hover:border-slate-700"
            }`}
          >
            <div className="w-16 h-16 bg-teal-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-500/20">
              <Upload className="text-teal-400" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Glissez vos documents administratifs</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Soutient PDF, PNG, JPG. Classification automatique par IA et extraction OCR robuste activées.
            </p>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all">
              Parcourir les fichiers
            </button>
          </div>

          {/* Recent Processing */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Pipeline de Traitement</h2>
              <button className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors">Voir tout</button>
            </div>
            <table className="w-full">
              <tbody>
                <DocStatusRow name="Contract_Q1_2024.pdf" type="Contrat Client" status="Terminé" time="Il y a 2m" />
                <DocStatusRow name="Invoice_IPSSI_78.jpg" type="Facture" status="Traitement" time="En cours..." />
                <DocStatusRow name="ID_Card_Kazad.png" type="Identité" status="Attente" time="Dans la file" />
                <DocStatusRow name="Report_March.pdf" type="Rapport" status="Terminé" time="Il y a 14m" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Area: Data Lake & Airflow */}
        <div className="col-span-4 space-y-6">
          <div className="p-6 bg-gradient-to-br from-teal-600/20 to-emerald-600/20 rounded-3xl border border-teal-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-teal-500/10 group-hover:scale-110 transition-transform">
              <Workflow size={80} />
            </div>
            <h3 className="text-white font-bold mb-2">Statut Airflow</h3>
            <div className="flex items-center gap-2 text-emerald-400 mb-4">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest">Pipeline Opérationnel</span>
            </div>
            <p className="text-sm text-slate-400 mb-4 relative z-10">
              Le pipeline d'orchestration traite actuellement 12 documents par minute.
            </p>
            <button className="text-xs font-bold text-white flex items-center gap-1 hover:gap-2 transition-all">
              Configuration du Workflow <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
