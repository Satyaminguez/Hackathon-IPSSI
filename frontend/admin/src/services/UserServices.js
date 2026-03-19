const API_URL = "http://localhost:8000";

export default class UserServices {
  // Espace de nom Admin : on utilise exclusivement 'token2'
  _getToken() {
    const token = localStorage.getItem("token2");
    if (!token || token === "undefined") return null;
    return token;
  }

  async login(formData) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: formData.email,
          password: formData.password
        }),
      });
      if (!response.ok) {
        throw new Error("Identifiants incorrects");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getUser() {
    const token = this._getToken();
    if (!token) throw new Error("Accès refusé : session admin expirée");

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Connexion système interrompue");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // --- Administration ---

  async adminGetDocuments() {
    const token = this._getToken();
    try {
      const response = await fetch(`${API_URL}/admin/documents`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Erreur récupération documents globaux");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async adminGetUsers() {
    const token = this._getToken();
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Accès admin refusé");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async adminGetUserDetails(email) {
    const token = this._getToken();
    try {
      const response = await fetch(`${API_URL}/admin/users/${email}/details`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Détails clients inaccessibles");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async adminUpdateDocStatus(docId, status, reason = null) {
    const token = this._getToken();
    try {
      const response = await fetch(`${API_URL}/admin/documents/${docId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, reason }),
      });
      if (!response.ok) throw new Error("Mise à jour statut impossible");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async adminDeleteDocument(docId) {
    const token = this._getToken();
    try {
      const response = await fetch(`${API_URL}/admin/documents/${docId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression du document");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async adminViewDocument(docId) {
    const token = this._getToken();
    try {
      const response = await fetch(`${API_URL}/admin/documents/${docId}/view`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Erreur lors de l'ouverture du document");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Optionnel : nettoyer l'URL après l'ouverture
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      throw error;
    }
  }

  async adminGetStats() {
    const token = this._getToken();
    try {
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Statistiques indisponibles");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
