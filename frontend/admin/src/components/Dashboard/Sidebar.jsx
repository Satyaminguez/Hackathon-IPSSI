import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  User, 
  ShieldCheck,
  LogOut,
  Database,
  Users
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../../store/authSlice";
import UserServices from "../../services/UserServices";

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const adminMenu = [
    { name: "Supervision", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Validation Documents", icon: <ShieldCheck size={20} />, path: "/dashboard/admin/ocr" },
    { name: "Data Lake", icon: <Database size={20} />, path: "/dashboard/admin/data-lake" },
    { name: "Gestion des Clients", icon: <Users size={20} />, path: "/dashboard/admin/clients" },
    { name: "Mon Profil", icon: <User size={20} />, path: "/dashboard/profile" },
  ];

  const handleLogout = async () => {
    const userServices = new UserServices();
    try {
      await userServices.logout();
      dispatch(clearUser());
      navigate("/login", { replace: true });
    } catch (error) {
      dispatch(clearUser());
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0B1120] border-r border-white/5 p-6 flex flex-col justify-between z-50">
      <div>
        <Link to="/dashboard" className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105">
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            DocSafe <span className="text-teal-500">Admin</span>
          </span>
        </Link>

        <nav>
          <ul className="space-y-1.5">
            {adminMenu.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link 
                    to={item.path}
                    className={`flex items-center space-x-3 cursor-pointer py-3 px-4 rounded-lg transition-all duration-300 group ${
                      isActive
                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/10 shadow-sm shadow-teal-500/5"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={`transition-all duration-300 ${isActive ? "text-teal-400 scale-110" : "text-slate-500 group-hover:text-slate-300"}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-4 text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-300 group border border-transparent hover:border-red-500/10"
        >
          <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-xs uppercase tracking-widest">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
