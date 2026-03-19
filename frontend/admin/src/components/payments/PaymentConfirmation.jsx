import React from "react";
import { Link } from "react-router-dom";

export default function PaymentConfirmation() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-bold mb-4 text-center text-green-600">
                    Paiement Confirmé
                </h1>
                <p className="text-lg text-gray-700 mb-6 text-center">
                    Votre paiement a été effectué avec succès. Merci pour votre
                    achat !
                </p>
                <div className="text-center">
                    <Link to="/dashboard" className="py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
                    Retourner à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
