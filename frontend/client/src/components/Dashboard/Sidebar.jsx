import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  ShieldCheck,
  LogOut,
  Database,
  Users
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser, logout as logoutAction } from "../../store/authSlice";
import UserServices from "../../services/UserServices";
import LogoutModal from "./LogoutModal";
import { useState } from "react";

export default function Sidebar() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const menuItems = [
    { name: "Tableau de bord", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Mes Fichiers", icon: <FileText size={20} />, path: "/dashboard/files" },
    { name: "Mon Profil", icon: <User size={20} />, path: "/dashboard/profile" },
  ];

  const handleLogoutConfirm = async () => {
    const userServices = new UserServices();
    try {
      await userServices.logout();
      dispatch(clearUser());
      setIsLogoutModalOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      // Fallback
      dispatch(clearUser());
      setIsLogoutModalOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between z-50 font-sans">
        <div>
          <Link to="/dashboard" className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              DocSafe AI
            </span>
          </Link>

          <nav>
            <ul className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={index}>
                    <Link 
                      to={item.path}
                      className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? "bg-teal-600/10 text-teal-400 border border-teal-600/20"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      } rounded-lg`}
                    >
                      <span className={`transition-colors duration-200 ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div>
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center space-x-3 p-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200 group border border-transparent hover:border-red-500/20 cursor-pointer"
          >
            <LogOut size={20} className="text-slate-500 group-hover:text-red-400 transition-colors" />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
