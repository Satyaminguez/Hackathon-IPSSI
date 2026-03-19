import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Eye, Search, Filter, ShieldCheck, Link2, FileText, Zap, ChevronRight } from "lucide-react";

/**
 * Composant de validation OCR pour les administrateurs
 * Permet de vérifier les informations extraites et de détecter les incohérences inter-documents.
 */
const OCRValidation = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const pendingValidations = [
    { 
      id: 1, 
      client: "ACME Corp", 
      file: "facture_789.pdf", 
      confidence: 94, 
      incoherence: "SIRET différent de l'attestation URSSAF",
      status: "Attention" 
    },
    { 
      id: 2, 
      client: "Global Tech", 
      file: "rib_johndoe.jpg", 
      confidence: 99, 
      incoherence: null,
      status: "Prêt" 
    },
    { 
      id: 3, 
      client: "Startup SARL", 
      file: "kbis_2026.pdf", 
      confidence: 76, 
      incoherence: "Date d'expiration dépassée",
      status: "Bloqué" 
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Validation OCR & Conformité</h1>
          <p className="text-slate-500 text-sm">Vérifiez les métadonnées extraites et validez la cohérence inter-documents.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-md px-4 py-2 flex items-center gap-2">
            <Zap className="text-amber-400" size={16} />
            <span className="text-xs font-bold text-slate-300 tracking-tight">Analyse IA de Cohérence: Activée</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Liste des validations en cours */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Files d'attente</h2>
              <button className="text-[10px] font-bold text-teal-400 hover:text-teal-300 transition-colors uppercase tracking-widest">Tout traiter</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/20 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Confiance</th>
                    <th className="px-6 py-4">Vérification</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pendingValidations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => setSelectedFile(item)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.incoherence ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{item.file}</p>
                            <p className="text-[10px] text-slate-500">{item.client}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold ${item.confidence > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{item.confidence}%</span>
                      </td>
                      <td className="px-6 py-4">
                        {item.incoherence ? (
                          <span className="flex items-center gap-2 text-amber-500 text-[10px] font-bold">
                            <AlertCircle size={14} /> Alert IA
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
                            <CheckCircle2 size={14} /> OK
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight size={16} className="ml-auto text-slate-600 group-hover:text-white transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Détails IA : Vérification Intelligence */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-lg space-y-8 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 text-white/5 opacity-10">
              <Zap size={100} />
            </div>

            <h3 className="text-white font-bold flex items-center gap-2">
              <ShieldCheck className="text-teal-400" size={20} />
              Analyse de Cohérence IA
            </h3>
            
            <div className="space-y-6 relative z-10">
              {/* Comparaison de Données */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800/50 space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                    <span>N° SIRET - Extraction Facture</span>
                    <span className="text-emerald-500">94.2% confiance</span>
                  </p>
                  <p className="text-sm font-mono text-white tracking-widest">897 452 001 00054</p>
                </div>

                <div className="flex justify-center -my-3 relative z-20">
                  <div className="bg-slate-800 p-2 rounded-full border border-slate-700 text-teal-500 shadow-xl">
                    <Link2 size={16} className="animate-pulse" />
                  </div>
                </div>

                <div className={`p-4 bg-slate-950/80 rounded-lg border ${selectedFile?.incoherence?.includes('SIRET') ? 'border-amber-500/30 ring-1 ring-amber-500/20' : 'border-slate-800/50'} space-y-3`}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                    <span>N° SIRET - Base de Référence URSSAF</span>
                    <span className="text-amber-500">Différence détectée</span>
                  </p>
                  <p className={`text-sm font-mono tracking-widest ${selectedFile?.incoherence?.includes('SIRET') ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                    897 452 001 000<span className="bg-amber-500/20 px-1 rounded">22</span>
                  </p>
                </div>
              </div>

              {/* Statut Alerte */}
              <div className={`p-4 rounded-lg flex items-start gap-3 ${selectedFile?.incoherence ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                <AlertCircle className={selectedFile?.incoherence ? 'text-amber-400' : 'text-emerald-400'} size={18} />
                <div>
                  <p className={`text-xs font-bold leading-tight ${selectedFile?.incoherence ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedFile?.incoherence || "Aucune anomalie critique détectée entre les pièces."}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    {selectedFile?.incoherence ? "L'opérateur doit vérifier manuellement la validité du document." : "Les données extraites concordent avec les bases de données externes."}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex gap-3">
              <button className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-md transition-all active:scale-[0.98]">
                Valider Document
              </button>
              <button className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-all">
                Rejeter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRValidation;
