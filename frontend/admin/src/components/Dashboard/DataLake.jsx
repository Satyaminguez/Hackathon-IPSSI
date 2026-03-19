import React, { useState, useEffect } from "react";
import { Database, FileCode, CheckCircle2, ChevronRight, Layers, Workflow, Share2, ArrowRight } from "lucide-react";
import UserServices from "../../services/UserServices";
import Loader from "../Loader";
import { toast } from "react-toastify";

/**
 * Composant de supervision du Data Lake (DYNAMIQUE)
 */
const DataLakeZones = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      const services = new UserServices();
      try {
        const docs = await services.adminGetDocuments();
        setDocuments(docs);
      } catch (error) {
        toast.error("Erreur de synchronisation du Data Lake");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  if (loading) return <Loader />;

  // Calculs dynamiques
  const rawCount = documents.length;
  // On considère 'Clean' tous les documents qui ont été lus par l'OCR
  const cleanCount = documents.filter(d => d.curated_zone).length;
  // 'Curated' correspond aux documents validés "VERIFIE"
  const curatedCount = documents.filter(d => d.curated_zone?.status_final === "VERIFIE").length;

  const zones = [
    { 
      id: "raw", 
      name: "Raw Zone", 
      description: "Documents administratifs bruts stockés sur la plateforme.", 
      files: rawCount, 
      size: `${(rawCount * 1.5).toFixed(1)} MB`, // Taille fictive pour l'esthétique
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
      icon: <Database size={32} />
    },
    { 
      id: "clean", 
      name: "Clean Zone", 
      description: "Texte extrait, nettoyé et normalisé par l'Intelligence Artificielle.", 
      files: cleanCount, 
      size: `${(cleanCount * 0.4).toFixed(1)} MB`, 
      color: "border-orange-500/20 text-orange-400 bg-orange-500/5",
      icon: <FileCode size={32} />
    },
    { 
      id: "curated", 
      name: "Curated Zone", 
      description: "Données certifiées structurées (JSON) prêtes pour l'export.", 
      files: curatedCount, 
      size: `${(curatedCount * 0.1).toFixed(1)} MB`, 
      color: "border-amber-500/20 text-amber-400 bg-amber-500/5",
      icon: <Layers size={32} />
    },
  ];

  // Les 4 derniers documents ajoutés
  const recentDocs = documents.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
            Supervision du Data Lake <span className="px-3 py-1 bg-orange-600/10 text-orange-500 text-[10px] rounded-full uppercase tracking-wider">Orchestration Active</span>
          </h1>
          <p className="text-slate-500 text-sm">Surveillance du stockage structuré en temps réel (Architecture NoSQL).</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <Workflow className="text-emerald-400" size={16} />
            <span className="text-xs font-bold text-slate-300">Synchronisé</span>
          </div>
        </div>
      </div>

      {/* Visual Flow Architecture */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {zones.map((zone, index) => (
          <React.Fragment key={zone.id}>
            <div className={`flex-1 w-full p-8 rounded-lg border ${zone.color} relative overflow-hidden group hover:scale-[1.02] transition-all`}>
              <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                {zone.icon}
              </div>
              
              <div className="w-16 h-16 bg-slate-900/50 rounded-md flex items-center justify-center mb-6 border border-slate-800 shadow-xl">
                {React.cloneElement(zone.icon, { size: 32, className: "text-inherit" })}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{zone.name}</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium line-clamp-2">{zone.description}</p>
              
              <div className="flex items-center gap-3 pt-6 border-t border-slate-800/50">
                <div className="text-xs">
                  <p className="text-slate-500 uppercase tracking-widest font-bold mb-1">Documents</p>
                  <p className="text-white font-bold">{zone.files.toLocaleString()}</p>
                </div>
                <div className="w-[1px] h-8 bg-slate-800/50 mx-2" />
                <div className="text-xs">
                  <p className="text-slate-500 uppercase tracking-widest font-bold mb-1">Poids Est.</p>
                  <p className="text-white font-bold">{zone.size}</p>
                </div>
              </div>
            </div>
            {index < zones.length - 1 && (
              <div className="hidden md:flex flex-col items-center gap-2 px-2 text-slate-700">
                <ArrowRight size={24} className="animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Pipeline</span>
              </div>
            )}
            {index < zones.length - 1 && (
              <div className="md:hidden py-4 text-slate-700">
                <ArrowRight size={24} className="rotate-90 animate-pulse" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Real System Logs */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 font-mono text-[11px] space-y-3 text-slate-400">
        <div className="flex items-center gap-3 text-emerald-500 mb-4 border-b border-slate-800 pb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="uppercase tracking-[0.2em] font-bold">[SYSTEM_MONITOR : Logs en direct]</span>
        </div>
        
        {recentDocs.length > 0 ? (
          recentDocs.map((doc, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-slate-500">[RAW_ZONE] Ingestion de l'objet : <span className="text-white">{doc.filename}</span></p>
              <p className="text-orange-400 pl-4">└── [CLEAN_ZONE] Routine IA exécutée. Type détecté: {doc.curated_zone?.type || 'Inconnu'}</p>
              {doc.curated_zone?.status_final === "VERIFIE" && (
                <p className="text-emerald-400 pl-8">└── [CURATED_ZONE] Objet certifié (Prêt pour export JSON)</p>
              )}
            </div>
          ))
        ) : (
          <p>En attente de flux de données...</p>
        )}
      </div>

      {/* Auto-remplissage des Front-ends simulés */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-orange-500/5">
          <Share2 size={120} />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Auto-remplissage des Systèmes Métiers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-lg hover:border-orange-500/40 transition-colors">
            <h3 className="text-orange-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
              CRM & Outil de Conformité <CheckCircle2 size={14} />
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
              Mise à jour automatique des fiches clients après validation OCR. Détection intelligente des incohérences déclaratives pour alerte.
            </p>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-[100%]" />
            </div>
            <p className="text-[10px] text-right mt-2 text-slate-600 font-bold">FLUX ACTIF</p>
          </div>

          <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-lg hover:border-emerald-500/40 transition-colors">
            <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
              Base de Données Centrale JSON <CheckCircle2 size={14} />
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
              Alimentation continue des <b>{curatedCount} documents</b> certifiés ("Curated") pour traitement automatisé par le SI de l'entreprise.
            </p>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[100%]" />
            </div>
            <p className="text-[10px] text-right mt-2 text-slate-600 font-bold">DISPONIBLE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataLakeZones;
