import React, { useState, useEffect } from "react";
import { Users, Mail, X, FileText, CheckCircle, Clock } from "lucide-react";
import UserServices from "../../services/UserServices";

const ClientDrawer = ({ isOpen, onClose, clientData, onUpdateStatus }) => (
  <>
    <div 
      className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div className={`fixed top-0 right-0 h-full w-[550px] bg-[#0B1120] border-l border-white/10 z-50 transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Détails Client</h2>
          <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">{clientData?.profile?.email}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {/* Profile Card */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Informations Entreprise</h3>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Raison Sociale</p>
              <p className="text-white font-bold">{clientData?.profile?.nom_entreprise}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Contact</p>
              <p className="text-white font-bold">{clientData?.profile?.prenom} {clientData?.profile?.nom}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Service</p>
              <p className="text-white font-bold">{clientData?.profile?.service || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Téléphone</p>
              <p className="text-white font-bold">{clientData?.profile?.telephone || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Documents ({clientData?.documents?.length || 0})</h3>
          </div>
          <div className="space-y-3">
            {clientData?.documents?.map((doc) => (
              <div key={doc._id} className="p-4 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center group hover:border-teal-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <FileText size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white max-w-[200px] truncate">{doc.raw_zone?.filename}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">{doc.curated_zone?.document_type} • {new Date(doc.upload_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`text-[8px] font-bold px-2.5 py-1 rounded-full border ${doc.curated_zone?.status_final === 'VERIFIE' ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {doc.curated_zone?.status_final === 'VERIFIE' ? 'Vérifié' : 'En attente'}
                   </span>
                   {doc.curated_zone?.status_final === 'EN_ATTENTE' && (
                     <button 
                        onClick={() => onUpdateStatus(doc._id, 'VERIFIE')}
                        className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20 hover:bg-teal-500 hover:text-white transition-all scale-100 active:scale-95"
                        title="Valider ce document"
                     >
                       <CheckCircle size={14} />
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const userServices = new UserServices();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await userServices.adminGetUsers();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleViewDetails = async (client) => {
    try {
      const data = await userServices.adminGetUserDetails(client.email);
      setSelectedClient(data);
      setIsDrawerOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (docId, newStatus) => {
    try {
      await userServices.adminUpdateDocStatus(docId, newStatus);
      // Rafraîchir localement les détails
      const updatedData = await userServices.adminGetUserDetails(selectedClient.profile.email);
      setSelectedClient(updatedData);
      // Rafraîchir la liste générale (pour le count)
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestion des Clients</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">Supervision globale et dossiers clients</p>
        </div>
      </div>

      <div className="bg-[#0B1120] border border-white/10 rounded-lg overflow-hidden shadow-2xl backdrop-blur-xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-500 border-b border-white/10">
            <tr>
              <th className="px-8 py-6">Identité Entreprise</th>
              <th className="px-8 py-6">Contact / Mail</th>
              <th className="px-8 py-6">Activité (Docs)</th>
              <th className="px-8 py-6">Privilèges</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-8 py-8">
                    <div className="h-10 bg-white/5 rounded-lg w-full"></div>
                  </td>
                </tr>
              ))
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client._id} className="hover:bg-white/[0.02] transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-indigo-500/20 flex items-center justify-center text-teal-400 font-bold border border-white/10">
                        {client.nom_entreprise?.[0] || 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors uppercase tracking-tight">{client.nom_entreprise}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{client.prenom} {client.nom}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <p className="text-sm text-slate-300 font-medium">{client.email}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">{client.telephone || 'Aucun tel'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <FileText size={14} className="text-slate-600" />
                       <span className="text-sm text-white font-bold">{client.document_count || 0}</span>
                       <span className="text-[10px] text-slate-500 font-medium">pièces</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full border uppercase ${client.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {client.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleViewDetails(client)}
                      className="px-4 py-2 bg-white/5 text-white text-[10px] font-bold uppercase rounded-lg border border-white/10 hover:bg-white/10 hover:border-teal-500/50 transition-all active:scale-95"
                    >
                      Voir le dossier
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center text-slate-500 italic font-medium">
                  Aucun client enregistré pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ClientDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        clientData={selectedClient}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default Clients;
