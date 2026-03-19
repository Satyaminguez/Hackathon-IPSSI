import React, { useState, useEffect } from "react";
import { Users, Mail, Calendar, Activity, X, FileText, CheckCircle, Clock } from "lucide-react";
import UserServices from "../../services/UserServices";
import { toast, ToastContainer } from "react-toastify";

const ClientDrawer = ({ isOpen, onClose, clientData, onUpdateStatus }) => (
  <>
    <div 
      className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div className={`fixed top-0 right-0 h-full w-[550px] bg-slate-900 border-l border-slate-800 z-50 transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div>
          <h2 className="text-xl font-bold text-white">Détails Client</h2>
          <p className="text-xs text-slate-500 mt-1">{clientData?.profile?.email}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-800">
          <h3 className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-4">Informations</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Entreprise</p>
              <p className="text-white font-medium">{clientData?.profile?.nom_entreprise}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Contact</p>
              <p className="text-white font-medium">{clientData?.profile?.prenom} {clientData?.profile?.nom}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Service</p>
              <p className="text-white font-medium">{clientData?.profile?.service || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Téléphone</p>
              <p className="text-white font-medium">{clientData?.profile?.telephone || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div>
          <h3 className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-4">Documents importés ({clientData?.documents?.length})</h3>
          <div className="space-y-3">
            {clientData?.documents?.map((doc) => (
              <div key={doc._id} className="p-4 bg-slate-950/30 border border-slate-800 rounded-lg flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-500" />
                  <div>
                    <p className="text-xs font-bold text-white max-w-[200px] truncate">{doc.raw_zone?.filename}</p>
                    <p className="text-[9px] text-slate-500 uppercase">{doc.curated_zone?.document_type} • {new Date(doc.upload_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${doc.curated_zone?.status_final === 'VERIFIE' ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {doc.curated_zone?.status_final === 'VERIFIE' ? 'Vérifié' : 'En attente'}
                   </span>
                   {doc.curated_zone?.status_final === 'EN_ATTENTE' && (
                     <button 
                        onClick={() => onUpdateStatus(doc._id, 'VERIFIE')}
                        className="p-1.5 bg-teal-600/10 text-teal-500 rounded hover:bg-teal-600 hover:text-white transition-all"
                        title="Valider manuellement"
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
      toast.error("Échec du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleViewDetails = async (email) => {
    try {
      const data = await userServices.adminGetUserDetails(email);
      setSelectedClient(data);
      setIsDrawerOpen(true);
    } catch (err) {
      toast.error("Impossible de charger les détails");
    }
  };

  const handleUpdateStatus = async (docId, newStatus) => {
    try {
      await userServices.adminUpdateDocStatus(docId, newStatus);
      toast.success("Document validé !");
      // Rafraîchir les détails
      const updatedData = await userServices.adminGetUserDetails(selectedClient.profile.email);
      setSelectedClient(updatedData);
    } catch (err) {
      toast.error("Erreur de mise à jour");
    }
  };

  return (
    <div className="mx-auto space-y-8 animate-in fade-in duration-700">
      <ToastContainer theme="dark" position="bottom-right" />
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Gestion des Clients</h1>
          <p className="text-slate-500 text-sm">Contrôlez les accès et surveillez l'activité.</p>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
            <tr>
              <th className="px-8 py-5">Client / Entreprise</th>
              <th className="px-8 py-5">Email Agent</th>
              <th className="px-8 py-5">Volume Docs</th>
              <th className="px-8 py-5">Rôle</th>
              <th className="px-8 py-5 text-right">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="h-16 bg-slate-800/10"></td>
                </tr>
              ))
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client._id} className="hover:bg-slate-800/10 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold text-xs border border-teal-500/20">
                        {client.nom_entreprise?.[0] || 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{client.nom_entreprise}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{client.prenom} {client.nom}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                    {client.email}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <FileText size={14} className="text-slate-600" />
                       <span className="text-sm text-slate-200 font-bold">{client.document_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${client.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {client.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleViewDetails(client.email)}
                      className="text-teal-500 hover:text-teal-400 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Dossier complet →
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-8 py-10 text-center text-slate-500 italic">Aucun client trouvé</td>
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
