import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserServices from "../../services/UserServices";
import Loader from "../Loader";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formValidate = () => {
    let valid = true;
    let emailError = "";

    if (!email.trim()) {
      emailError = "Veuillez entrer votre email.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError = "L'email n'est pas valide.";
      valid = false;
    }

    setEmailError(emailError);
    return valid;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const formValid = formValidate();

    if (formValid) {
      const data = { email };
      setLoading(true);

      const userServices = new UserServices();
      await userServices
        .forgot(data)
        .then(() => {
          setLoading(false);
          navigate("/confirmation", {
            state: {
              title: "Réinitialisation de mot de passe",
              message:
                "Un email de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception.",
              redirectPath: "/",
            },
          });
        })
        .catch((error) => {
          toast.error(error.message);
          setLoading(false);
        });
    }
  }

  return (
    <div className="flex justify-center bg-gray-100 text-gray-600">
      {loading && <Loader />}

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="shadow bg-white p-6 rounded-lg mt-12 max-w-md w-full">
        <h1 className="font-bold text-xl md:text-2xl mb-4">Mot de passe oublié</h1>
        <p className="text-gray-500 mb-2">
          Entrez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
        </p>

        <div className="w-full rounded-lg divide-y divide-gray-200">
          <div className="pt-6 pb-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 text-sm border border-gray-300 focus:outline-none focus:border-slate-600 transition duration-200 ${
                    emailError ? "border-red-600 focus:border-red-500" : ""
                  }`}
                  placeholder="moncompte@gmail.com"
                />
                {emailError && (
                  <small className="text-red-600 text-xs">{emailError}</small>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-opacity-75 transition duration-200"
              >
                Confirmer
              </button>
            </form>
          </div>

          <div className="text-center py-5">
            <span className="text-gray-600">Pas de compte ? </span>
            <Link to="/register" className="text-slate-800 hover:underline">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
