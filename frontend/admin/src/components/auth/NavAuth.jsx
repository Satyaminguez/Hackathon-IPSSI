import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function NavAuth() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-6 bg-transparent">
      <div className="max-w-7xl mx-auto flex justify-center">
        <Link to="/" className="flex items-center gap-2 group transition-all">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">DocSafe AI</span>
        </Link>
      </div>
    </nav>
  );
}
