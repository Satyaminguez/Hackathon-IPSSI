import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  FileText, 
  ShieldCheck,
  Search,
  Bell,
  HelpCircle
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { name: "Tableau de bord", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "OCR & Classification", icon: <FileText size={20} />, path: "/dashboard/ocr" },
    { name: "Sécurité", icon: <ShieldCheck size={20} />, path: "/dashboard/security" },
    { name: "Profil", icon: <User size={20} />, path: "/dashboard/profile" },
    { name: "Paramètres", icon: <Settings size={20} />, path: "/dashboard/setting" },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between z-50">
      <div>
        <Link to="/dashboard" className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
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
                    className={`flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-teal-600/10 text-teal-400 border border-teal-600/20 shadow-[0_0_20px_rgba(20,184,166,0.05)]"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
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
    </aside>
  );
}
