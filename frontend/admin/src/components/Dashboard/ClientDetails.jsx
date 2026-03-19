import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Mail, 
  Building2, 
  Phone, 
  FileText, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Trash2
} from "lucide-react";
import UserServices from "../../services/UserServices";
import Loader from "../Loader";
import { toast } from "react-toastify";

const DocRow = ({ doc, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = doc.curated_zone?.status_final || "EN_ATTENTE";
  const isCoherent = doc.curated_zone?.coherent !== false; // Par défaut true si non spécifié
  const anomaly = doc.curated_zone?.anomalie;
  const details = doc.curated_zone?.details || {};

  return (
    <>
      <tr className={`border-b border-white/5 group hover:bg-white/[0.02] transition-all ${!isCoherent ? 'bg-rose-500/5' : ''}`}>
        <td className="py-6 pl-6">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
              !isCoherent ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-900 border-white/5 text-slate-500 group-hover:text-orange-400'
            }`}>
              <FileText size={20} />
            </div>
            <div>
               <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-white">{doc.filename}</p>
                  {!isCoherent && (
                    <span className="flex items-center gap-1 text-[8px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                       <AlertTriangle size={10} /> Anomalie
                    </span>
                  )}
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Type : {doc.curated_zone?.type || "Inconnu"}
               </p>
               {anomaly && (
                 <p className="text-[10px] text-rose-400 font-black italic mt-0.5">⚠️ {anomaly.replace(/_/g, ' ')}</p>
               )}
            </div>
          </div>
        </td>
        <td className="py-6">
           <span className={`text-[9px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-widest ${
              status === "VERIFIE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              status === "REFUSE" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
              "bg-amber-500/10 text-amber-400 border-amber-500/20"
           }`}>
             {status}
           </span>
        </td>
        <td className="py-6 pr-6 text-right">
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={async () => {
                  try {
                    const services = new UserServices();
                    await services.adminViewDocument(doc._id);
                  } catch (e) {
                    toast.error("Impossible d'ouvrir le fichier");
                  }
                }}
                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                title="Visualiser le fichier original"
              >
                <Eye size={18} />
              </button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                title="Voir les détails OCR"
              >
                {isExpanded ? <ChevronUp size={18} /> : <Info size={18} />}
              </button>
              <button 
                onClick={() => onUpdateStatus(doc, "VERIFIE")}
                className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                title="Valider le document"
              >
                <CheckCircle2 size={18} />
              </button>
              <button 
                onClick={() => onUpdateStatus(doc, "REFUSE")}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Rejeter le document"
              >
                <XCircle size={18} />
              </button>
              <button 
                onClick={() => {
                  if (window.confirm("Supprimer ce document définitivement ?")) {
                    onUpdateStatus(doc, "DELETE");
                  }
                }}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Supprimer définitivement"
              >
                <Trash2 size={18} />
              </button>
           </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-900/50 border-b border-white/5">
          <td colSpan="3" className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{key.replace(/_/g, ' ')}</p>
                  <p className="text-xs font-bold text-white">{String(value)}</p>
                </div>
              ))}
              {Object.keys(details).length === 0 && (
                <p className="col-span-4 text-[10px] text-slate-500 italic uppercase">Aucune donnée supplémentaire extraite</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const ClientDetails = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    const services = new UserServices();
    try {
      const details = await services.adminGetUserDetails(email);
      setData(details);
    } catch (error) {
      toast.error("Échec du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [email]);

  const handleUpdateStatus = async (doc, newStatus) => {
    const services = new UserServices();
    
    // Cas de la suppression
    if (newStatus === "DELETE") {
      try {
        await services.adminDeleteDocument(doc._id);
        toast.success("Document supprimé définitivement");
        fetchDetails();
      } catch (error) {
        toast.error("Erreur de suppression serveur");
      }
      return;
    }

    // Cas de Validation / Refus
    let reason = null;
    if (newStatus === "REFUSE") {
      reason = doc.curated_zone?.anomalie?.replace(/_/g, ' ') || "Le document fourni est incomplet ou illisible/incohérent.";
    }

    try {
      await services.adminUpdateDocStatus(doc._id, newStatus, reason);
      toast.success(`Statut mis à jour : ${newStatus}`);
      fetchDetails();
    } catch (error) {
      toast.error("Erreur serveur lors de la mise à jour");
    }
  };

  if (loading) return <Loader />;
  if (!data) return <div className="p-20 text-center text-white uppercase font-black text-xs tracking-widest">Client introuvable</div>;

  const { profile, documents } = data;

  return (
    <div className="max-w-[1240px] mx-auto animate-in fade-in duration-700 space-y-10 pb-32">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-orange-400 transition-all font-black uppercase tracking-[0.2em] text-[9px] group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Retour au panel de gestion
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Details */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#0B1120] border border-white/10 p-10 rounded-lg shadow-2xl backdrop-blur-lg sticky top-24">
            <div className="w-24 h-24 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-10 mx-auto shadow-inner">
              <Building2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tighter">
              {profile.prenom} {profile.nom}
            </h2>
            <p className="text-orange-400 text-sm font-bold text-center mb-2">{profile.nom_entreprise}</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] text-center mb-10 border-b border-white/5 pb-8">Dossier Certifié Hackathon 2026</p>
            
            <div className="space-y-8">
              <div className="bg-white/5 p-5 rounded-lg border border-white/5 group hover:border-orange-500/30 transition-all">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Identifiant Client</p>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-orange-400" />
                  <p className="text-sm font-bold text-white break-all">{profile.email}</p>
                </div>
              </div>

              <div className="bg-white/5 p-5 rounded-lg border border-white/5 group hover:border-orange-500/30 transition-all">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Ligne de Contact</p>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-orange-400" />
                  <p className="text-sm font-bold text-white">{profile.telephone || "Ligne non attribuée"}</p>
                </div>
              </div>

              <div className="bg-white/5 p-5 rounded-lg border border-white/5 group hover:border-orange-500/30 transition-all">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Service Assigné</p>
                <div className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg text-xs font-black inline-block uppercase tracking-widest">
                  {profile.service || "Général"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="lg:col-span-8">
          <div className="bg-[#0B1120] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                 Audit Documents ingérés
                 <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-400 uppercase tracking-[0.2em]">{documents.length} FICHIERS</span>
              </h3>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <DocRow key={doc._id} doc={doc} onUpdateStatus={handleUpdateStatus} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-24 text-center">
                         <div className="flex flex-col items-center gap-4 opacity-30">
                            <AlertTriangle size={48} />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Coffre-fort vide</p>
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
    </div>
  );
};

export default ClientDetails;
