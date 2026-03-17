import token from "../utils";

export default class UserServices {
  async login(formData) {
    try {
      const response = await fetch(`http://localhost:8088/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        if (response.status === 403)
          throw new Error("Vérifier votre comptes avant de vous connecter");
        if (response.status === 401)
          throw new Error("Votre email ou mot de passe incorrecte");
        if (response.status === 404) throw new Error("Ressource non trouvée");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(formData) {
    try {
      const response = await fetch(`http://localhost:8088/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Cet email est déjà associé à un compte.");
        if (response.status === 404) throw new Error("Ressource non trouvée");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`http://localhost:8088/api/auth/logout`, {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la déconnexion.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUser() {
    try {
      const response = await fetch("http://localhost:8088/api/auth/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Non authentifié.");
        if (response.status === 403) throw new Error("Accès refusé.");
        throw new Error(
          "Erreur lors de la récupération des informations utilisateur."
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async verify(token) {
    try {
      const response = await fetch(
        `http://localhost:8088/api/auth/verify?token=${token}`,
        {}
      );

      if (!response.ok) {
        if (response.status === 404) throw new Error(`Utilisateur non trouvé`);
        if (response.status === 401) throw new Error(`Votre code est invalide`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async forgot(formData) {
    try {
      const response = await fetch(
        `http://localhost:8088/api/auth/forget-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        if (response.status === 400) throw new Error(`Utilisateur non trouvé`);
        else if (response.status === 401)
          throw new Error(`Votre code est invalide`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token, formData) {

    try {
      const response = await fetch(
        `http://localhost:8088/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        if (response.status === 400) throw new Error(`Utilisateur non trouvé`);
        else if (response.status === 401)
          throw new Error(`Votre code est invalide`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateInfo(formData) {
    try {
      const response = await fetch(`http://localhost:8088/api/auth/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Ressource non trouvée");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(formData) {
    try {
      const response = await fetch(`http://localhost:8088/api/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error(`Mot de passe invalide`);
        if (response.status === 404) throw new Error(`Ressource non trouvée`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}
