import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import UserServices from "../../../services/UserServices";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "../../../store/authSlice";
import Loader from "../../Loader";

export default function Password() {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    let isValid = true;

    if (!password && !newPassword && !confirmPassword) {
      toast.error("Veuillez remplir tous les champs.");
      return false;
    }

    if (!password) {
      toast.error("Veuillez entrer votre mot de passe actuel.");
      isValid = false;
    }

    if (!newPassword) {
      toast.error("Veuillez entrer un nouveau mot de passe.");
      isValid = false;
    }

    if (!confirmPassword) {
      toast.error("Veuillez confirmer votre nouveau mot de passe.");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      toast.error("Le mot de passe de confirmation ne correspond pas.");
      isValid = false;
    }

    return isValid;
  };

  const handlerPassword = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formData = { password, newPassword };
      const userServices = new UserServices();

      setLoading(true);

      userServices
        .updatePassword(formData)
        .then(() => {
          setLoading(false);
          toast.success("Votre mot de passe a été modifié avec succès !");
          setPassword("");
          setNewPassword("");
          setConfirmPassword("");
        })
        .catch((error) => {
          toast.error(error.message || "Une erreur est survenue.");
          setLoading(false);
        });
    }
  };

  const handlerLogout = async (e) => {
    e.preventDefault();
    const userServices = new UserServices();

    try {
      await userServices.logout();
      dispatch(clearUser());
      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      alert(
        "Une erreur est survenue lors de la déconnexion. Veuillez réessayer."
      );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
      {loading && <Loader />}

      <div>
        <div className="mb-6">
          <p>
            Gérez vos fichiers en toute simplicité. Téléchargez, organisez et
            accédez à vos documents, images et vidéos à tout moment.
          </p>

          <button
            onClick={handlerLogout}
            className="bg-red-700 text-white py-2 px-8 rounded mt-4 hover:bg-red-800 hove"
          >
            Supprimer son compte
          </button>
        </div>

        <div className="mb-6">
          <p>
            Gérez vos fichiers en toute simplicité. Téléchargez, organisez et
            accédez à vos documents, images et vidéos à tout moment.
            Assurez-vous de ne jamais perdre vos données importantes grâce à
            notre plateforme sécurisée.
          </p>

          <button
            onClick={handlerLogout}
            className="bg-red-700 text-white py-2 px-8 rounded mt-4 hover:bg-red-800 hove"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <form className="bg-slate-800 p-6 rounded-lg" onSubmit={handlerPassword}>
        <div className="flex justify-between">
          <div className="text-2xl mb-4">Modifier le mot de passe</div>
        </div>

        <div className="relative mb-4">
          <label className="block mb-1">Mot de passe actuel :</label>
          <input
            type={showPassword ? "text" : "password"}
            name="currentPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`bg-gray-700 text-white p-2 rounded w-full ${
              errors.password ? "border-red-500 border" : ""
            }`}
          />
          <i
            className={
              showPassword
                ? "fa-regular fa-eye-slash i-auth"
                : "fa-regular fa-eye i-auth"
            }
            onClick={() => setShowPassword(!showPassword)}
          ></i>
        </div>

        <div className="relative mb-4">
          <label className="block mb-1">Nouveau mot de passe :</label>
          <input
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`bg-gray-700 text-white p-2 rounded w-full ${
              errors.newPassword ? "border-red-500 border" : ""
            }`}
          />
          <i
            className={
              showNewPassword
                ? "fa-regular fa-eye-slash i-auth"
                : "fa-regular fa-eye i-auth"
            }
            onClick={() => setShowNewPassword(!showNewPassword)}
          ></i>
        </div>

        <div className="relative mb-2">
          <label className="block mb-1">Confirmer nouveau mot de passe :</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`bg-gray-700 text-white p-2 rounded w-full ${
              errors.confirmPassword ? "border-red-500 border" : ""
            }`}
          />
          <i
            className={
              showConfirmPassword
                ? "fa-regular fa-eye-slash i-auth"
                : "fa-regular fa-eye i-auth"
            }
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          ></i>
        </div>

        <button
          type="submit"
          className="bg-orange-700 text-white py-2 px-8 rounded mt-4 hover:bg-orange-800 hove"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
