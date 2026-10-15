import { useState, useEffect } from "react";
import { deleteEnquiry, getEnquiry } from "../Apis/ApiCalls";
import { toast } from "react-toastify";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  User,
  Phone,
  Mail,
  Users,
  Calendar,
  Trash2,
} from "lucide-react";
import moment from "moment";
import ConfirmationModal from "../layouts/ConfirmationModal";

// UserTable Component for Enquiries
const UserTable = ({ users, searchText }) => {
  const [rows, setRows] = useState(users);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setRows(users);
  }, [users]);

  // Filter enquiries based on search text
  const filteredEnquiries = rows.filter((enquiry) => {
    return (
      enquiry?.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      enquiry?.user?.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
      enquiry?.user?.email?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const paginatedEnquiries = filteredEnquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setEnquiryToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!enquiryToDelete) return;

    setIsDeleting(true);
    try {
      const del = await deleteEnquiry(enquiryToDelete);
      if (del?.status !== 200) {
        throw new Error("Failed to delete enquiry");
      }
      setRows((prevRows) =>
        prevRows.filter((row) => row._id !== enquiryToDelete),
      );
      toast.success("Enquiry deleted successfully!");
      setShowDeleteModal(false);
      setEnquiryToDelete(null);
    } catch (error) {
      setError("Error deleting enquiry");
      toast.error("Failed to delete enquiry");
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

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide rounded-xl shadow-sm border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <TableHeader
                icon={<User className="w-4 h-4 text-blue-600" />}
                label="Name"
              />
              <TableHeader
                icon={<Phone className="w-4 h-4 text-blue-600" />}
                label="Phone"
              />
              <TableHeader
                icon={<Users className="w-4 h-4 text-blue-600" />}
                label="People"
              />
              <TableHeader
                icon={<Mail className="w-4 h-4 text-blue-600" />}
                label="Email"
              />
              <TableHeader
                icon={<Calendar className="w-4 h-4 text-blue-600" />}
                label="Date"
              />
              <TableHeader
                icon={<Trash2 className="w-4 h-4 text-blue-600" />}
                label="Actions"
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEnquiries.map((enquiry) => (
              <tr
                key={enquiry._id}
                className="hover:bg-blue-50/50 transition-colors duration-200"
              >
                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col justify-center h-full">
                    <span className="text-sm font-medium text-gray-800">
                      {enquiry.user?.name || "N/A"}
                    </span>
                  </div>
                </td>

                {/* Phone */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col justify-center h-full">
                    <span className="text-sm text-gray-800">
                      {enquiry.user?.phone || "N/A"}
                    </span>
                  </div>
                </td>

                {/* People */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col justify-center h-full">
                    <span className="text-sm text-gray-800">
                      {enquiry.people || "N/A"}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col justify-center h-full">
                    <span className="text-sm text-gray-800">
                      {enquiry.user?.email || "N/A"}
                    </span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col justify-center h-full">
                    <span className="text-sm text-gray-800">
                      {enquiry.date
                        ? moment(enquiry.date).format("DD MMMM YYYY")
                        : "N/A"}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteClick(enquiry._id)}
                      className={`p-2 hover:bg-red-50 rounded-lg transition-colors ${
                        error && enquiry._id === selectedId
                          ? "text-red-600"
                          : "text-gray-600 hover:text-red-600"
                      }`}
                      title="Delete Enquiry"
                    >
                      {error && enquiry._id === selectedId ? (
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

        {/* Empty State */}
        {paginatedEnquiries.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No enquiries found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchText
                ? "Try a different search term"
                : "No enquiries available"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 md:px-6 py-4 rounded-xl shadow-sm border border-gray-200 gap-4 mt-4">
          <div className="text-sm text-gray-600 text-center md:text-left">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredEnquiries.length)} of{" "}
            {filteredEnquiries.length} enquiries
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
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEnquiryToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
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

// Main Enquiry List Component
const EnquiryList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");

  const fetchData = async () => {
    try {
      // Replace this with your actual API call
      const res = await getEnquiry();
      if (res?.data) {
        const userData = res.data.reverse() || [];
        setUsers(userData);
        setFilteredUsers(userData);
      } else {
        toast.error("Failed to fetch enquiries.", "error");
      }

      const userData = res.data.reverse() || [];
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("An error occurred while fetching enquiries.", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      return (
        user?.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user?.user?.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
        user?.user?.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredUsers(filtered);
  }, [searchText, users]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Enquiries
              </h1>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, phone, or email"
                value={searchText}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="p-2">
          <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
            <UserTable users={filteredUsers} searchText={searchText} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryList;
