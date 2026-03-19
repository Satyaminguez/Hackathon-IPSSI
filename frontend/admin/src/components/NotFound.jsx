import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="h-fit flex flex-col mt-20 items-center text-slate-900">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-2xl mb-4">Oops! Page Not Found</p>
                <p className="mb-4 text-gray-400">
                    Sorry, the page you are looking for does not exist or has been moved.
                </p>
                <button
                    onClick={handleGoHome}
                    className="text-white bg-slate-800 hover:bg-slate-900 py-2 px-6 text-lg hove"
                >
                    Go to Homepage
                </button>
            </div>
        </div>
    );
}
