import React, { useState } from "react";
import Invoices from "./Invoices";
import PersonalInfo from "./PersonalInfo";

function Profile() {
  const [activeTab, setActiveTab] = useState("personalInfo");

  const renderTabContent = () => {
    switch (activeTab) {
      case "personalInfo":
        return <PersonalInfo />;
      case "invoices":
        return <Invoices />;
      default:
        return null;
    }
  };

  return (
    <div className="p-2 text-white h-full">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>

      <div className="flex space-x-4 border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("personalInfo")}
          className={`py-2 pr-2 ${
            activeTab === "personalInfo"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-gray-400"
          }`}
        >
          Mes informations personnelles
        </button>

        <button
          onClick={() => setActiveTab("invoices")}
          className={`py-2 pr-2 ${
            activeTab === "invoices"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-gray-400"
          }`}
        >
          Mes factures
        </button>
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
}

export default Profile;
