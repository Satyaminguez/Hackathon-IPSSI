import React, { useState, useEffect, useRef } from "react";
import { FileText, Download, Trash2, Eye, Upload, X, Loader2 } from "lucide-react";
import UserServices from "../../services/UserServices";
import { toast, ToastContainer } from "react-toastify";
import DeleteModal from "./DeleteModal";

const Drawer = ({ isOpen, onClose, children }) => (
  <>
    <div 
      className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div className={`fixed top-0 right-0 h-full w-[450px] bg-slate-900 border-l border-slate-800 z-50 transform transition-transform duration-500 ease-out p-8 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-xl font-bold text-white">Uploader un fichier</h2>
          <p className="text-sm text-slate-500 mt-1">Envoyez vos documents administratifs</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </>
);

const FileSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-slate-900/20 border border-slate-800/50 rounded-lg animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-800 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-4 w-40 bg-slate-800 rounded"></div>
        <div className="h-3 w-24 bg-slate-800/50 rounded"></div>
      </div>
    </div>
    <div className="h-4 w-20 bg-slate-800 rounded"></div>
  </div>
);

const FileItem = ({ id, name, type, date, statut, onDelete, onView }) => (
  <div className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800 rounded-lg hover:bg-slate-900/50 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
        <FileText size={24} />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{name}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{type} • {date ? new Date(date).toLocaleDateString() : "Date inconnue"}</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
        statut === "VERIFIE" 
          ? "bg-teal-500/10 text-teal-400 border-teal-500/20" 
          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
      }`}>
        {statut === "VERIFIE" ? "Vérifié" : "En attente"}
      </span>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          className="p-2 text-slate-400 hover:text-teal-400 transition-colors"
          onClick={() => onView(id)}
        >
          <Eye size={16} />
        </button>
        <button className="p-2 text-slate-400 hover:text-red-400 transition-colors" onClick={() => onDelete({ id, name })}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

export default function Files() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  
  const fileInputRef = useRef(null);
  const userServices = new UserServices();
  const categories = ["Contrats", "Factures", "Identités", "Rapports", "Autres"];

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await userServices.getMyDocuments();
      setFiles(data);
    } catch (error) {
      toast.error("Erreur de chargement des fichiers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedCategory) {
      toast.warning("Veuillez sélectionner un fichier et une catégorie");
      return;
    }

    try {
      setUploading(true);
      await userServices.uploadDocument(selectedFile, selectedCategory);
      toast.success("Document envoyé avec succès !");
      setIsDrawerOpen(false);
      setSelectedFile(null);
      setSelectedCategory("");
      fetchFiles();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (file) => {
    setDocToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    try {
      await userServices.deleteDocument(docToDelete.id);
      toast.success("Document supprimé");
      setIsDeleteModalOpen(false);
      setDocToDelete(null);
      fetchFiles();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleView = async (id) => {
    try {
      await userServices.viewDocument(id);
    } catch (error) {
      toast.error(error.message || "Erreur lors de la visualisation");
    }
  };

  return (
    <div className="mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ToastContainer theme="dark" position="bottom-right" />
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Espace Documentaire Client</h1>
          <p className="text-slate-500 text-sm">Gérez et archivez vos documents administratifs sécurisés.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-md text-sm font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Upload size={18} />
          Uploader un document
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <>
            <FileSkeleton />
            <FileSkeleton />
            <FileSkeleton />
            <FileSkeleton />
            <FileSkeleton />
          </>
        ) : files.length > 0 ? (
          files.map((file) => (
            <FileItem 
              key={file.id} 
              id={file.id}
              name={file.nom_fichier} 
              type={file.type} 
              date={file.date} 
              statut={file.statut}
              onDelete={handleDeleteClick}
              onView={handleView}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-lg">
            <FileText className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500">Aucun document trouvé</p>
          </div>
        )}
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <form className="space-y-8" onSubmit={handleUpload}>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Catégorie du document</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3.5 px-4 text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all cursor-pointer"
            >
              <option value="">-- Choisir une catégorie --</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Fichiers à uploader</label>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${selectedFile ? 'border-teal-500 bg-teal-500/5' : 'border-slate-800'} rounded-lg p-10 text-center hover:border-teal-500 hover:bg-teal-500/5 transition-all group cursor-pointer`}
            >
              <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4 border border-slate-700 group-hover:border-teal-500/30 transition-all">
                <Upload className="text-slate-500 group-hover:text-teal-400 transition-colors" size={32} />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                {selectedFile ? selectedFile.name : "Cliquez pour télécharger"}
              </p>
              <p className="text-xs text-slate-500">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : "ou glissez un fichier ici"}
              </p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={uploading}
            className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold py-4 rounded-lg transition-all active:scale-[0.98] mt-10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : "Envoyer le document"}
          </button>
        </form>
      </Drawer>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={docToDelete?.name}
      />
    </div>
  );
}
