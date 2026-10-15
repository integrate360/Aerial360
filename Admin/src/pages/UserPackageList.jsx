import { ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import * as XLSX from "xlsx";
import ConfirmationModal from "../layouts/ConfirmationModal";
import {
  userpackage,
  deleteuserpackage,
  userpackageById,
  updateUserPackagePartialPaymnet,
  extendPackageExpiry,
  cancelBookingById,
} from "../Apis/ApiCalls";
import {
  Eye,
  Trash2,
  Search,
  X,
  Download,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Package,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Star,
  Edit,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  Loader2,
  Edit2,
} from "lucide-react";
import BookingForm from "../components/userPackage/BookingForm";
import ServiceSelectionModal from "../components/userPackage/ServiceSelectionModal";
import ClassBookingModal from "../components/userPackage/ClassBookingModal";

const UserPackageList = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedPackageForBooking, setSelectedPackageForBooking] =
    useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPackageForExtension, setSelectedPackageForExtension] =
    useState(null);
  const [extensionDays, setExtensionDays] = useState(30);
  const [extensionReason, setExtensionReason] = useState("");
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendExpiryModal, setExtendExpiryModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await userpackage({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      });

      if (response?.data && Array.isArray(response.data)) {
        const processedData = response.data.map((booking) => ({
          ...booking,
          partialAmount:
            booking.partialAmount !== undefined
              ? booking.partialAmount
              : booking.price,
        }));
        setRows(processedData);
        setFilteredRows(processedData);
        if (response.pagination) {
          setTotalRecords(response.pagination.total || 0);
          setTotalPages(response.pagination.totalPages || 1);
        }
      } else {
        setRows([]);
        setFilteredRows([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching package bookings:", error);
      toast.error("Failed to fetch package bookings");
      setRows([]);
      setFilteredRows([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendExpiry = async () => {
    if (!selectedPackageForExtension) return;

    try {
      const response = await extendPackageExpiry(
        selectedPackageForExtension._id,
        extensionDays,
        extensionReason,
      );

      if (response.success) {
        toast.success(
          response.message || "Package expiry extended successfully",
        );
        setExtendExpiryModal(false);
        setShowExtendModal(false);
        setSelectedPackageForExtension(null);
        setExtensionDays(30);
        setExtensionReason("");
        await fetchData();
      } else {
        toast.error(response.message || "Failed to extend expiry");
      }
    } catch (error) {
      console.error("Error extending expiry:", error);
      toast.error("An error occurred while extending expiry");
    }
  };

  const handleOpenExtendExpiry = (booking) => {
    setSelectedPackageForExtension(booking);
    setShowExtendModal(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleExport = () => {
    const data = filteredRows.map((row) => ({
      Name: row.user?.name || "N/A",
      Email: row.user?.email || "N/A",
      Phone: row.user?.phone || "N/A",
      "Package Name": row.package?.name || "N/A",
      "Total Classes": `${row.slots}/${row.totalSlots}`,
      "Remaining Classes": row.totalSlots - row.slots,
      Amount: row.price,
      "Paid Amount":
        row.partialAmount !== undefined ? row.partialAmount : row.price,
      "Remaining Amount":
        row.price -
        (row.partialAmount !== undefined ? row.partialAmount : row.price),
      "Booking Date": moment(row.createdAt).format("DD-MM-YYYY"),
      "Expiry Date": moment(row.createdAt)
        .add(row.package?.duration || 30, "days")
        .format("DD-MM-YYYY"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Packages");
    XLSX.writeFile(workbook, "user_packages.xlsx");
    toast.success("Data exported successfully");
  };

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    setOpenDetailsDialog(true);
    try {
      const response = await userpackageById(booking._id);
      if (response?.data) {
        setSelectedBooking(response.data);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };
  const handleClearDateFilters = () => {
    setFromDate("");
    setToDate("");
  };
  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      const result = await cancelBookingById(bookingToCancel);
      if (result.status === 200) {
        toast.success("Booking cancelled successfully!");

        if (selectedBooking) {
          const updatedBookings = selectedBooking.bookings.filter(
            (booking) => booking._id !== bookingToCancel,
          );

          const updatedSelectedBooking = {
            ...selectedBooking,
            bookings: updatedBookings,
            slots: Math.max(0, selectedBooking.slots - 1),
          };

          setSelectedBooking(updatedSelectedBooking);
        }

        await fetchData();
      } else {
        toast.error(result?.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setShowCancelModal(false);
      setBookingToCancel(null);
    }
  };

  const handleDeleteBooking = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteBooking = async () => {
    if (!itemToDelete) return;

    try {
      await deleteuserpackage(itemToDelete);
      await fetchData();
      toast.success("Booking has been deleted.");
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking.");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleAddPayment = (booking) => {
    const currentPaidAmount =
      booking.partialAmount !== undefined
        ? booking.partialAmount
        : booking.price;
    const remainingAmount = booking.price - currentPaidAmount;

    if (remainingAmount <= 0) {
      toast.info("This booking has already been fully paid.");
      return;
    }

    setSelectedPackageForBooking(booking);
    setPaymentAmount(remainingAmount.toString());
    setShowPaymentModal(true);
  };

  const confirmAddPayment = async () => {
    if (!selectedPackageForBooking || !paymentAmount) return;

    const currentPaidAmount =
      selectedPackageForBooking.partialAmount !== undefined
        ? selectedPackageForBooking.partialAmount
        : selectedPackageForBooking.price;
    const remainingAmount = selectedPackageForBooking.price - currentPaidAmount;
    const paymentAmountNum = parseFloat(paymentAmount);

    if (!paymentAmountNum || paymentAmountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (paymentAmountNum > remainingAmount) {
      toast.error(`Amount cannot exceed remaining ₹${remainingAmount}`);
      return;
    }

    try {
      const userPackageId = selectedPackageForBooking._id;
      if (!userPackageId) throw new Error("Package ID not found");

      const response = await updateUserPackagePartialPaymnet(
        userPackageId,
        paymentAmountNum,
      );

      if (response.status === 200) {
        toast.success("Partial payment added successfully");
        await fetchData();
      } else {
        toast.error("Failed to add partial payment");
      }
    } catch (error) {
      console.error("Error adding partial payment:", error);
      toast.error("An error occurred while adding payment");
    } finally {
      setShowPaymentModal(false);
      setSelectedPackageForBooking(null);
      setPaymentAmount("");
    }
  };

  const handleBookRemaining = async (bookingData) => {
    try {
      const response = await userpackageById(bookingData?._id);

      if (response.status === 200) {
        let userData = bookingData.user;

        if (response.data?.user) {
          if (
            typeof response.data.user === "object" &&
            response.data.user._id
          ) {
            userData = response.data.user;
          } else if (typeof response.data.user === "string") {
            userData = {
              ...bookingData.user,
              _id: response.data.user,
            };
          }
        }

        if (!userData._id || !userData.name) {
          console.error("Invalid user data after processing:", userData);
          toast.error(
            "User information is incomplete. Please refresh the page and try again.",
          );
          return;
        }

        const updatedBookingData = {
          ...bookingData,
          package: response.data?.package || bookingData.package,
          bookings: response.data?.bookings || bookingData.bookings,
          user: userData,
        };

        if (!updatedBookingData.user._id || !updatedBookingData.user.name) {
          console.error(
            "User data validation failed:",
            updatedBookingData.user,
          );
          toast.error(
            "User information is missing required fields. Please try again.",
          );
          return;
        }

        setSelectedPackageForBooking(updatedBookingData);
        setShowServiceModal(true);
        fetchData();
      } else {
        console.error("Booking failed:", response);
        toast.error("Failed to process the booking request");
      }
    } catch (error) {
      console.error("Error booking package:", error);
      toast.error("An error occurred while processing the booking");
    }
  };

  const handleServiceSelect = (service) => {
    if (!selectedPackageForBooking?.user) {
      console.error("❌ No user object found");
      toast.error("User information is missing (no user object).");
      return;
    }

    if (!selectedPackageForBooking.user._id) {
      console.error("❌ No user ID found:", selectedPackageForBooking.user);
      toast.error("User ID is missing from booking data.");
      return;
    }

    if (!selectedPackageForBooking.user.name) {
      console.error("❌ No user name found:", selectedPackageForBooking.user);
      toast.error("User name is missing from booking data.");
      return;
    }

    setSelectedService(service);
    setShowServiceModal(false);
    setShowBookingModal(true);
  };

  const renderPaymentStatus = (row) => {
    const currentPaidAmount =
      row.partialAmount !== undefined ? row.partialAmount : row.price;
    const remainingAmount = row.price - currentPaidAmount;
    const isFullyPaid = remainingAmount <= 0;

    if (isFullyPaid) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-600 font-medium">₹0</span>
        </div>
      );
    }

    if (currentPaidAmount > 0) {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-blue-500" />
            <span className="text-blue-600 text-sm font-medium">
              ₹{currentPaidAmount.toLocaleString()}
            </span>
          </div>
          <span className="text-gray-600 text-xs">
            Remaining: ₹{remainingAmount.toLocaleString()}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-gray-400" />
        <span className="text-gray-500">Not Paid</span>
      </div>
    );
  };

  const renderExpiryDate = (row) => {
    const expiryDate = row.extendedValidityEndDate
      ? moment(row.extendedValidityEndDate).format("DD-MM-YYYY")
      : moment(row.createdAt)
          .add(row.package?.duration || 30, "days")
          .format("DD-MM-YYYY");

    return (
      <div
        onClick={() => handleOpenExtendExpiry(row)}
        className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <Edit className="w-4 h-4 text-gray-500" />
          <span
            className={`font-medium ${
              row.extendedValidityEndDate ? "text-green-600" : "text-gray-700"
            }`}
          >
            {expiryDate}
          </span>
          {row.extendedValidityEndDate && (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          )}
        </div>
      </div>
    );
  };

  const renderActionButtons = (row) => {
    const remainingSlots = row.totalSlots - row.slots;
    const currentPaidAmount =
      row.partialAmount !== undefined ? row.partialAmount : row.price;
    const remainingAmount = row.price - currentPaidAmount;
    const isFullyPaid = remainingAmount <= 0;

    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleBookRemaining(row)}
          disabled={remainingSlots <= 0}
          className={`px-3 py-1 text-sm rounded border transition-colors duration-200 ${
            remainingSlots <= 0
              ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
              : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
          }`}
        >
          Book ({remainingSlots})
        </button>
      </div>
    );
  };

  const renderTableRowActions = (row) => {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleViewDetails(row)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteBooking(row._id)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Table Header Component
  const TableHeader = ({ icon, label }) => (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Users Package List
              </h1>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or package"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full sm:w-64"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="completed">Completed</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Booking</span>
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {searchTerm && (
            <p className="mt-3 text-sm text-gray-500">
              Found {totalRecords} result
              {totalRecords !== 1 ? "s" : ""} for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Table Container */}
        <div className="p-2">
          <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <tr>
                    <TableHeader
                      icon={<User className="w-4 h-4 text-blue-600" />}
                      label="Name"
                    />
                    <TableHeader
                      icon={<Package className="w-4 h-4 text-blue-600" />}
                      label="Package"
                    />
                    <TableHeader
                      icon={<h2 className="text-[15px] text-blue-600">₹</h2>}
                      label="Amount"
                    />
                    <TableHeader
                      icon={<CreditCard className="w-4 h-4 text-blue-600" />}
                      label="Outstanding"
                    />
                    <TableHeader
                      icon={<Users className="w-4 h-4 text-blue-600" />}
                      label="Classes"
                    />
                    <TableHeader
                      icon={<Calendar className="w-4 h-4 text-blue-600" />}
                      label="Date"
                    />
                    <TableHeader
                      icon={<Calendar className="w-4 h-4 text-blue-600" />}
                      label="Expiry Date"
                    />
                    <TableHeader
                      icon={<Package className="w-4 h-4 text-blue-600" />}
                      label="Book"
                    />
                    <TableHeader
                      icon={<h2 className="text-[15px] text-blue-600">₹</h2>}
                      label="Payment"
                    />
                    <TableHeader
                      icon={<Eye className="w-4 h-4 text-blue-600" />}
                      label="Actions"
                    />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                          <p className="text-gray-500">
                            Loading package bookings...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Package className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-gray-500">
                            No package bookings found
                          </p>
                          {searchTerm && (
                            <p className="text-gray-400 text-sm mt-1">
                              Try adjusting your search
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row._id}
                        className="hover:bg-blue-50/50 transition-colors duration-200"
                      >
                        {/* Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <span className="text-sm font-medium text-gray-800">
                              {row.user?.name || "N/A"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {row.user?.email || ""}
                            </span>
                          </div>
                        </td>

                        {/* Package */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <span className="text-sm font-medium text-gray-800">
                              {row.package?.name || "N/A"}
                            </span>
                            <span className="text-xs text-gray-500">
                              Duration: {row.package?.duration || 30} days
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <span className="text-sm font-medium text-gray-800">
                              ₹{row.price.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        {/* Payment Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderPaymentStatus(row)}
                        </td>

                        {/* Classes */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {row.slots}/{row.totalSlots}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {row.totalSlots - row.slots} remaining
                            </span>
                          </div>
                        </td>

                        {/* Booking Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <span className="text-sm text-gray-800">
                              {moment(row.createdAt).format("DD-MM-YYYY")}
                            </span>
                          </div>
                        </td>

                        {/* Expiry Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderExpiryDate(row)}
                        </td>

                        {/* Book Button */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderActionButtons(row)}
                        </td>

                        {/* Add Payment Button - UPDATED */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const currentPaidAmount =
                              row.partialAmount !== undefined
                                ? row.partialAmount
                                : row.price;
                            const remainingAmount =
                              row.price - currentPaidAmount;
                            const isFullyPaid = remainingAmount <= 0;

                            if (isFullyPaid) {
                              return (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Paid</span>
                                </div>
                              );
                            }

                            return (
                              <button
                                onClick={() => handleAddPayment(row)}
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm rounded-lg font-medium transition-all duration-200"
                              >
                                Add Payment
                              </button>
                            );
                          })()}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderTableRowActions(row)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalRecords > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 md:px-6 py-4 rounded-xl shadow-sm border border-gray-200 gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 text-center md:text-left">
                <span>
                  Showing {totalRecords > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalRecords)}{" "}
                  of {totalRecords} package bookings
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {/* Page Numbers - Responsive */}
                  <div className="flex items-center justify-center gap-1 order-2 sm:order-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg 
               disabled:opacity-50 disabled:cursor-not-allowed 
               hover:bg-gray-50 transition-colors"
                      aria-label="First page"
                    >
                      «
                    </button>
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
                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
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
                        },
                      )}
                    </div>

                    {/* DESKTOP (5 pages) */}
                    <div className="hidden sm:flex items-center gap-1 px-0">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
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
                        },
                      )}
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
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg 
               disabled:opacity-50 disabled:cursor-not-allowed 
               hover:bg-gray-50 transition-colors"
                      aria-label="Last page"
                    >
                      »
                    </button>
                  </div>

                  {/* Page Info - For mobile only */}
                  <div className="text-sm text-gray-600 text-center order-1 sm:order-2 sm:hidden">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showForm && (
        <BookingForm onClose={() => setShowForm(false)} onSuccess={fetchData} />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDeleteBooking}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setBookingToCancel(null);
        }}
        onConfirm={confirmCancelBooking}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone!"
        confirmText="Yes, cancel it!"
        cancelText="Go Back"
        type="warning"
      />

      <ConfirmationModal
        isOpen={showExtendModal}
        onClose={() => {
          setShowExtendModal(false);
          setSelectedPackageForExtension(null);
          setExtensionDays(30);
          setExtensionReason("");
        }}
        onConfirm={handleExtendExpiry}
        title="Extend Package Expiry"
        message={
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Package</p>
                <p className="font-medium">
                  {selectedPackageForExtension?.package?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium">
                  {selectedPackageForExtension?.user?.name || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Expiry</p>
              <p
                className={`font-medium ${selectedPackageForExtension?.extendedValidityEndDate ? "text-green-600" : ""}`}
              >
                {selectedPackageForExtension?.extendedValidityEndDate
                  ? moment(
                      selectedPackageForExtension.extendedValidityEndDate,
                    ).format("DD-MM-YYYY")
                  : moment(selectedPackageForExtension?.createdAt)
                      .add(
                        selectedPackageForExtension?.package?.duration || 30,
                        "days",
                      )
                      .format("DD-MM-YYYY")}
                {selectedPackageForExtension?.extendedValidityEndDate && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current inline ml-1" />
                )}
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Extension Days
              </label>
              <input
                type="number"
                value={extensionDays}
                onChange={(e) =>
                  setExtensionDays(parseInt(e.target.value) || 0)
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Extension
              </label>
              <textarea
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                rows="2"
                placeholder="Enter reason for extending expiry..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>
        }
        confirmText="Extend Expiry"
        cancelText="Cancel"
        type="info"
        confirmDisabled={!extensionDays || !extensionReason.trim()}
      />

      <ConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPackageForBooking(null);
          setPaymentAmount("");
        }}
        onConfirm={confirmAddPayment}
        title="Add Partial Payment"
        message={
          selectedPackageForBooking && (
            <div className="space-y-5">
              <h4 className="text-base font-bold text-[#1A1D25]">
                Payment Details
              </h4>

              {/* Summary Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-lg border border-[#E8ECF5]">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-[#5472D3]" />
                    <span className="text-sm font-medium text-[#5A6474]">
                      Total Amount
                    </span>
                  </div>
                  <p className="font-bold text-[#1A1D25]">
                    ₹{selectedPackageForBooking.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F5F7FA] rounded-lg border border-[#E8ECF5]">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-[#10B981]" />
                    <span className="text-sm font-medium text-[#5A6474]">
                      Already Paid
                    </span>
                  </div>
                  <p className="font-bold text-[#1A1D25]">
                    ₹
                    {(selectedPackageForBooking.partialAmount !== undefined
                      ? selectedPackageForBooking.partialAmount
                      : selectedPackageForBooking.price
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#F0F9FF] to-[#E6F7FF] rounded-lg border border-[#D1E9FF]">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-[#0D47A1]" />
                    <span className="text-sm font-medium text-[#0D47A1]">
                      Remaining Amount
                    </span>
                  </div>
                  <p className="font-bold text-[#0D47A1]">
                    ₹
                    {(
                      selectedPackageForBooking.price -
                      (selectedPackageForBooking.partialAmount !== undefined
                        ? selectedPackageForBooking.partialAmount
                        : selectedPackageForBooking.price)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Input */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1D25] mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="1"
                  max={
                    selectedPackageForBooking.price -
                    (selectedPackageForBooking.partialAmount !== undefined
                      ? selectedPackageForBooking.partialAmount
                      : selectedPackageForBooking.price)
                  }
                  placeholder="Enter amount"
                  className="w-full px-4 py-2.5 border border-[#D8DDE6] rounded-lg focus:ring-2 focus:ring-[#0D47A1]/20 focus:border-[#5472D3] outline-none transition-all duration-200 bg-white text-[#1A1D25]"
                />
                <p className="text-xs text-[#5A6474] mt-1">
                  Maximum: ₹
                  {(
                    selectedPackageForBooking.price -
                    (selectedPackageForBooking.partialAmount !== undefined
                      ? selectedPackageForBooking.partialAmount
                      : selectedPackageForBooking.price)
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )
        }
        confirmText="Add Payment"
        cancelText="Cancel"
        type="info"
        confirmDisabled={!paymentAmount}
      />

      {/* Booking Details Modal */}
      {openDetailsDialog && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Booking Details
              </h3>
              <button
                onClick={() => setOpenDetailsDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              {/* Package header with badge */}
              <div className="mb-6 relative">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-semibold text-gray-800">
                    {selectedBooking.package?.name}
                  </h4>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${selectedBooking.isBookedByAdmin ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}
                  >
                    <span className="text-sm font-medium">
                      {selectedBooking.isBookedByAdmin ? "Admin" : "User"}{" "}
                      Booked
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedBooking.bookings.map((booking) =>
                  booking.dates?.map((date, dateIndex) => (
                    <div
                      key={`${booking._id}-${dateIndex}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 relative"
                    >
                      {/* Individual booking badge */}
                      <div
                        className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs ${booking.isBookedByAdmin ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}
                      >
                        {booking.isBookedByAdmin ? "A" : "U"}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="absolute top-3 right-12 text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Cancel Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-3 pt-1">
                        <div className="flex items-start space-x-3">
                          <User className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">User</p>
                            <p className="font-medium">
                              {selectedBooking.user?.name || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <User className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">
                              {selectedBooking.user?.phone || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">
                              {booking.location?.name || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Date & Time</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="inline-flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {moment(date).format("DD-MM-YYYY")}
                              </span>
                              <span className="inline-flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {booking.time && booking.time[dateIndex]
                                  ? moment(
                                      booking.time[dateIndex],
                                      "HH:mm",
                                    ).format("hh:mm A")
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Booked by:{" "}
                            {booking.isBookedByAdmin ? "Admin" : "User"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )),
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setOpenDetailsDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        open={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        selectedPackageBooking={selectedPackageForBooking}
        remainingSlots={
          selectedPackageForBooking
            ? selectedPackageForBooking.totalSlots -
              selectedPackageForBooking.slots
            : 0
        }
        onServiceSelect={handleServiceSelect}
      />

      {/* Class Booking Modal */}
      {showBookingModal &&
        selectedPackageForBooking &&
        selectedService &&
        selectedPackageForBooking.user &&
        selectedPackageForBooking.user._id && (
          <ClassBookingModal
            selectedBooking={{
              _id: selectedPackageForBooking._id,
              class: { _id: selectedService._id, name: selectedService.name },
              package: selectedPackageForBooking.package._id,
              user: selectedPackageForBooking.user,
              time: "",
              dates: [],
              uuid: selectedPackageForBooking.uuid,
              location: selectedPackageForBooking.location,
              amount: selectedPackageForBooking.price,
              people: 1,
              createdAt: selectedPackageForBooking.createdAt,
              updatedAt: selectedPackageForBooking.updatedAt,
              extendedValidityEndDate: selectedPackageForBooking.extendedValidityEndDate,
              validityEndDate: selectedPackageForBooking.validityEndDate,
              packageDuration: selectedPackageForBooking.package?.duration,
            }}
            handleModalClose={() => {
              setShowBookingModal(false);
              setSelectedService(null);
            }}
            fetchData={fetchData}
            isNewBooking={true}
            remainingSlots={
              selectedPackageForBooking.totalSlots -
              selectedPackageForBooking.slots
            }
            selectedServiceId={selectedService._id}
            selectedServiceData={selectedService}
          />
        )}
    </div>
  );
};

export default UserPackageList;
