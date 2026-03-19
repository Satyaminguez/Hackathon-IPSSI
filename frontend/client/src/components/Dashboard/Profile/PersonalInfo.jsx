import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import UserServices from "../../../services/UserServices";
import Loader from "../../Loader";
import { User, Mail, Building, Shield } from "lucide-react";

export default function PersonalInfo() {
  const { user: reduxUser } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    firstname: reduxUser?.prenom || "",
    lastname: reduxUser?.nom || "",
    email: reduxUser?.email || "",
    entreprise: reduxUser?.nom_entreprise || "",
    role: reduxUser?.role || "user",
  });
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      // Si on a déjà les infos en Redux, on peut s'en contenter ou rafraîchir en arrière-plan
      if (!reduxUser) {
        setLoad(true);
      }
      const userServices = new UserServices();
      try {
        const data = await userServices.getUser();
        setFormData({
          firstname: data.prenom || "",
          lastname: data.nom || "",
          email: data.email || "",
          entreprise: data.nom_entreprise || "",
          role: data.role || "user",
        });
        setLoad(false);
      } catch (err) {
        setLoad(false);
        // On ne bloque pas l'affichage si l'API échoue mais qu'on a Redux
        if (!reduxUser) {
          setError("Impossible de charger les informations.");
        }
      }
    };
    fetchUserInfo();
  }, [reduxUser]);

  if (error && !reduxUser) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      {load && <Loader />}
      
      <div className="rounded-lg p-8 bg-slate-900/50 border border-slate-800 backdrop-blur-sm max-w-3xl">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <User size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Prénom</span>
            </div>
            <p className="text-white font-medium pl-6">{formData.firstname || "Non renseigné"}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <User size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Nom</span>
            </div>
            <p className="text-white font-medium pl-6">{formData.lastname || "Non renseigné"}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Building size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Entreprise</span>
            </div>
            <p className="text-white font-medium pl-6">{formData.entreprise || "Non renseigné"}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Mail size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Email</span>
            </div>
            <p className="text-white font-medium pl-6">{formData.email || "Non renseigné"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
