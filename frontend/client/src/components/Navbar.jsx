import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [showProfile, setShowProfile] = useState(false);
    const [nottification, setNottification] = useState(false);

    const src =
        "https://images.pexels.com/photos/343717/pexels-photo-343717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

    return (
        <nav className="fixed w-full bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-b-slate-400">
            <Link to="/dashboard">
                <h1 className="text-teal-600 text-2xl font-bold">
                    <i className="fa-solid fa-file mx-1"></i>
                    Filemina
                </h1>
            </Link>

            <div className="flex items-center">
                <i
                    onClick={() => setNottification(true)}
                    className="fa-regular fa-bell text-xl text-white mx-2"
                ></i>

                <img
                    src={src}
                    onClick={() => setShowProfile(true)}
                    alt="Avatar"
                    className="w-8 h-8 object-cover rounded-full border-2 border-white mx-2"
                />
            </div>
        </nav>
    );
}
