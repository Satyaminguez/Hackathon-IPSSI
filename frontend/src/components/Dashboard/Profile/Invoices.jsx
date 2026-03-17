import React, { useState, useEffect } from "react";
import InvoiceServices from "../../../services/InvoiceServices";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const invoiceServices = new InvoiceServices();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await invoiceServices.getAllInvoices();
        const formattedInvoices = response.map((invoice) => ({
          id: invoice.invoice_id,
          title: invoice.title || "Facture",
          date: new Date(invoice.created_at).toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
          }),
          amount: `${invoice.amount}€`,
          url: invoice.url,
        }));
        setInvoices(formattedInvoices);
        console.log(invoices);
      } catch (error) {
        console.error("Erreur lors de la récupération des factures :", error);
      }
    };

    fetchInvoices();
  }, []);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    setInvoices((prevInvoices) =>
      [...prevInvoices].sort((a, b) => {
        if (order === "asc") {
          return a[field] > b[field] ? 1 : -1;
        }
        return a[field] < b[field] ? 1 : -1;
      })
    );
  };

  return (
    <div className="h-screen">
      <h2 className="text-xl font-semibold mb-4">
        Mes factures ({invoices.length})
      </h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th
              className="border-b border-gray-700 py-2 pr-2 cursor-pointer"
              onClick={() => handleSort("id")}
            >
              Numéro {sortField === "id" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
            </th>
            <th
              className="border-b border-gray-700 py-2 pr-2 cursor-pointer"
              onClick={() => handleSort("title")}
            >
              Intitulé{" "}
              {sortField === "title" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
            </th>
            <th className="border-b border-gray-700 py-2 pr-2">Montant</th>
            <th
              className="border-b border-gray-700 py-2 pr-2 cursor-pointer"
              onClick={() => handleSort("date")}
            >
              Date {sortField === "date" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
            </th>
            <th className="border-b border-gray-700 py-2 pr-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-gray-800">
              <td className="py-2 pr-2">{invoice.id}</td>
              <td className="py-2 pr-2">{invoice.title}</td>
              <td className="py-2 pr-2">{invoice.amount}</td>
              <td className="py-2 pr-2">{invoice.date}</td>
              <td className="py-2 pr-2">
                <a
                  href={invoice.invoiceLink}
                  download
                  className="bg-orange-600 text-white py-1 px-3 rounded hover:bg-orange-700"
                >
                  Télécharger
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
