import React from "react";

export default function Loader() {
    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <span className="loader"></span>
        </div>
    );
}
