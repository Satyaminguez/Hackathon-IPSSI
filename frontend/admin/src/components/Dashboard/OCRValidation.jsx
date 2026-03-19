import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Eye, Search, Filter, ShieldCheck, Link2, FileText, Zap, ChevronRight, XCircle, Info, Trash2 } from "lucide-react";
import UserServices from "../../services/UserServices";
import Loader from "../Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OCRValidation = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    const services = new UserServices();
    try {
      const data = await services.adminGetDocuments();
      setDocuments(data);
      if (data.length > 0 && !selectedFile) {
        setSelectedFile(data[0]); // Sélection par défaut du premier de la liste
      }
    } catch (error) {
      toast.error("Échec du chargement des documents globaux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpdateStatus = async (doc, newStatus) => {
    let reason = null;
    if (newStatus === "REFUSE") {
      // Récupération automatique de l'anomalie IA comme motif de rejet
      reason = doc.curated_zone?.anomalie?.replace(/_/g, ' ') || "Votre document présente une non-conformité par rapport à nos standards.";
    }

    const services = new UserServices();
    try {
      await services.adminUpdateDocStatus(doc._id, newStatus, reason);
      toast.success(`Le document a été passé en statut : ${newStatus}`);
      fetchDocuments(); // Rafraichissement après mutation
    } catch (error) {
      toast.error("Erreur durant l'opération serveur");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0D1425]/40 p-8 rounded-lg border border-white/5 backdrop-blur-md">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_15px_#14b8a6] animate-pulse" />
             <h1 className="text-3xl font-black text-white tracking-tighter">Supervision Extraction</h1>
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
             Module Actif : <span className="text-teal-400">IDP Core Engine v2.0</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3 hover:bg-white/10 transition-all text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
              <Search size={16} className="text-teal-400" />
              Recherche Avancée
           </button>
           <button className="px-6 py-3 bg-teal-500 text-[#0B1120] font-black rounded-lg flex items-center gap-3 hover:bg-teal-400 transition-all shadow-[0_10px_30px_rgba(20,184,166,0.3)] text-[10px] uppercase tracking-widest">
              <Filter size={16} />
              Trier par Anomalie
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Colonne Gauche : Liste globale des documents */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0D1425]/60 border border-white/10 rounded-lg overflow-hidden shadow-2xl backdrop-blur-3xl h-[800px] flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
               <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                 File d'Attente Globale
                 <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">{documents.length} FICHIERS</span>
               </h2>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((item) => {
                      const isSelected = selectedFile?._id === item._id;
                      const isCoherent = item.curated_zone?.coherent !== false;
                      const hasAnomaly = !!item.curated_zone?.anomalie;

                      return (
                        <tr 
                          key={item._id} 
                          className={`cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-teal-500/10 border-l-4 border-teal-500" 
                              : "border-l-4 border-transparent hover:bg-white/5"
                          } ${!isCoherent ? "bg-rose-500/5 hover:bg-rose-500/10" : ""}`}
                          onClick={() => setSelectedFile(item)}
                        >
                          <td className="py-5 pl-6">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg border ${
                                !isCoherent ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                isSelected ? "bg-teal-500/20 border-teal-500/30 text-teal-400" : "bg-white/5 border-white/5 text-slate-500"
                              }`}>
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className={`text-sm font-black tracking-tight ${isSelected ? "text-teal-400" : "text-white"}`}>
                                  {item.filename}
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                  {item.uploaded_by}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5">
                             {!isCoherent ? (
                               <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 w-max">
                                 <AlertTriangle size={12} /> Anomalie IA
                               </span>
                             ) : (
                               <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-max">
                                 <CheckCircle2 size={12} /> Cohérent
                               </span>
                             )}
                          </td>
                          <td className="py-5 text-right pr-6">
                            <ChevronRight size={18} className={`${isSelected ? "text-teal-500 translate-x-1" : "text-slate-600"} transition-all`} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-32 text-center text-slate-500 font-extrabold text-[10px] uppercase tracking-widest">
                        Aucun document en attente dans la Data Lake.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Panneau d'inspection détaillé */}
        <div className="lg:col-span-5 space-y-6">
          {selectedFile ? (
            <div className="bg-[#0B1120] border border-white/10 rounded-lg p-10 space-y-10 shadow-2xl sticky top-24 backdrop-blur-2xl">
              
              <div className="space-y-2 text-center pb-8 border-b border-white/5 relative">
                 <div className="absolute top-0 right-0 opacity-10 blur-[2px]">
                   <ShieldCheck size={100} className="text-teal-500" />
                 </div>
                 <h2 className="text-xl font-black text-white break-all tracking-tight relative z-10">{selectedFile.filename}</h2>
                 <p className="text-[10px] font-bold text-teal-500 uppercase tracking-[0.2em] relative z-10">
                   {selectedFile.curated_zone?.type || "Type Inconnu"}
                 </p>
                 <div className="pt-4 flex justify-center mt-2 relative z-10">
                   <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${
                      selectedFile.curated_zone?.status_final === "VERIFIE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]" :
                      selectedFile.curated_zone?.status_final === "REFUSE" ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                   }`}>
                     Statut IA : {selectedFile.curated_zone?.status_final || "EN_ATTENTE"}
                   </span>
                 </div>
              </div>

              {/* Bloc Anomalie (si présente) */}
              {selectedFile.curated_zone?.coherent === false && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-6 flex gap-4 items-start shadow-inner">
                  <div className="mt-1 text-rose-500 bg-rose-500/10 p-2 rounded-lg">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-400 uppercase tracking-tighter mb-1">Alerte de Cohérence</h4>
                    <p className="text-xs font-bold text-white capitalize">{selectedFile.curated_zone?.anomalie?.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-rose-300 mt-2 font-medium opacity-80">
                      Ce document présente une anomalie détectée par le moteur IA. Une vérification humaine minutieuse des champs extraits est recommandée avant validation définitive.
                    </p>
                  </div>
                </div>
              )}

              {/* Bloc Détails OCR */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Zap size={14} className="text-teal-500" /> Données Extraites
                </h3>
                
                <div className="bg-white/5 border border-white/5 rounded-lg p-6">
                  {selectedFile.curated_zone?.details && Object.keys(selectedFile.curated_zone.details).length > 0 ? (
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      {Object.entries(selectedFile.curated_zone.details).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-black text-white">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 opacity-40">
                       <Info size={24} className="mb-2 text-slate-400" />
                       <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Aucune donnée complexe isolée</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                <button 
                  onClick={async () => {
                    try {
                      const services = new UserServices();
                      await services.adminViewDocument(selectedFile._id);
                    } catch (e) {
                      toast.error("Impossible d'ouvrir le fichier original");
                    }
                  }}
                  className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 text-[10px] uppercase tracking-[0.2em]"
                >
                  <Eye size={16} /> Visualiser le document original
                </button>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleUpdateStatus(selectedFile, "VERIFIE")}
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-[#0B1120] font-black py-4 rounded-lg transition-all shadow-[0_10px_20px_rgba(20,184,166,0.2)] flex items-center justify-center gap-2 tracking-widest uppercase text-[10px]"
                  >
                     <CheckCircle2 size={16} /> Certifier
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedFile, "REFUSE")}
                    className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-black py-4 rounded-lg transition-all flex items-center justify-center gap-2 tracking-widest uppercase text-[10px]"
                  >
                     <XCircle size={16} /> Rejeter
                  </button>
                </div>
                <div className="flex gap-4 mt-2">
                  <button 
                    onClick={() => navigate(`/dashboard/admin/clients/${selectedFile.uploaded_by}`)}
                    className="flex-[3] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg transition-all text-[10px] uppercase tracking-[0.2em] border border-white/5"
                  >
                    Voir le dossier client complet
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce document ?")) {
                        try {
                          const services = new UserServices();
                          await services.adminDeleteDocument(selectedFile._id);
                          toast.success("Document supprimé avec succès");
                          setSelectedFile(null);
                          fetchDocuments();
                        } catch (error) {
                          toast.error("Erreur lors de la suppression");
                        }
                      }
                    }}
                    title="Supprimer définitivement"
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold py-3 rounded-lg transition-all flex justify-center items-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#0B1120]/50 border border-white/5 rounded-lg h-full min-h-[500px] flex flex-col items-center justify-center space-y-6 opacity-60">
               <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                 <MousePointerClick size={32} className="text-slate-500" />
               </div>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Sélectionner un fichier pour audit</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Injection d'une fausse icône car MousePointerClick n'est pas importée (fallback Lucide)
import { Pointer } from "lucide-react";
const MousePointerClick = Pointer;

export default OCRValidation;
