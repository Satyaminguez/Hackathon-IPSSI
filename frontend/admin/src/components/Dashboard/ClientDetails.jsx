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
  Clock,
  ExternalLink
} from "lucide-react";
import UserServices from "../../services/UserServices";
import Loader from "../Loader";
import { toast } from "react-toastify";

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
      toast.error("Impossible de charger les détails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [email]);

  const handleUpdateStatus = async (docId, newStatus) => {
    const services = new UserServices();
    try {
      await services.adminUpdateDocStatus(docId, newStatus);
      toast.success(`Document ${newStatus.toLowerCase()} avec succès`);
      fetchDetails();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) return <Loader />;
  if (!data) return <div className="p-20 text-center text-white">Client non trouvé</div>;

  const { profile, documents } = data;

  return (
    <div className="max-w-[1240px] mx-auto animate-in fade-in duration-500 space-y-8 pb-32">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px] group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Retour à la liste
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0D1425] border border-white/5 p-8 rounded-lg shadow-2xl">
            <div className="w-20 h-20 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-8 mx-auto">
              <Building2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-white text-center mb-2">{profile.nom_entreprise}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] text-center mb-8 border-b border-white/5 pb-6">Client Certifié</p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-teal-400 transition-colors">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold text-white">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-teal-400 transition-colors">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Téléphone</p>
                  <p className="text-sm font-bold text-white">{profile.telephone || "Non renseigné"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="lg:col-span-2">
          <div className="bg-[#0D1425] border border-white/5 rounded-lg overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Dossier Documents ({documents.length})</h3>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left">
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <tr key={doc._id} className="border-b border-white/5 group hover:bg-white/5 transition-all">
                        <td className="py-6 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-teal-400">
                              <FileText size={20} />
                            </div>
                            <div>
                               <p className="text-sm font-black text-white">{doc.filename}</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                  Détecté : {doc.curated_zone?.type || "Inconnu"}
                               </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6">
                           <span className={`text-[9px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-widest ${
                              doc.curated_zone?.status_final === "VERIFIE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              doc.curated_zone?.status_final === "REFUSE" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                              "bg-amber-500/10 text-amber-400 border-amber-500/20"
                           }`}>
                             {doc.curated_zone?.status_final || "EN_ATTENTE"}
                           </span>
                        </td>
                        <td className="py-6 pr-6 text-right">
                           <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => handleUpdateStatus(doc._id, "VERIFIE")}
                                className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(doc._id, "REFUSE")}
                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                              >
                                <XCircle size={18} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs italic">
                        Ce client n'a pas encore de document ingéré.
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
