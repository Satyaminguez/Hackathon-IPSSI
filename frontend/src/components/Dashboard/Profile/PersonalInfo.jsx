import React, { useState, useEffect } from "react";
import UserServices from "../../../services/UserServices";
import Loader from "../../Loader";

export default function PersonalInfo() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
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
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
        });
        setLoad(false);
      } catch (err) {
        setLoad(false);
        // setError("Impossible de récupérer les informations utilisateur.");
      }
    };
    fetchUserInfo();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      {load && <Loader />}
      
      <div className="rounded-lg p-8 bg-slate-900/50 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prénom</label>
            <p className="text-lg font-medium text-white py-3">
              {formData.firstname || "#"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nom de famille</label>
            <p className="text-lg font-medium text-white py-3">
              {formData.lastname || "#"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Adresse Email</label>
            <p className="text-lg font-medium text-white py-3 rounded-xl">
              {formData.email || "#"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
