import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, message, redirectPath } = location.state || {
    title: "Confirmation",
    message: "Action réussie.",
    redirectPath: "/",
  };

  return (
    <div className="flex items-center justify-center mt-12 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <div className="flex items-center mx-auto justify-center mb-4 w-min border border-slate-300">
          <svg
            className="w-16 h-16 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">{title}</h1>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={() => navigate(redirectPath)}
          className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-4 rounded"
        >
          Retour à la page d'accueil
        </button>
      </div>
    </div>
  );
}
