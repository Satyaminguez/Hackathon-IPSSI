import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserServices from "../../services/UserServices";
import Loader from "../Loader";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";

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

        await userServices.resetPassword(token, data);

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden text-slate-300">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      
      {loading && <Loader />}
      <ToastContainer theme="dark" position="bottom-right" />

      <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
        <div className="text-center mb-10" />

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Nouveau mot de passe</h2>
          <p className="text-slate-400 text-sm mb-6">
            Définissez votre nouvelle clé d'accès sécurisée.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Nouveau mot de passe
              </label>
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

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-800'} rounded-md py-3 pl-10 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-white font-bold py-3.5 rounded-md transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? "..." : "Réinitialiser"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-600 text-xs text-balance">
          &copy; 2026 DocSafe AI. Sécurité de niveau entreprise. ISO 27001 compliant.
        </p>
      </div>
    </div>
  );
}