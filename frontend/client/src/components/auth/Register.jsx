import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserServices from "../../services/UserServices";
import Loader from "../Loader";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, User, Building, ArrowRight } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    prenom: "",
    nom: "",
    entreprise: "",
    email: "",
    password: "",
  });

  const formValidate = () => {
    let valid = true;
    const newErrors = {
      prenom: "",
      nom: "",
      entreprise: "",
      email: "",
      password: "",
    };

    if (!prenom.trim()) {
      newErrors.prenom = "Veuillez remplir votre prénom.";
      valid = false;
    }

    if (!nom.trim()) {
      newErrors.nom = "Veuillez remplir votre nom.";
      valid = false;
    }

    if (!entreprise.trim()) {
      newErrors.entreprise = "Veuillez remplir le nom de l'entreprise.";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Veuillez remplir votre email.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "L'email n'est pas valide.";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Veuillez remplir votre mot de passe.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  async function handlerSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!formValidate()) {
      setLoading(false);
      return;
    }

    // Mapping vers le modèle UserCreate du backend
    const data = { 
      prenom, 
      nom, 
      nom_entreprise: entreprise, 
      email, 
      password,
      role: "user" 
    };

    const userServices = new UserServices();
    try {
      await userServices.register(data);
      setLoading(false);
      toast.success("Inscription réussie !");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      
      {loading && <Loader />}

      <ToastContainer theme="dark" position="bottom-right" />

      <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-center text-white mb-6">Créer un Compte</h2>
          
          <form onSubmit={handlerSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Prénom
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className={`w-full bg-slate-950 border ${errors.prenom ? 'border-red-500' : 'border-slate-800'} rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none`}
                    placeholder="John"
                  />
                </div>
                {errors.prenom && <p className="mt-1 text-xs text-red-500 font-medium">{errors.prenom}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Nom
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className={`w-full bg-slate-950 border ${errors.nom ? 'border-red-500' : 'border-slate-800'} rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none`}
                    placeholder="Doe"
                  />
                </div>
                {errors.nom && <p className="mt-1 text-xs text-red-500 font-medium">{errors.nom}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Nom de l'Entreprise
              </label>
              <div className="relative group">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                <input
                  type="text"
                  value={entreprise}
                  onChange={(e) => setEntreprise(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.entreprise ? 'border-red-500' : 'border-slate-800'} rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none`}
                  placeholder="ACME Corp"
                />
              </div>
              {errors.entreprise && <p className="mt-1 text-xs text-red-500 font-medium">{errors.entreprise}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.email ? 'border-red-500' : 'border-slate-800'} rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none`}
                  placeholder="contact@entreprise.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.password ? 'border-red-500' : 'border-slate-800'} rounded-md py-3 pl-10 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none`}
                  placeholder="Minimum 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-semibold py-3 rounded-md transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "..." : "S'inscrire"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
              Déjà membre ?{" "}
              <Link to="/login" className="text-teal-400 font-bold hover:text-teal-300 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-6 text-center text-slate-600 text-[10px] leading-relaxed max-w-sm mx-auto">
          &copy; 2026 DocSafe AI. Sécurité de grade militaire.
        </p>
      </div>
    </div>
  );
}
