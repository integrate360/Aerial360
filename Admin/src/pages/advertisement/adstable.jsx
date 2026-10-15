import { useEffect, useState } from "react";
import { deleteAds, imageApi } from "../../Apis/ApiCalls";
import moment from "moment";
import ConfirmationModal from "../../layouts/ConfirmationModal";
import {
  Trash2,
  Image as ImageIcon,
  Calendar,
  FileText,
  Layers,
  AlertCircle,
  CheckCircle,
  Edit,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";

const AdsTable = ({ ads }) => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteAdName, setDeleteAdName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const rowsPerPage = 6;

  useEffect(() => {
    setRows(ads || []);
  }, [ads]);

  // Safe filter function
  const filteredAds = (rows || []).filter((ad) => {
    if (!ad) return false;

    const name = ad.name || "";
    const description = ad.description || "";
    const className = ad.class?.name || "";
    const search = searchText.toLowerCase();

    return (
      name.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search) ||
      className.toLowerCase().includes(search)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAds.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAds.slice(indexOfFirstRow, indexOfLastRow);

  const handleDeleteClick = (id, name) => {
    setSelectedId(id);
    setDeleteAdName(name);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const del = await deleteAds(selectedId);

      if (del?.status !== 200) {
        throw new Error("Failed to delete banner");
      }

      setRows((prevRows) => prevRows.filter((row) => row._id !== selectedId));
      toast.success("Banner deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      setError("Error deleting banner");
      toast.error("Failed to delete banner");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const TableHeader = ({ icon, label }) => (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </th>
  );

  // Helper function to get image URL
  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    return `${imageApi}${imageData}`;
  };

  if (filteredAds?.length === 0) {
    return (
      <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No banners found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchText
              ? "Try a different search term"
              : "Start by creating your first banner"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-hide rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <TableHeader
                  icon={<FileText className="w-4 h-4 text-blue-600" />}
                  label="Banner Name"
                />
                <TableHeader
                  icon={<Layers className="w-4 h-4 text-blue-600" />}
                  label="Class Category"
                />
                <TableHeader
                  icon={<ImageIcon className="w-4 h-4 text-blue-600" />}
                  label="Preview"
                />
                <TableHeader
                  icon={<FileText className="w-4 h-4 text-blue-600" />}
                  label="Description"
                />
                <TableHeader
                  icon={<Calendar className="w-4 h-4 text-blue-600" />}
                  label="Date"
                />
                <TableHeader
                  icon={<Calendar className="w-4 h-4 text-blue-600" />}
                  label="Actions"
                />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRows.map((row) => (
                <tr
                  key={row?._id || Math.random()}
                  className="hover:bg-blue-50/50 transition-colors duration-200"
                >
                  {/* Banner Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col justify-center h-full">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {row?.name || "Unnamed Banner"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Class Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col justify-center h-full">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-100">
                        {row?.class?.name || "General"}
                      </span>
                    </div>
                  </td>

                  {/* Preview */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col justify-center h-full">
                      <div className="h-20 w-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        {row?.image ? (
                          <img
                            src={getImageUrl(row.image)}
                            alt={row?.name || "Banner"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/128x80/f3f4f6/9ca3af?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon className="w-8 h-8 mb-1" />
                            <span className="text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col justify-center h-full">
                      <span className="text-sm text-gray-800 max-w-xs truncate">
                        {row?.description || "No description provided"}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col justify-center h-full">
                      <span className="text-sm font-medium text-gray-800">
                        {row?.createdAt
                          ? moment(row.createdAt).format("DD-MM-YYYY")
                          : "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {row?.createdAt
                          ? moment(row.createdAt).format("hh:mm A")
                          : ""}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteClick(row?._id, row?.name)}
                        className={`p-2 hover:bg-red-50 rounded-lg transition-colors ${error && selectedId === row?._id ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
                        title="Delete Banner"
                      >
                        {error && selectedId === row?._id ? (
                          <span className="text-xs font-medium">{error}</span>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 md:px-6 py-4 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div className="text-sm text-gray-600 text-center md:text-left">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, filteredAds?.length)} of{" "}
            {filteredAds?.length} banners
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Page Numbers - Responsive */}
            <div className="flex items-center justify-center gap-1 order-2 sm:order-1">
              {/* Prev Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* MOBILE (3 pages) */}
              <div className="flex sm:hidden items-center gap-1 overflow-x-auto max-w-[200px] px-2">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;

                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] px-2 py-1.5 rounded-lg transition-colors text-sm ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* DESKTOP (5 pages) */}
              <div className="hidden sm:flex items-center gap-1 px-0">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] px-2 py-1.5 rounded-lg transition-colors text-sm ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Page Info - For mobile only */}
            <div className="text-sm text-gray-600 text-center order-1 sm:order-2 sm:hidden">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Banner"
        message={`Are you sure you want to delete "${deleteAdName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default AdsTable;
