import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle2, 
  Zap, 
  ShieldCheck,
  ChevronRight,
  Workflow,
  TrendingUp,
  Activity,
  Layers,
  Clock,
  Loader2
} from "lucide-react";
import { useSelector } from "react-redux";
import UserServices from "../../services/UserServices";
import { Link } from "react-router-dom";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#14b8a6', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

const DocStatusRow = ({ name, type, status, time }) => {
  const getStatusStyle = (s) => {
    switch(s) {
      case 'VERIFIE': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'EN_ATTENTE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <tr className="border-b border-slate-800/40 group hover:bg-slate-800/10 transition-colors">
      <td className="py-4 pl-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-teal-400 transition-colors">
            <FileText size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{name}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{type}</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(status)}`}>
          {status === 'VERIFIE' ? 'Vérifié' : 'En attente'}
        </span>
      </td>
      <td className="py-4 text-[11px] text-slate-500 font-medium">
        {time ? new Date(time).toLocaleDateString() : "---"}
      </td>
      <td className="py-4 text-right pr-6">
        <button className="p-2 text-slate-500 hover:text-white transition-colors">
          <ChevronRight size={14} />
        </button>
      </td>
    </tr>
  );
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || "user";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userServices = new UserServices();
        const res = await userServices.getDashboardData();
        setData(res);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm">Initialisation de votre centre de commande...</p>
      </div>
    );
  }

  const kpis = [
    { label: "Total Documents", value: data?.statistiques?.total_envoyes || 0, icon: Layers, color: "text-indigo-400", bg: "bg-indigo-500/5" },
    { label: "Validés par IA", value: data?.statistiques?.verifies || 0, icon: CheckCircle2, color: "text-teal-400", bg: "bg-teal-500/5" },
    { label: "En attente", value: data?.statistiques?.en_attente || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/5" },
    { label: "Taux de précision", value: data?.statistiques?.taux_precision || "99.8%", icon: Zap, color: "text-rose-400", bg: "bg-rose-500/5" },
  ];

  return (
    <div className="mx-auto animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Bonjour, {user?.prenom || "Cher Client"}
          </h1>
          <p className="text-slate-500 text-sm">
            Voici l'aperçu global de votre activité documentaire aujourd'hui.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className={`p-6 rounded-lg ${kpi.bg} border border-white/5 hover:border-white/10 transition-all group`}>
            <div className={`w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center ${kpi.color} mb-4`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Activity Curve */}
        <div className="lg:col-span-8 bg-slate-900/30 border border-white/5 rounded-lg p-6 backdrop-blur">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-400" />
              Volume d'activité (7 jours)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.graphiques?.evolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#14b8a6', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="docs" 
                  stroke="#14b8a6" 
                  strokeWidth={3} 
                  dot={{ fill: '#14b8a6', r: 4 }}
                  activeDot={{ r: 6, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repartition Pie */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-white/5 rounded-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-white mb-6 w-full text-left">Répartition par type</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.graphiques?.repartition}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.graphiques?.repartition?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-12 bg-slate-900/40 border border-white/5 rounded-lg overflow-hidden mt-4">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">Activité récente</h2>
            <Link to="/dashboard/files" className="text-[10px] font-bold text-teal-400 hover:text-teal-300 transition-colors uppercase tracking-widest px-3 py-1 bg-teal-400/5 rounded-full border border-teal-400/10">Voir tout</Link>
          </div>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left">
              <tbody>
                {data?.derniers_documents?.length > 0 ? (
                  data.derniers_documents.map((doc) => (
                    <DocStatusRow 
                      key={doc.id} 
                      name={doc.nom_fichier} 
                      type={doc.type} 
                      status={doc.statut} 
                      time={doc.date}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-slate-500 text-sm">
                      Aucune activité enregistrée
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
