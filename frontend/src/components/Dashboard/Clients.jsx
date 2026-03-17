import React from "react";
import { Users, MoreVertical, Shield, Mail, Calendar, Activity } from "lucide-react";

const ClientsList = () => {
  const clients = [
    { id: 1, name: "ACME Corp", email: "contact@acme.com", joined: "Jan 2024", docs: 1245, status: "Actif" },
    { id: 2, name: "Global Tech", email: "finance@globaltech.fr", joined: "Fév 2024", docs: 890, status: "Actif" },
    { id: 3, name: "Startup SARL", email: "admin@startup.io", joined: "Mars 2024", docs: 320, status: "En attente" },
    { id: 4, name: "Documind SA", email: "info@documind.com", joined: "Mars 2024", docs: 12, status: "Actif" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Gestion des Clients</h1>
          <p className="text-slate-500 text-sm">Contrôlez les accès à la plateforme et surveillez la consommation OCR par client.</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-md text-sm font-bold transition-all active:scale-95">
          Ajouter un Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Clients Totaux", value: "48", icon: Users },
          { label: "Utilisateurs Actifs", value: "156", icon: Activity },
          { label: "Appels API / jour", value: "12,450", icon: Shield },
          { label: "Moyenne Docs/Mois", value: "850", icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-800 rounded-2xl text-teal-400">
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900/20 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
            <tr>
              <th className="px-8 py-5">Nom de l'entreprise</th>
              <th className="px-8 py-5">Contact</th>
              <th className="px-8 py-5">Documents Traités</th>
              <th className="px-8 py-5">Statut</th>
              <th className="px-8 py-5 text-right flex-1">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 font-bold border border-slate-700">
                      {client.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{client.name}</p>
                      <p className="text-[10px] text-slate-500">Inscrit en {client.joined}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    <Mail size={14} className="text-slate-600" />
                    {client.email}
                  </div>
                </td>
                <td className="px-8 py-5 font-mono text-sm text-slate-300">
                  {client.docs.toLocaleString()} pieces
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${client.status === 'Actif' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsList;
