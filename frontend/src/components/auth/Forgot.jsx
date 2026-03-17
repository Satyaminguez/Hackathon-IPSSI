import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserServices from "../../services/UserServices";
import Loader from "../Loader";
import { ShieldCheck, Mail, ArrowRight } from "lucide-react";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formValidate = () => {
    let valid = true;
    let error = "";

    if (!email.trim()) {
      error = "Veuillez entrer votre email.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      error = "L'email n'est pas valide.";
      valid = false;
    }

    setEmailError(error);
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden text-slate-300">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      
      {loading && <Loader />}

      <ToastContainer theme="dark" position="bottom-right" />

      <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
        <div className="text-center mb-10" />

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Mot de passe oublié</h2>
          <p className="text-slate-400 text-sm mb-6">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email Professionnel
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-950 border ${emailError ? 'border-red-500' : 'border-slate-800'} rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none`}
                  placeholder="admin@entreprise.com"
                />
              </div>
              {emailError && <p className="mt-1 text-xs text-red-500 font-medium">{emailError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-semibold py-3 rounded-md transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "..." : "Confirmer"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
              Avez-vous un compte ?{" "}
              <Link to="/login" className="text-teal-400 font-bold hover:text-teal-300 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-600 text-xs text-balance">
          &copy; 2024 DocSafe AI. Protection des données par chiffrement AES-256.
        </p>
      </div>
    </div>
  );
}
