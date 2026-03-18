import React, { useState } from "react";
import { 
  FileText, 
  CheckCircle2, 
  Zap, 
  ShieldCheck,
  ChevronRight,
  Workflow,
  AlertCircle,
  TrendingUp,
  Activity,
  Layers
} from "lucide-react";
import { useSelector } from "react-redux";

const DocStatusRow = ({ name, type, client, status, time, role }) => {
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
      <td className="py-4 pl-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-700 transition-colors">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{name}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{role === "admin" ? client : type}</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-4 text-xs text-slate-500 font-medium">{time}</td>
      <td className="py-4 text-right pr-6">
        <button className="p-2 text-slate-500 hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
      </td>
    </tr>
  );
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || "client";

  const clientStats = [
    { label: "Documents Traités", value: "2,458", change: "+12%", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "OCR En attente", value: "43", change: "En cours", icon: Workflow, color: "text-teal-400" },
    { label: "Classification Auto", value: "98.2%", change: "+0.4%", icon: Zap, color: "text-amber-400" },
    { label: "Niveau de Sécurité", value: "SSL v3", change: "Maximum", icon: ShieldCheck, color: "text-indigo-400" },
  ];

  const adminStats = [
    { label: "Clients Actifs", value: "48", icon: Activity, color: "text-indigo-400" },
    { label: "Volume Global / Jour", value: "12,450", icon: Workflow, color: "text-teal-400" },
    { label: "Précision Extraction", value: "97.8%", icon: Zap, color: "text-amber-400" },
    { label: "Alertes Airflow", value: "0", icon: CheckCircle2, color: "text-emerald-400" },
  ];

  const stats = userRole === "admin" ? adminStats : clientStats;

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {userRole === "admin" ? "Centre de Supervision IA" : "Mon Centre de Commande"}
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {userRole === "admin" 
              ? "Surveillance globale des flux OCR et des instances Airflow clients." 
              : "Suivi en temps réel de l'extraction et classification de vos documents."}
          </p>
        </div>
        
        {userRole === "admin" && (
          <div className="flex gap-4">
             <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-md flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Tous les Clusters Actifs</span>
             </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-teal-500/30 transition-all group">
            <div className="flex justify-between items-center mb-6">
              <div className={`p-2.5 rounded-md bg-slate-800 border border-slate-700 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Activity Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {userRole === "admin" ? "Flux OCR Global - Documents Récent" : "Récemment Traités"}
              </h2>
              <button className="text-[10px] font-bold text-teal-400 hover:text-teal-300 transition-colors uppercase tracking-widest px-3 py-1 bg-teal-400/5 rounded-full border border-teal-400/10">Logs détaillés</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody>
                  <DocStatusRow role={userRole} client="ACME Corp" name="Facture_Q1_signed.pdf" type="Contrat" status="Terminé" time="2m ago" />
                  <DocStatusRow role={userRole} client="Global Tech" name="RIB_Verification.jpg" type="RIB" status="Traitement" time="En cours" />
                  <DocStatusRow role={userRole} client="Startup SARL" name="ID_Card_Kazad.png" type="Identité" status="Attente" time="Dans la file" />
                  <DocStatusRow role={userRole} client="Documind SA" name="KBIS_Extract_2026.pdf" type="KBIS" status="Terminé" time="14m ago" />
                  <DocStatusRow role={userRole} client="Financio" name="Tax_Form_AD_01.pdf" type="Administratif" status="Terminé" time="45m ago" />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pipeline / Orchestration Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg border border-slate-800 relative overflow-hidden group shadow-xl">
             <div className="absolute top-0 right-0 p-8 text-teal-500/5 group-hover:scale-110 transition-transform">
                <Workflow size={90} />
             </div>
             
             <h3 className="text-white font-bold mb-6 tracking-tight flex items-center gap-2">
               Orchestration
               <span className="w-2 h-2 rounded-full bg-emerald-500" />
             </h3>

             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Layers size={18} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white">Data Lake Active</p>
                      <p className="text-[10px] text-slate-500 uppercase">3 Zones Opérationnelles</p>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                      <Workflow size={18} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white">Airflow v2.8</p>
                      <p className="text-[10px] text-slate-500 uppercase">12 DAGs en cours</p>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-800/50">
                   <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-widest text-slate-500">
                      <span>Charge Cluster</span>
                      <span className="text-teal-400">42%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-[42%] rounded-full shadow-[0_0_8px_rgba(20,184,166,0.3)] transition-all duration-1000" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
