import React, { useState, useEffect } from "react";
import UserServices from "../../../services/UserServices";
import Loader from "../../Loader";

export default function PersonalInfo() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
  });
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoad(true);
      const userServices = new UserServices();
      try {
        const data = await userServices.getUser();
        setFormData({
          prenom: data.prenom || "",
          nom: data.nom || "",
          email: data.email || "",
        });
        setLoad(false);
      } catch (err) {
        setLoad(false);
      }
    };
    fetchUserInfo();
  }, []);

  if (error) {
    return <div className="text-red-500 font-bold p-10">{error}</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
      {load && <Loader />}
      
      <div className="rounded-lg p-10 bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
        <h3 className="text-[10px] font-extrabold text-orange-400 uppercase tracking-[0.2em] mb-10 border-b border-white/5 pb-4">Profil Administrateur Certifié</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prénom</label>
            <p className="text-xl font-bold text-white tracking-tight border-l-2 border-orange-500 pl-4 py-1">
              {formData.prenom || "Chargement..."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nom</label>
            <p className="text-xl font-bold text-white tracking-tight border-l-2 border-orange-500 pl-4 py-1">
              {formData.nom || "Chargement..."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</label>
            <p className="text-xl font-bold text-white tracking-tight border-l-2 border-orange-500 pl-4 py-1">
               {formData.email || "Chargement..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
