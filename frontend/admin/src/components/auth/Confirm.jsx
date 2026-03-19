import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import UserServices from "../../services/UserServices";

export default function Confirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      const userServices = new UserServices();

      userServices
        .verify(token)
        .then(() => {
          setTimeout(() => {
            // navigate("/dashboard", { replace: true });
            window.location.href = "/dashboard";
          }, 4000);
        })
        .catch(() => {
          navigate("/notFound", { replace: true });
        });
    } else {
      navigate("/notFound", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center bg-gray-100 mt-12 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div className="flex items-center mx-auto justify-center mb-4 w-min border border-slate-300">
          <svg
            className="w-16 h-16 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Email vérifié avec succès !
        </h2>
        
        <p className="text-lg text-gray-600 mb-6">
          Vous serez redirigé vers le tableau de bord dans quelques instants.
        </p>
        
        <div className="animate-pulse text-gray-500 text-lg">
          Redirection en cours...
        </div>
      </div>
    </div>
  );
}




