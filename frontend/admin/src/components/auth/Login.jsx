import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Loader";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const formValidate = () => {
    let valid = true;
    let emailError = "";
    let passwordError = "";

    if (!email.trim()) {
      emailError = "Veuillez remplir votre email.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError = "L'email n'est pas valide.";
      valid = false;
    }

    if (!password.trim()) {
      passwordError = "Veuillez remplir votre mot de passe.";
      valid = false;
    }

    setErrors({ email: emailError, password: passwordError });
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formValid = formValidate();

    if (formValid) {
      dispatch(login({ email, password }))
        .unwrap()
        .then((response) => {
          const token = response.token;
          localStorage.setItem("token", token);
          toast.success("Connexion réussie ! Bienvenue sur DocSafe AI.");
          navigate("/dashboard", { replace: true });
        })
        .catch((err) => {
          toast.error(err);
        });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      
      {loading && <Loader />}

      <ToastContainer theme="dark" position="bottom-right" />

      <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
        <div className="text-center mb-10" />

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Connexion Entreprise</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.email ? 'border-red-500' : 'border-slate-800'} rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none`}
                  placeholder="admin@entreprise.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mot de passe
                </label>
                <Link to="/forgot" className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.password ? 'border-red-500' : 'border-slate-800'} rounded-md py-3 pl-10 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none`}
                  placeholder="••••••••"
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
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-white font-semibold py-3 rounded-md transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
              Nouveau client ?{" "}
              <Link to="/register" className="text-orange-400 font-bold hover:text-orange-300 transition-colors">
                Créer son compte
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-600 text-xs">
          &copy; 2026 DocSafe AI. Sécurité de grade militaire.
        </p>
      </div>
    </div>
  );
}
