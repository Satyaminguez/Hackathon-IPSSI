import token from "../utils";

export default class InvoiceServices {
    async getAllInvoices() {
        try {
          const response = await fetch(`http://localhost:8088/api/invoice`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (!response.ok) {
            throw new Error("Ressource non trouvée");
          }
    
          const data = await response.json();
          return data;
        } catch (error) {
          console.error("Erreur lors de l'upload :", error);
          throw error;
        }
      }
}
