import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import FileServices from "../../../services/FileServices";
import ErrorUser from "../Profile/ErrorUser";
import otherImage from "../../../assets/images/other.jpg";

export default function Folder() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fileService = new FileServices();

  const fetchFiles = async () => {
    try {
      const response = await fileService.getAllFiles();
      const formattedFiles = response.map((file) => ({
        id: file.id,
        name: file.name,
        size: parseFloat(file.size).toFixed(2),
        date: new Date(file.updatedAt).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        url: file.url,
      }));
      setFiles(formattedFiles);
    } catch (error) {
      // console.error("Erreur lors de la récupération des fichiers :", error);
      toast.error("Impossible de récupérer les fichiers.");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fileService.upload(formData);
      toast.success("Fichier uploadé avec succès !");
      fetchFiles();
    } catch (error) {
      toast.error("Erreur lors de l'upload du fichier.");
    }
  };

  const deleteFile = async (id) => {
    try {
      await fileService.delete(id);
      toast.success("Fichier supprimé avec succès !");
      fetchFiles();
    } catch (error) {
      toast.error("Erreur lors de la suppression du fichier.");
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= Math.ceil(files.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  const filteredFiles = files
    .filter((file) => file?.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      }
      return a[sortField] < b[sortField] ? 1 : -1;
    });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlerImageError = (e) => {
    e.target.src = otherImage;
  };

  return (
    <div className="flex flex-col bg-slate-900 text-white font-sans min-h-screen">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="border-b px-6 border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Rechercher un fichier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 text-white p-3 rounded w-1/3 placeholder-gray-500 focus:outline-none focus:ring focus:ring-blue-500"
          />
          <div className="flex space-x-4 items-center">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring focus:ring-blue-500"
            >
              <option value="name">Nom</option>
              <option value="size">Taille</option>
              <option value="date">Date</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded focus:outline-none focus:ring focus:ring-blue-500"
            >
              <option value="asc">Ascendant</option>
              <option value="desc">Descendant</option>
            </select>
            <label className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
              <input
                type="file"
                name="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              ⬆️ Uploader un fichier
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-lg font-bold mb-12">
          Mes fichiers ({files.length})
        </h2>

        {files.length === 0 ? (
          <ErrorUser>Vous n'avez aucun fichier</ErrorUser>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {paginatedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col relative group"
              >
                <a
                  href={file.url}
                  download={file.name}
                  className="absolute top-3 right-3 text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Télécharger"
                >
                  ⬇️
                </a>

                <button
                  className="absolute top-3 left-3 text-white bg-red-600 hover:bg-red-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => deleteFile(file.id)}
                  title="Supprimer"
                >
                  🗑️
                </button>

                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-52 object-cover"
                  onError={handlerImageError}
                />

                <div className="p-4">
                  <p className="font-semibold truncate">{file.name}</p>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">{file.size} MB</p>
                    <p className="text-sm text-gray-500">{file.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded"
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <span>
            Page {currentPage} sur{" "}
            {Math.ceil(filteredFiles.length / itemsPerPage)}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded"
            disabled={
              currentPage === Math.ceil(filteredFiles.length / itemsPerPage)
            }
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
