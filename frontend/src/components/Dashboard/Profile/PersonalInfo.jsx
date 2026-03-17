import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Password from "./Password";
import UserServices from "../../../services/UserServices";
import Loader from "../../Loader";

export default function PersonalInfo() {
  const [editInfo, setEditInfo] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userServices = new UserServices();
      try {
        const data = await userServices.getUser();
        setFormData({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          email: data.email || "",
        });
        setEditInfo(true);
      } catch (err) {
        setError("Impossible de récupérer les informations utilisateur.");
      }
    };
    fetchUserInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlerSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);

    const userServices = new UserServices();

    try {
      await userServices.updateInfo(formData);
      setLoad(false);
      toast.success("Vos informations ont été modifiées avec succès !");
    } catch (error) {
      setLoad(false);
      toast.error(error.message || "Une erreur est survenue.");
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      {load && <Loader />}

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">
          Mes informations personnelles
        </h2>

        <form onSubmit={handlerSubmit} className="bg-slate-800 p-6 rounded-lg">
          <div className="flex justify-between mb-4">
            <div className="text-2xl">Modifier mes informations</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative mb-4">
              <label className="block mb-2">Prénom :</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={editInfo ? handleChange : undefined}
                readOnly={!editInfo}
                className="bg-gray-700 text-white p-2 rounded w-full"
              />
            </div>

            <div className="relative mb-4">
              <label className="block mb-2">Nom :</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={editInfo ? handleChange : undefined}
                readOnly={!editInfo}
                className="bg-gray-700 text-white p-2 rounded w-full"
              />
            </div>
          </div>

          <div className="relative mb-4">
            <label className="block mb-2">Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={editInfo ? handleChange : undefined}
              readOnly={!editInfo}
              className="bg-gray-700 text-white p-2 rounded w-full"
            />
          </div>

          <button
            type="submit"
            className="bg-orange-700 text-white py-2 px-8 rounded mt-4 hover:bg-orange-800"
            disabled={!editInfo}
          >
            Enregistrer
          </button>
        </form>

        <Password />
      </div>
    </>
  );
}
