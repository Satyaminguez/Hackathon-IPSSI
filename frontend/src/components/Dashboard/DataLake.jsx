import React from "react";
import { Database, FileCode, CheckCircle2, ChevronRight, Layers, Workflow, Share2, ArrowRight } from "lucide-react";

/**
 * Composant de supervision du Data Lake pour les administrateurs
 * Affiche les 3 zones de stockage : Raw, Clean et Curated avec un flux visuel.
 */
const DataLakeZones = () => {
  const zones = [
    { 
      id: "raw", 
      name: "Raw Zone", 
      description: "Documents administratifs bruts (PDF, PNG, JPG). Stockage NoSQL.", 
      files: 2458, 
      size: "12.4 GB", 
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
      icon: <Database size={32} />
    },
    { 
      id: "clean", 
      name: "Clean Zone", 
      description: "Texte extrait via OCR Tesseract, nettoyé et normalisé.", 
      files: 2458, 
      size: "4.2 GB", 
      color: "border-teal-500/20 text-teal-400 bg-teal-500/5",
      icon: <FileCode size={32} />
    },
    { 
      id: "curated", 
      name: "Curated Zone", 
      description: "Données structurées JSON pour export CRM/Outils de conformité.", 
      files: 2458, 
      size: "1.2 GB", 
      color: "border-amber-500/20 text-amber-400 bg-amber-500/5",
      icon: <Layers size={32} />
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
            Supervision du Data Lake <span className="px-3 py-1 bg-teal-600/10 text-teal-500 text-[10px] rounded-full uppercase tracking-wider">Orchestration Active</span>
          </h1>
          <p className="text-slate-500 text-sm">Surveillance du stockage structuré en 3 zones (Architecture NoSQL).</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <Workflow className="text-emerald-400" size={16} />
            <span className="text-xs font-bold text-slate-300">Airflow: 12 docs/min</span>
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
                  <p className="text-slate-500 uppercase tracking-widest font-bold mb-1">Volume</p>
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

      {/* Simulation System Logs */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 font-mono text-[11px] space-y-2 text-slate-400">
        <div className="flex items-center gap-3 text-teal-500">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>[SYSTEM] DAG 'ocr_extraction_v2' triggered successfully</span>
        </div>
        <p>[RAW_ZONE] Received object: invoice_client_042.pdf (1.2MB)</p>
        <p>[OCR_NODE] OCR Engine initialized (Tesseract 5.0)</p>
        <p>[CLEAN_ZONE] Storing extracted text chunk: company_id=SIRET-897452...</p>
        <p className="text-emerald-500">[CURATED_ZONE] Structured data ready for export (JSON format)</p>
      </div>

      {/* Auto-remplissage des Front-ends simulés */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-teal-500/5">
          <Share2 size={120} />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Auto-remplissage des Systèmes Métiers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-lg hover:border-teal-500/40 transition-colors">
            <h3 className="text-teal-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
              CRM & Outil de Conformité <CheckCircle2 size={14} />
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
              Mise à jour automatique des fiches fournisseurs après validation OCR. Détection des doublons SIRET et alertes de conformité URSSAF.
            </p>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 w-[85%]" />
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-lg hover:border-emerald-500/40 transition-colors">
            <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
              Base Fournisseur Interne <CheckCircle2 size={14} />
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
              Saisie automatisée des montants HT/TTC et dates d'échéance dans le système de facturation interne.
            </p>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[92%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataLakeZones;
