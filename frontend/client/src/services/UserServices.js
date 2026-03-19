const API_URL = import.meta.env.VITE_API_URL;

export default class UserServices {
  async login({ email, password }) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Erreur de connexion");
    }

    return response.json();
  }

  async register(formData) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de l'inscription");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Erreur lors du logout API:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { message: "Déconnexion réussie" };
  }

  async getUser() {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Non authentifié.");
        throw new Error("Erreur de récupération du profil");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async forgot(formData) {
    try {
      const response = await fetch(`${API_URL}/auth/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la demande");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // --- Gestion Documentaire Client ---

  async uploadDocument(file, category) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await fetch(`${API_URL}/fournisseur/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Échec de l'upload");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getMyDocuments() {
    try {
      const response = await fetch(`${API_URL}/fournisseur/documents`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Impossible de récupérer les documents");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(docId) {
    try {
      const response = await fetch(`${API_URL}/fournisseur/documents/${docId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Échec de la suppression");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async viewDocument(docId) {
    try {
      const response = await fetch(`${API_URL}/fournisseur/documents/${docId}/view`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Impossible de charger le document");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Optionnel : libérer l'URL après un certain temps
      // setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      throw error;
    }
  }

  async getDashboardData() {
    try {
      const response = await fetch(`${API_URL}/fournisseur/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Erreur dashboard");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token, { newPassword }) {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erreur lors de la réinitialisation");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // --- Administration ---

  async adminGetUsers() {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async adminGetUserDetails(email) {
    try {
      const response = await fetch(`${API_URL}/admin/users/${email}/details`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Erreur détails client");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async adminUpdateDocStatus(docId, status) {
    try {
      const response = await fetch(`${API_URL}/admin/documents/${docId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Échec de la validation");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
