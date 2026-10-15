import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  signup,
  getAllUsersForAdmin,
  deleteUser,
  updateUser,
} from "../Apis/ApiCalls";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  Calendar,
  User,
  Trash2,
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  Phone,
  Mail,
  Edit,
  GalleryHorizontal,
  Loader2,
} from "lucide-react";
import ConfirmationModal from "../layouts/ConfirmationModal";

// User Table Component
const UserTable = ({
  users,
  searchText,
  onUserAdded,
  currentPage,
  setCurrentPage,
  totalPages,
  totalUsers,
  onEditUser,
  onPageChange,
}) => {
  const [rows, setRows] = useState(users);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setRows(users);
  }, [users]);

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const handleEditClick = (user) => {
    onEditUser(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const del = await deleteUser(userToDelete);
      if (del?.status !== 200) {
        throw new Error("Failed to delete user");
      }
      setRows((prevRows) => prevRows.filter((row) => row._id !== userToDelete));
      toast.success("User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
      // Refresh data after deletion
      onPageChange(currentPage);
    } catch (error) {
      setError("Error deleting user");
      toast.error("Failed to delete user");
      setTimeout(() => setError(""), 2000);
    } finally {
      setIsDeleting(false);
    }
  };

  const TableHeader = ({ icon, label }) => (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </th>
  );

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalUsers);

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide rounded-xl shadow-sm border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <TableHeader
                icon={<GalleryHorizontal className="w-4 h-4 text-blue-600" />}
                label="Profile Image"
              />
              <TableHeader
                icon={<User className="w-4 h-4 text-blue-600" />}
                label="Name"
              />
              <TableHeader
                icon={<Mail className="w-4 h-4 text-blue-600" />}
                label="Email"
              />
              <TableHeader
                icon={<Phone className="w-4 h-4 text-blue-600" />}
                label="Phone"
              />
              <TableHeader
                icon={<Phone className="w-4 h-4 text-blue-600" />}
                label="Emergency Phone"
              />
              <TableHeader
                icon={<Calendar className="w-4 h-4 text-blue-600" />}
                label="Actions"
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-blue-50/50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center h-full">
                    <img
                      src={user.image ? user.image : "/airbound.png"}
                      alt={user.name || "User Image"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col justify-center h-full">
                    <span className="text-sm font-medium text-gray-800">
                      {user.name || "N/A"}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col justify-center h-full">
                    <span className="text-sm text-gray-800">
                      {user.email || "N/A"}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col justify-center h-full">
                    <span className="text-sm text-gray-800">
                      {user.phone || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col justify-center h-full">
                    <span className="text-sm text-gray-800">
                      {user.emergencyPhone || "N/A"}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user._id)}
                      className={`p-2 hover:bg-red-50 rounded-lg transition-colors ${error && user._id === selectedId ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
                      title="Delete User"
                    >
                      {error && user._id === selectedId ? (
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

        {rows.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchText
                ? "Try a different search term"
                : "Start by adding a new user"}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 md:px-6 py-4 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div className="text-sm text-gray-600 text-center md:text-left">
            Showing {startIndex} to {endIndex} of {totalUsers} users
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center justify-center gap-1 order-2 sm:order-1">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  onPageChange(1);
                }}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="First page"
              >
                «
              </button>
              <button
                onClick={() => {
                  const newPage = Math.max(currentPage - 1, 1);
                  setCurrentPage(newPage);
                  onPageChange(newPage);
                }}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

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
                      onClick={() => {
                        setCurrentPage(pageNum);
                        onPageChange(pageNum);
                      }}
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
                      onClick={() => {
                        setCurrentPage(pageNum);
                        onPageChange(pageNum);
                      }}
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

              <button
                onClick={() => {
                  const newPage = Math.min(currentPage + 1, totalPages);
                  setCurrentPage(newPage);
                  onPageChange(newPage);
                }}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentPage(totalPages);
                  onPageChange(totalPages);
                }}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Last page"
              >
                »
              </button>
            </div>

            <div className="text-sm text-gray-600 text-center order-1 sm:order-2 sm:hidden">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
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

// Password Input Component (stable - won't lose focus)
const PasswordInput = React.memo(
  ({
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    label,
    required = true,
    showPassword,
    onToggleVisibility,
    inputRef,
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-gray-500">(Optional)</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={placeholder}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  ),
);

// Main User List Component
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    emergencyPhone: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchDebounce, setSearchDebounce] = useState(null);
  // Create refs for inputs
  const searchInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const validateField = useCallback(
    (name, value, isEditMode = isEditing) => {
      const trimmedValue = value.trim();

      switch (name) {
        case "name":
          if (!trimmedValue) return "Full Name is required";
          if (trimmedValue.length < 3)
            return "Full Name must be at least 3 characters";
          return "";

        case "email":
          if (!trimmedValue) return "Email is required";
          if (!/\S+@\S+\.\S+/.test(trimmedValue.toLowerCase()))
            return "Enter a valid email";
          return "";

        case "phone":
          if (!trimmedValue) return "Phone Number is required";
          if (!/^\d{10}$/.test(trimmedValue))
            return "Phone Number must be 10 digits";
          return "";

        case "password":
          if (!isEditMode && !trimmedValue) return "Password is required";
          if (!isEditMode && trimmedValue && trimmedValue.length < 6)
            return "Password must be at least 6 characters";
          return "";

        case "confirmPassword":
          if (!isEditMode && value !== formData.password)
            return "Passwords do not match";
          if (isEditMode && formData.password && value !== formData.password)
            return "Passwords do not match";
          return "";

        case "emergencyPhone":
          if (trimmedValue && !/^\d{10}$/.test(trimmedValue))
            return "Emergency Phone must be 10 digits";
          return "";

        default:
          return "";
      }
    },
    [formData.password, isEditing],
  );

  const validateAllFields = useCallback(() => {
    const errors = {};
    let isValid = true;

    const requiredFields = isEditing
      ? ["name", "email", "phone"]
      : ["name", "email", "phone", "password", "confirmPassword"];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    if (formData.emergencyPhone) {
      const emergencyPhoneError = validateField(
        "emergencyPhone",
        formData.emergencyPhone,
      );
      if (emergencyPhoneError) {
        errors.emergencyPhone = emergencyPhoneError;
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  }, [formData, isEditing, validateField]);

  const handleFieldChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [formErrors],
  );

  const handleFieldBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      const error = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const fetchData = async (
    page = currentPage,
    search = searchText,
    showLoader = true,
  ) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      // Pass page and search parameters to the API
      const res = await getAllUsersForAdmin(page, search);
      console.log(res);
      if (res) {
        const userData = res.data.users || [];
        setUsers(userData);
        setTotalUsers(res.data.totalUsers || 0);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.page || 1);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("An error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Prevent autofill on all inputs
    const preventAutofill = () => {
      const inputs = document.querySelectorAll(
        'input[name]:not([type="hidden"])',
      );
      inputs.forEach((input) => {
        input.setAttribute("autocomplete", "off");
        input.setAttribute("autocorrect", "off");
        input.setAttribute("autocapitalize", "off");
        input.setAttribute("spellcheck", "false");
      });
    };

    // Run immediately and after a short delay
    preventAutofill();
    setTimeout(preventAutofill, 100);
  }, []);

  // Handle search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setCurrentPage(1);

    // Clear previous timeout
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      fetchData(1, value, false);
    }, 500);

    setSearchDebounce(timeout);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page, searchText, false);
  };

  const handleModalOpen = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      emergencyPhone: "",
    });
    setFormErrors({});
    setOpenModal(true);

    // Add hidden dummy inputs to prevent autofill
    setTimeout(() => {
      const modalContainer = document.querySelector(".modal-container");
      if (modalContainer) {
        // Add hidden inputs before the form to trick autofill
        const dummyDiv = document.createElement("div");
        dummyDiv.style.display = "none";
        dummyDiv.innerHTML = `
          <input type="text" name="username" style="display:none">
          <input type="password" name="password" style="display:none">
        `;
        modalContainer.prepend(dummyDiv);
      }
    }, 10);
  };

  const handleEditUser = (user) => {
    setIsEditing(true);
    setEditingUserId(user._id);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      confirmPassword: "",
      emergencyPhone: user.emergencyPhone || "",
    });
    setFormErrors({});
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setIsEditing(false);
    setEditingUserId(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      emergencyPhone: "",
    });
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) {
      toast.error("Please fix all validation errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && editingUserId) {
        // Update existing user
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          emergencyPhone: formData.emergencyPhone?.trim() || "",
        };

        // Only include password fields if they are filled
        if (formData.password.trim()) {
          payload.password = formData.password;
        }

        const response = await updateUser(editingUserId, payload);

        if (response.status === 200 || response.success) {
          fetchData(currentPage, searchText, false);
          handleModalClose();
          toast.success("User updated successfully!");
          return;
        }

        if (response.message) {
          toast.error(response.message);
          return;
        }
      } else {
        // Create new user
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          emergencyPhone: formData.emergencyPhone?.trim() || "",
          confirmPassword: formData.confirmPassword,
          medicalcondition: "",
          deviceToken: "",
        };

        const response = await signup(payload);

        if (
          response.status === 201 ||
          (response.message && response.message.includes("success"))
        ) {
          fetchData(currentPage, searchText, false);
          handleModalClose();
          toast.success(response.message || "User created successfully!");
          return;
        }

        if (response.message) {
          toast.error(response.message);
          return;
        }

        if (response.errors) {
          setFormErrors(response.errors);
          toast.error("Please fix the validation errors.");
          return;
        }
      }

      toast.error("An error occurred while processing your request.");
    } catch (error) {
      console.error("Error processing user:", error);

      let errorMessage = "An error occurred while processing your request.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        errorMessage = "Please fix the validation errors.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg min-h-[700px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#5472D3] animate-spin mx-auto mb-4" />
          <p className="text-[#666D80]">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Users
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by name, phone, or email"
                  value={searchText}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full sm:w-64"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  name="search"
                  id="search-input"
                />
              </div>

              <button
                onClick={handleModalOpen}
                className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center sm:justify-start"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-2">
          <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
            <UserTable
              users={users}
              searchText={searchText}
              onUserAdded={fetchData}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalUsers={totalUsers}
              onEditUser={handleEditUser}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-container">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleModalClose}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
              <div className="flex justify-between items-center p-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditing ? "Edit User" : "Add New User"}
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
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter full name"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck="false"
                  id="name-input"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  id="email-input"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  id="phone-input"
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {!isEditing ? (
                <>
                  <PasswordInput
                    name="password"
                    value={formData.password}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                    error={formErrors.password}
                    placeholder="Enter password (min 6 characters)"
                    label="Password"
                    required={true}
                    showPassword={showPassword}
                    onToggleVisibility={togglePasswordVisibility}
                    inputRef={passwordInputRef}
                  />

                  <PasswordInput
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                    error={formErrors.confirmPassword}
                    placeholder="Confirm password"
                    label="Confirm Password"
                    required={true}
                    showPassword={showConfirmPassword}
                    onToggleVisibility={toggleConfirmPasswordVisibility}
                    inputRef={confirmPasswordInputRef}
                  />
                </>
              ) : (
                <>
                  <PasswordInput
                    name="password"
                    value={formData.password}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                    error={formErrors.password}
                    placeholder="Leave blank to keep current password"
                    label="New Password"
                    required={false}
                    showPassword={showPassword}
                    onToggleVisibility={togglePasswordVisibility}
                    inputRef={passwordInputRef}
                  />

                  {formData.password && (
                    <PasswordInput
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleFieldChange}
                      onBlur={handleFieldBlur}
                      error={formErrors.confirmPassword}
                      placeholder="Confirm new password"
                      label="Confirm New Password"
                      required={true}
                      showPassword={showConfirmPassword}
                      onToggleVisibility={toggleConfirmPasswordVisibility}
                      inputRef={confirmPasswordInputRef}
                    />
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Phone{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.emergencyPhone
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter emergency phone number"
                  maxLength="10"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {formErrors.emergencyPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.emergencyPhone}
                  </p>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <p>* Required fields</p>
                {isEditing && (
                  <p className="mt-1">
                    Leave password fields blank to keep current password
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {isEditing ? "Update" : "Submit"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
