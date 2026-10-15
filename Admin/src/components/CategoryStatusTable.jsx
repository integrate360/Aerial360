import { useEffect, useState } from "react";
import moment from "moment";
import {
  Trash2,
  Edit,
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Calendar,
} from "lucide-react";
import ConfirmationModal from "../layouts/ConfirmationModal";
import { toast } from "react-toastify";
import {
  createCategories,
  deleteCategory,
  EditCategory,
} from "../Apis/ApiCalls";

const CategoryStatusTable = ({ cats, onCategoryAdded }) => {
  const [rows, setRows] = useState(cats || []);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    image: null,
    imagePreview: null,
    currentImage: null,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    description: "",
    image: null,
    imagePreview: null,
  });
  const rowsPerPage = 10;

  useEffect(() => {
    setRows(cats || []);
  }, [cats]);

  // Safe filter function to handle undefined properties
  const filteredCategories = (rows || []).filter((category) => {
    if (!category) return false;

    const title = category.title || "";
    const description = category.description || "";
    const search = searchText.toLowerCase();

    return (
      title.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredCategories.slice(indexOfFirstRow, indexOfLastRow);

  const handleDeleteClick = (id) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const del = await deleteCategory(categoryToDelete);
      if (del?.status !== 200) {
        throw new Error("Failed to delete category");
      }
      setRows((prevRows) =>
        (prevRows || []).filter((row) => row?._id !== categoryToDelete),
      );
      toast.success("Category deleted successfully!");
      setShowDeleteModal(false);
      setCategoryToDelete(null);

      // Refresh the category list
      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (error) {
      setError("Error deleting category");
      toast.error("Failed to delete category");
      setTimeout(() => setError(""), 2000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = async (id) => {
    try {
      setSelectedId(id);
      const category = (rows || []).find((row) => row?._id === id);
      if (category) {
        setEditFormData({
          title: category.title || "",
          description: category.description || "",
          image: null,
          imagePreview: null,
          currentImage: category.image,
        });
      }
      setEditModal(true);
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching category details");
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  };

  const handleEditModalClose = () => {
    setEditModal(false);
    setEditFormData({
      title: "",
      description: "",
      image: null,
      imagePreview: null,
      currentImage: null,
    });
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setEditFormData((prevData) => ({
        ...prevData,
        image: file,
        imagePreview: previewUrl,
      }));
    }
  };

  const handleEdit = async () => {
    try {
      if (!editFormData.title.trim() || !editFormData.description.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsEditing(true);
      const formData = new FormData();

      // Append data to FormData
      formData.append("title", editFormData.title.trim());
      formData.append("description", editFormData.description.trim());

      // Only append image if a new one was selected
      if (editFormData.image) {
        formData.append("image", editFormData.image);
      }

      console.log("Updating category:", selectedId, {
        title: editFormData.title,
        description: editFormData.description,
        hasNewImage: !!editFormData.image,
      });

      // Make sure we're passing id first, then formData
      const response = await EditCategory(formData, selectedId);

      if (response?.status !== 200) {
        throw new Error(response?.error || "Failed to update category");
      }

      // Update local state with response data
      const updatedRows = (rows || []).map((row) =>
        row?._id === selectedId ? { ...row, ...response.data } : row,
      );
      setRows(updatedRows);

      // Clean up preview URL
      if (editFormData.imagePreview) {
        URL.revokeObjectURL(editFormData.imagePreview);
      }

      handleEditModalClose();
      toast.success("Category updated successfully!");

      // Refresh the category list
      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (error) {
      console.error("Edit error:", error);
      setError("An error occurred while editing the category");
      toast.error(error.message || "Failed to update category");
      setTimeout(() => {
        setError("");
      }, 2000);
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddModalOpen = () => {
    setAddModal(true);
  };

  const handleAddModalClose = () => {
    setAddModal(false);
    // Clean up preview URL
    if (addFormData.imagePreview) {
      URL.revokeObjectURL(addFormData.imagePreview);
    }
    setAddFormData({
      title: "",
      description: "",
      image: null,
      imagePreview: null,
    });
  };

  const handleAddFormChange = (event) => {
    const { name, value } = event.target;
    setAddFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setAddFormData((prevData) => ({
        ...prevData,
        image: file,
        imagePreview: previewUrl,
      }));
    }
  };

  const handleAddCategory = async () => {
    try {
      if (
        !addFormData.title.trim() ||
        !addFormData.description.trim() ||
        !addFormData.image
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsEditing(true);
      const formData = new FormData();

      // Append data to FormData
      formData.append("title", addFormData.title.trim());
      formData.append("description", addFormData.description.trim());
      formData.append("image", addFormData.image);

      console.log("Creating category:", {
        title: addFormData.title,
        description: addFormData.description,
        imageName: addFormData.image.name,
      });

      const response = await createCategories(formData);

      if (response?.status !== 200 && response?.status !== 201) {
        throw new Error(response?.error || "Failed to add category");
      }

      // Refresh the category list
      if (onCategoryAdded) {
        onCategoryAdded();
      }

      // Clean up preview URL
      if (addFormData.imagePreview) {
        URL.revokeObjectURL(addFormData.imagePreview);
      }

      handleAddModalClose();
      toast.success("Category added successfully!");
    } catch (error) {
      console.error("Add error:", error);
      setError("An error occurred while adding the category");
      toast.error(error.message || "Failed to add category");
      setTimeout(() => {
        setError("");
      }, 2000);
    } finally {
      setIsEditing(false);
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

    // If it's already a full URL, return it
    if (typeof imageData === "string") {
      // Check if it's a full URL or just a filename
      if (imageData.startsWith("http")) {
        return imageData;
      }
      // If it's just a filename/path, construct the URL
      // Adjust this based on your server setup
      return `${window.location.origin}/uploads/${imageData}`;
    }

    return null;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="w-full md:w-auto">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Categories
                </h1>
              </div>

              {/* Search and Add Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by title or description"
                    value={searchText}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full sm:w-64"
                  />
                </div>

                <button
                  onClick={handleAddModalOpen}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Category</span>
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
                        icon={<FileText className="w-4 h-4 text-blue-600" />}
                        label="Title"
                      />
                      <TableHeader
                        icon={<Image className="w-4 h-4 text-blue-600" />}
                        label="Image"
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
                        {/* Title */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <span className="text-sm font-medium text-gray-800">
                              {row?.title || "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Image */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                              <img
                                src={
                                  getImageUrl(row?.image) ||
                                  "https://via.placeholder.com/80x80?text=No+Image"
                                }
                                alt={row?.title || "Category"}
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
                              {row?.description || "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <span className="text-sm text-gray-800">
                              {row?.createdAt
                                ? moment(row.createdAt).format("DD-MM-YYYY")
                                : "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(row?._id)}
                              className={`p-2 hover:bg-blue-50 rounded-lg transition-colors ${error && selectedId === row?._id ? "text-red-600" : "text-gray-600 hover:text-blue-600"}`}
                              title="Edit Category"
                            >
                              {error && selectedId === row?._id ? (
                                <span className="text-xs font-medium">
                                  {error}
                                </span>
                              ) : (
                                <Edit className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteClick(row?._id)}
                              className={`p-2 hover:bg-red-50 rounded-lg transition-colors ${error && selectedId === row?._id ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
                              title="Delete Category"
                            >
                              {error && selectedId === row?._id ? (
                                <span className="text-xs font-medium">
                                  {error}
                                </span>
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

                {/* Empty State */}
                {currentRows.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No categories found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchText
                        ? "Try a different search term"
                        : "Start by adding a new category"}
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
              {Math.min(currentPage * rowsPerPage, filteredCategories?.length)}{" "}
              of {filteredCategories?.length} categories
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Page Numbers - Responsive */}
              <div className="flex items-center justify-center gap-1 order-2 sm:order-1">
                {/* Prev Button */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Category"
          message="Are you sure you want to delete this category? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isDeleting}
        />

        {/* Edit Modal */}
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
                    Edit Category
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Enter category title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />

                  {/* New Image Preview */}
                  {editFormData.imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        New Image Preview:
                      </p>
                      <div className="h-32 w-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
                        <img
                          src={editFormData.imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Current Image */}
                  {editFormData.currentImage && !editFormData.imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Current Image:
                      </p>
                      <div className="h-32 w-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
                        <img
                          src={getImageUrl(editFormData.currentImage)}
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
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleEditModalClose}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isEditing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={
                      isEditing ||
                      !editFormData.title.trim() ||
                      !editFormData.description.trim()
                    }
                    className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>Update</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleAddModalClose}
            />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
                <div className="flex justify-between items-center p-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Add New Category
                  </h2>
                  <button
                    onClick={handleAddModalClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={addFormData.title}
                    onChange={handleAddFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Enter category title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={addFormData.description}
                    onChange={handleAddFormChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddImageChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />

                  {/* Image Preview */}
                  {addFormData.imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="h-32 w-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
                        <img
                          src={addFormData.imagePreview}
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
                    onClick={handleAddModalClose}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isEditing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={
                      isEditing ||
                      !addFormData.title.trim() ||
                      !addFormData.description.trim() ||
                      !addFormData.image
                    }
                    className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>Create</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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

export default CategoryStatusTable;
