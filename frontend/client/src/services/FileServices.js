import token from "../utils";

export default class FileServices {
  async upload(formData) {
    try {
      const response = await fetch(`http://localhost:8088/api/file/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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

  async getAllFiles() {
    try {
      const response = await fetch(`http://localhost:8088/api/file`, {
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

  async delete(id) {
    try {
      const response = await fetch(`http://localhost:8088/api/file/${id}`, {
        method: "DELETE",
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
