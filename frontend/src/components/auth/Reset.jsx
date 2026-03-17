import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserServices from "../../services/UserServices";
import Loader from "../Loader";

export default function Reset() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      const userServices = new UserServices();
      userServices.verify(token).catch(() => {
        navigate("/notFound", { replace: true });
      });
    } else {
      navigate("/notFound", { replace: true });
    }
  }, [navigate, searchParams]);

  const formValidate = () => {
    let valid = true;
    let passwordError = "";
    let confirmPasswordError = "";

    if (!password.trim()) {
      passwordError = "Veuillez remplir votre mot de passe.";
      valid = false;
    }

    if (!confirmPassword.trim()) {
      confirmPasswordError = "Veuillez confirmer votre mot de passe.";
      valid = false;
    } else if (password !== confirmPassword) {
      passwordError = "Les mots de passe ne correspondent pas.";
      confirmPasswordError = "Les mots de passe ne correspondent pas.";
      valid = false;
    }

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });
    return valid;
  };

  async function handleSubmit(e) {
    const newPassword = password;
    e.preventDefault();
    const formValid = formValidate();

    if (formValid) {
      const data = { newPassword };
      const token = searchParams.get("token");

      if (!token) {
        toast.error("Le token est manquant ou invalide.");
        return;
      }

      try {
        setLoading(true);
        const userServices = new UserServices();

        await userServices.resetPassword(token, data).then((resolve) => {
          
        });

        toast.success("Mot de passe réinitialisé avec succès !");
        setLoading(false);
        navigate("/login", { replace: true });
      } catch (error) {
        setLoading(false);
        toast.error(error.message);
      }
    }
  }

  return (
    <div className="flex justify-center text-gray-600">
      {loading && <Loader />}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className="shadow bg-white p-4 mt-8 max-w-md sm:mx-4">
        <h1 className="font-bold text-xl md:text-2xl">
          Réinitialiser le mot de passe
        </h1>
        <p className="text-gray-500">
          Veuillez entrer et confirmer votre nouveau mot de passe
        </p>
        <div className="w-full rounded-lg divide-y divide-gray-200">
          <div className="pt-7 pb-3">
            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <label className="block text-sm font-semibold mb-2">
                  Mot de passe
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3 text-sm border border-gray-300 focus:outline-none focus:border-slate-600 transition duration-200 ${
                    errors.password ? "border-red-600 focus:border-red-500" : ""
                  }`}
                  placeholder="*********"
                />
                <i
                  className={`i-auth ${
                    showPassword
                      ? "fa-regular fa-eye-slash"
                      : "fa-regular fa-eye"
                  }`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
                {errors.password && (
                  <small className="text-red-600 text-xs">
                    {errors.password}
                  </small>
                )}
              </div>

              <div className="mb-4 relative">
                <label className="block text-sm font-semibold mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3 text-sm border border-gray-300 focus:outline-none focus:border-slate-600 transition duration-200 ${
                    errors.confirmPassword
                      ? "border-red-600 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="*********"
                />
                <i
                  className={`i-auth ${
                    showConfirmPassword
                      ? "fa-regular fa-eye-slash"
                      : "fa-regular fa-eye"
                  }`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
                {errors.confirmPassword && (
                  <small className="text-red-600 text-xs">
                    {errors.confirmPassword}
                  </small>
                )}
              </div>

              <div className="text-right mb-4">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-200"
                >
                  Réinitialiser le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}