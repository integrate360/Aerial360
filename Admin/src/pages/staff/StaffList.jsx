import { useState, useEffect } from "react";
import moment from "moment";
import {
  createStaff,
  EditStaff,
  getStaff,
  deleteStaff,
} from "../../Apis/ApiCalls";
import {
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  User,
  Image as ImageIcon,
  FileText,
  Calendar,
  UploadCloud,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import ConfirmationModal from "../../layouts/ConfirmationModal";

// StaffList Component
const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    imagePreview: null,
  });
  const [edtFormData, setEditFormData] = useState({
    _id: "",
    name: "",
    description: "",
    image: "",
    imagePreview: null,
    currentImage: null,
  });
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteStaffName, setDeleteStaffName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const rowsPerPage = 6;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getStaff();
      if (res?.status !== 200) {
        throw new Error("Failed to fetch trainers");
      }
      setStaff(res?.data?.reverse() || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch trainers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Safe filter function
  const filteredStaff = (staff || []).filter((staffMember) => {
    if (!staffMember) return false;

    const name = staffMember.name || "";
    const description = staffMember.description || "";
    const search = searchText.toLowerCase();

    return (
      name.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStaff.slice(indexOfFirstRow, indexOfLastRow);

  const handleModalOpen = () => setOpenModal(true);
  const handleEditModalOpen = (staffData) => {
    setSelectedStaff(staffData);
    setEditFormData({
      _id: staffData._id,
      name: staffData.name,
      description: staffData.description,
      image: null,
      imagePreview: null,
      currentImage: staffData.image || null,
    });
    setEditModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData({
      name: "",
      description: "",
      image: null,
      imagePreview: null,
    });
  };

  const handleEditModalClose = () => {
    setEditModal(false);
    setSelectedStaff(null);
    if (edtFormData.imagePreview) {
      URL.revokeObjectURL(edtFormData.imagePreview);
    }
    setEditFormData({
      _id: "",
      name: "",
      description: "",
      image: null,
      imagePreview: null,
      currentImage: null,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image: file,
        imagePreview: previewUrl,
      });
    }
  };

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setEditFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: previewUrl,
      }));
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.image
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const create = await createStaff(formDataToSend);
      if (create.status !== 200) {
        throw new Error("Failed to create trainer");
      }

      handleModalClose();
      fetchData();
      toast.success("Trainer created successfully!");
    } catch (error) {
      console.error("Error creating trainer:", error);
      toast.error(error.message || "Failed to create trainer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!edtFormData.name.trim() || !edtFormData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", edtFormData.name.trim());
      formDataToSend.append("description", edtFormData.description.trim());

      if (edtFormData.image instanceof File) {
        formDataToSend.append("image", edtFormData.image);
      } else if (typeof edtFormData.image === "string" && edtFormData.image) {
        formDataToSend.append("image", edtFormData.image);
      }

      const response = await EditStaff(formDataToSend, edtFormData._id);
      if (response.status !== 200) {
        throw new Error("Failed to update trainer");
      }

      handleEditModalClose();
      fetchData();
      toast.success("Trainer updated successfully!");
    } catch (error) {
      console.error("Error updating trainer:", error);
      toast.error(error.message || "Failed to update trainer");
    } finally {
      setLoading(false);
    }
  };

  // Delete functions
  const handleDeleteClick = (id, name) => {
    setSelectedId(id);
    setDeleteStaffName(name);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const del = await deleteStaff(selectedId);

      if (del?.status !== 200) {
        throw new Error("Failed to delete trainer");
      }

      setStaff((prevStaff) =>
        prevStaff.filter((staff) => staff._id !== selectedId),
      );
      toast.success("Trainer deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete trainer");
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

    if (typeof imageData === "string") {
      if (imageData.startsWith("http")) {
        return imageData;
      }
      return `${window.location.origin}/uploads/${imageData}`;
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Trainers
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your fitness trainers
              </p>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search trainers..."
                  value={searchText}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full sm:w-64"
                />
              </div>

              <button
                onClick={handleModalOpen}
                className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center sm:justify-start"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Trainer</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="p-2">
          <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto scrollbar-hide rounded-xl shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <tr>
                    <TableHeader
                      icon={<User className="w-4 h-4 text-blue-600" />}
                      label="Trainer"
                    />
                    <TableHeader
                      icon={<ImageIcon className="w-4 h-4 text-blue-600" />}
                      label="Image"
                    />
                    <TableHeader
                      icon={<FileText className="w-4 h-4 text-blue-600" />}
                      label="Description"
                    />
                    <TableHeader
                      icon={<Calendar className="w-4 h-4 text-blue-600" />}
                      label="Joined Date"
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
                      {/* Trainer Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col justify-center h-full">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              {row?.name || "Unnamed Trainer"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col justify-center h-full">
                          <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <img
                              src={
                                getImageUrl(row?.image) ||
                                "https://via.placeholder.com/80x80?text=No+Image"
                              }
                              alt={row?.name || "Trainer"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80x80?text=No+Image";
                              }}
                            />
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

                      {/* Joined Date */}
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
                            onClick={() => handleEditModalOpen(row)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                            title="Edit Trainer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteClick(row?._id, row?.name)
                            }
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                            title="Delete Trainer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {currentRows.length === 0 && (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No trainers found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchText
                      ? "Try a different search term"
                      : "Start by adding a new trainer"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 md:px-6 py-4 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div className="text-sm text-gray-600 text-center md:text-left">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, filteredStaff?.length)} of{" "}
            {filteredStaff?.length} trainers
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

      {/* Add Trainer Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleModalClose}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
              <div className="flex justify-between items-center p-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Add New Trainer
                </h2>
                <button
                  onClick={handleModalClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trainer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter trainer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter trainer description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image <span className="text-red-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {formData.imagePreview ? (
                      <div className="text-center">
                        <CheckCircle
                          className="mx-auto text-green-500 mb-2"
                          size={24}
                        />
                        <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                          {formData.image?.name}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-blue-600">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>

                {/* Image Preview */}
                {formData.imagePreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="h-32 w-32 rounded-full overflow-hidden border border-gray-300 bg-gray-50">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !formData.name.trim() ||
                    !formData.description.trim() ||
                    !formData.image
                  }
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create Trainer</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trainer Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleEditModalClose}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
              <div className="flex justify-between items-center p-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Trainer
                </h2>
                <button
                  onClick={handleEditModalClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Current Image */}
              {edtFormData.currentImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Image
                  </label>
                  <div className="h-32 w-32 rounded-full overflow-hidden border border-gray-300 bg-gray-50">
                    <img
                      src={getImageUrl(edtFormData.currentImage)}
                      alt="Current"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/128x128?text=No+Image";
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trainer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={edtFormData.name}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter trainer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={edtFormData.description}
                  onChange={handleEditFormChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter trainer description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Image (Optional)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {edtFormData.imagePreview ? (
                      <div className="text-center">
                        <CheckCircle
                          className="mx-auto text-green-500 mb-2"
                          size={24}
                        />
                        <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                          {edtFormData.image?.name}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-blue-600">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleEditFileChange}
                  />
                </label>

                {/* New Image Preview */}
                {edtFormData.imagePreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      New Image Preview:
                    </p>
                    <div className="h-32 w-32 rounded-full overflow-hidden border border-gray-300 bg-gray-50">
                      <img
                        src={edtFormData.imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleEditModalClose}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={
                    loading ||
                    !edtFormData.name.trim() ||
                    !edtFormData.description.trim()
                  }
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>Update Trainer</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Trainer"
        message={`Are you sure you want to delete trainer "${deleteStaffName}"? This action cannot be undone.`}
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
    </div>
  );
};

export default StaffList;
