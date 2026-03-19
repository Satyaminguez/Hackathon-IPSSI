import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle2, 
  Zap, 
  ShieldCheck,
  ChevronRight,
  Workflow,
  Activity,
  Layers,
  Users,
  Search,
  Filter
} from "lucide-react";
import { useSelector } from "react-redux";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import UserServices from "../../services/UserServices";
import Loader from "../Loader";

// Données fictives pour le graphique (à dynamiser plus tard)
const chartData = [
  { name: 'Lun', docs: 45 },
  { name: 'Mar', docs: 52 },
  { name: 'Mer', docs: 38 },
  { name: 'Jeu', docs: 65 },
  { name: 'Ven', docs: 48 },
  { name: 'Sam', docs: 24 },
  { name: 'Dim', docs: 18 },
];

const statusConfig = {
  "VERIFIE": { label: "Validé", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  "EN_ATTENTE": { label: "En attente", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  "REFUSE": { label: "Refusé", style: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
};

const DocStatusRow = ({ doc }) => {
  const status = doc.curated_zone?.status_final || "EN_ATTENTE";
  const { label, style } = statusConfig[status] || statusConfig["EN_ATTENTE"];

  return (
    <tr className="border-b border-white/5 group hover:bg-white/5 transition-colors">
      <td className="py-5 pl-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#0B1120] border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-teal-400 transition-all shadow-inner">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-tight group-hover:translate-x-1 transition-transform">{doc.filename}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{doc.uploaded_by}</p>
          </div>
        </div>
      </td>
      <td className="py-5 text-center">
         <div className="flex flex-col items-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Statut Actuel</p>
            <span className={`text-[9px] font-black px-4 py-1 rounded-full border uppercase tracking-widest shadow-sm ${style}`}>
              {label}
            </span>
         </div>
      </td>
      <td className="py-5">
         <div className="text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Ingéré le</p>
            <p className="text-xs font-black text-white">{new Date(doc.upload_date).toLocaleDateString()}</p>
         </div>
      </td>
      <td className="py-5 text-right pr-8">
        <button className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-slate-600 hover:text-teal-400 hover:border-teal-500/50 transition-all bg-white/5">
          <ChevronRight size={20} />
        </button>
      </td>
    </tr>
  );
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const services = new UserServices();
      try {
        const [statsData, docsData] = await Promise.all([
          services.adminGetStats(),
          services.adminGetDocuments()
        ]);
        setStats(statsData);
        setRecentDocs(docsData);
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Loader />;

  const displayStats = [
    { label: "Clients Actifs", value: stats?.utilisateurs?.total || 0, icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/5" },
    { label: "Volume Global", value: stats?.documents?.total || 0, icon: Layers, color: "text-teal-400", bg: "bg-teal-500/5" },
    { label: "Documents Validés", value: stats?.documents?.verifies || 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/5" },
    { label: "En Attente OCR", value: stats?.documents?.en_attente || 0, icon: Activity, color: "text-amber-400", bg: "bg-amber-500/5" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 space-y-12 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-[#0D1425]/40 p-8 rounded-lg border border-white/5 backdrop-blur-md">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_15px_#14b8a6] animate-pulse" />
             <h1 className="text-4xl font-black text-white tracking-tighter">Console Analytics</h1>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-2">
             Cluster ID: <span className="text-white">SYS-FILEMINA-2026</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3 hover:bg-white/10 transition-all">
              <Search size={18} className="text-slate-400" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Recherche Flash</span>
           </button>
           <button className="px-6 py-3 bg-teal-500 text-black font-black rounded-lg flex items-center gap-3 hover:bg-teal-400 transition-all shadow-[0_10px_30px_rgba(20,184,166,0.3)]">
              <Filter size={18} />
              <span className="text-xs uppercase tracking-widest">Filtres Système</span>
           </button>
        </div>
      </div>

      {/* Analytics Graph & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 p-10 bg-[#0D1425]/60 border border-white/10 rounded-lg shadow-2xl backdrop-blur-2xl">
            <h3 className="text-white font-black mb-10 tracking-tight flex items-center gap-3">
               Activité des Flux (7j)
               <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase ml-4">+24% ce mois</span>
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={11} 
                    fontWeight="bold" 
                    axisLine={false} 
                    tickLine={false} 
                    dy={15}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D1425', border: '1px solid #ffffff10', borderRadius: '15px' }}
                    itemStyle={{ color: '#14b8a6', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="docs" 
                    stroke="#14b8a6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorDocs)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            {displayStats.map((stat, i) => (
              <div key={i} className={`p-8 rounded-lg ${stat.bg} border border-white/5 hover:border-white/10 transition-all group flex items-center justify-between`}>
                 <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                 </div>
                 <div className={`w-14 h-14 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon size={26} />
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Full Width Activity Feed */}
      <div className="w-full">
        <div className="bg-[#0D1425]/60 rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-3xl">
          <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Workflow size={24} />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Flux Documents Entrants</h2>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-1">Surveillance globale de l'extraction OCR</p>
               </div>
            </div>
            <button className="px-6 py-2.5 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-white/10 transition-all active:scale-95">
               Exporter Logs
            </button>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left">
              <thead>
                 <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5">
                    <th className="py-6 pl-10">Document Identité</th>
                    <th className="py-6 text-center">Statut Pipeline</th>
                    <th className="py-6 text-center">Horodatage</th>
                    <th className="py-6 text-right pr-10">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {recentDocs.length > 0 ? (
                  recentDocs.map((doc) => <DocStatusRow key={doc._id} doc={doc} />)
                ) : (
                  <tr>
                    <td colSpan="4" className="py-32 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <Activity size={40} className="text-slate-700 animate-pulse" />
                          <p className="text-slate-500 font-extrabold uppercase tracking-[0.3em] text-xs">Auncun document détecté</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
