import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import {
  Eye,
  CalendarDays,
  User,
  Clock,
  MapPin,
  Trash2,
  Edit,
  Calendar,
  Package,
  CreditCard,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import RescheduleModal from "./RescheduleModal";
import ConfirmationModal from "../layouts/ConfirmationModal";
import {
  deleteBooking,
  getClassById,
  updateBookingPartialAmount,
} from "../Apis/ApiCalls";
import { convertTo12HourFormat } from "../Apis/formatNumber.JS";

const PaymentCell = ({ row, handleupdateBookingPartialAmount }) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState(row.partialAmount);

  const amount = row.amount;
  const partialAmount = row.partialAmount;
  const difference = amount - (partialAmount ?? 0);

  const handleSubmit = () => {
    if (inputValue !== "" && !isNaN(Number(inputValue))) {
      const updatedPartialAmount = Number(inputValue);
      if (updatedPartialAmount > amount) {
        toast.error(
          "Please enter a partial amount less than or equal to the total amount.",
        );
        return;
      }
      handleupdateBookingPartialAmount(row.id, updatedPartialAmount);
      setIsInputVisible(false);
    } else {
      toast.error("Please enter a valid amount.");
    }
  };

  const handleClickAway = (e) => {
    if (isInputVisible && !e.target.closest(".payment-input-container")) {
      setIsInputVisible(false);
    }
  };

  useEffect(() => {
    if (isInputVisible) {
      document.addEventListener("click", handleClickAway);
      return () => document.removeEventListener("click", handleClickAway);
    }
  }, [isInputVisible]);

  if (
    partialAmount == null ||
    partialAmount === 0 ||
    partialAmount === amount
  ) {
    return (
      <div className="flex flex-col justify-center h-full">
        <span className="text-sm font-medium text-gray-800">
          ₹{amount ?? "N/A"}
        </span>
      </div>
    );
  }

  return (
    <div className="payment-input-container flex flex-col justify-center h-full">
      <div className="flex flex-col items-center justify-center">
        <span className="text-sm font-medium text-gray-800">₹{amount}</span>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-600">
            Partial: ₹{partialAmount}
          </span>
          <button
            onClick={() => setIsInputVisible(!isInputVisible)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Edit className="w-3 h-3 text-blue-600" />
          </button>
        </div>

        <span className="text-xs text-red-600 mt-1">Due: ₹{difference}</span>

        {isInputVisible && (
          <div className="flex items-center gap-2 mt-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Edit Partial"
              className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-800 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="number"
            />
            <button
              onClick={handleSubmit}
              className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const BookingsTable = ({
  bookings,
  fetchData,
  search = "",
  setSearch,
  page = 1,
  setPage,
  limit = 10,
  setLimit,
  pagination = { total: 0, totalPages: 1 },
  fetchBookingsData,
  locations = [],
  classesList = [],
}) => {
  const [modal, setModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [localSearch, setLocalSearch] = useState(search);

  // Flatten bookings
  const flattenedBookings = useMemo(() => {
    return bookings
      ?.sort((a, b) => {
        const toDate = (val) =>
          new Date(typeof val === "object" ? (val?.$date ?? "") : (val ?? ""));
        return toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime();
      })
      ?.flatMap((booking, index) => {
        const dates = booking.dates || [];
        return dates.map((date, dateIndex) => ({
          _id: `${booking._id}-${dateIndex}`,
          id: booking._id,
          originalId: booking._id,
          class: booking.class,
          user: booking.user,
          date: date,
          time: Array.isArray(booking.time)
            ? booking.time[dateIndex] || booking.time[0]
            : booking.time,
          location: booking.location,
          createdAt: booking.createdAt,
          trainer: booking.trainer,
          duration: booking.duration,
          amount: booking.amount,
          partialAmount: booking.partialAmount,
          package: booking.package,
          updatedAt: booking.updatedAt,
          isBookedByAdmin: booking.isBookedByAdmin,
        }));
      });
  }, [bookings]);

  // Filter bookings based on date range and search query
  const filteredBookings = useMemo(() => {
    if (!flattenedBookings) return [];

    return flattenedBookings.filter((booking) => {
      // Date range filter
      const bookingDate = booking.date ? new Date(booking.date) : new Date();
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      const isAfterFromDate = !from || bookingDate >= from;
      const isBeforeToDate = !to || bookingDate <= to;

      // Search filter
      const currentSearch = (setSearch ? search : localSearch) || "";
      const searchLower = currentSearch.toLowerCase().trim();
      const passesSearch =
        !searchLower ||
        // Search in user name
        booking.user?.name?.toLowerCase().includes(searchLower) ||
        // Search in user phone
        booking.user?.phone?.toLowerCase().includes(searchLower) ||
        // Search in class name
        (Array.isArray(booking.class)
          ? booking.class.some((c) =>
              c?.name?.toLowerCase().includes(searchLower),
            )
          : booking.class?.name?.toLowerCase().includes(searchLower)) ||
        // Search in package name
        booking.package?.name?.toLowerCase().includes(searchLower) ||
        // Search in location name
        booking.location?.name?.toLowerCase().includes(searchLower) ||
        // Search in booking ID
        booking.id?.toLowerCase().includes(searchLower) ||
        // Search in date
        (booking.date &&
          moment(booking.date).format("DD-MM-YYYY").includes(searchLower)) ||
        // Search in formatted date
        (booking.date &&
          moment(booking.date)
            .format("MMM DD, YYYY")
            .toLowerCase()
            .includes(searchLower)) ||
        // Search in time
        (booking.time &&
          convertTo12HourFormat(booking.time)
            .toLowerCase()
            .includes(searchLower)) ||
        // Search in payment amount
        booking.amount?.toString().includes(searchLower) ||
        // Search in created date
        (booking.createdAt &&
          moment(booking.createdAt).format("DD-MM-YYYY").includes(searchLower));

      return isAfterFromDate && isBeforeToDate && passesSearch;
    });
  }, [flattenedBookings, fromDate, toDate, search, localSearch, setSearch]);

  const currentSearch = (setSearch ? search : localSearch) || "";
  const activePage = page || 1;
  const activeLimit = limit || 10;
  const totalRecords = pagination?.total || flattenedBookings?.length || 0;
  const totalPages = pagination?.totalPages || Math.ceil(totalRecords / activeLimit) || 1;
  const paginatedBookings = flattenedBookings;

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (setSearch) {
      setSearch(val);
      if (setPage) setPage(1);
    }
  };

  const clearSearch = () => {
    setLocalSearch("");
    if (setSearch) {
      setSearch("");
      if (setPage) setPage(1);
    }
  };

  const handleDelete = async () => {
    if (!bookingToDelete) return;

    const cleanedId = bookingToDelete.split("-")[0];
    setIsDeleting(true);

    try {
      const response = await deleteBooking(cleanedId);
      if (response.status === 200) {
        toast.success("Booking deleted successfully!");
        fetchData(false);
        setShowDeleteModal(false);
        setBookingToDelete(null);
      } else {
        toast.error("Failed to delete booking.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (id) => {
    setBookingToDelete(id);
    setShowDeleteModal(true);
  };

  const handleupdateBookingPartialAmount = async (id, partialAmount) => {
    const cleanedId = id.split("-")[0];

    try {
      const response = await updateBookingPartialAmount(
        cleanedId,
        partialAmount,
      );
      if (response?.status === 200) {
        toast.success("Booking updated successfully!");
        fetchData(false);
      } else {
        toast.error("Failed to update booking.");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error occurred while updating.");
    }
  };

  const formatTo12Hour = (timeStr) => {
    if (typeof timeStr !== "string") return "N/A";

    const [hourStr, minuteStr] = timeStr.split(":");
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (isNaN(hour) || isNaN(minute)) return "Invalid Time";

    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const TableHeader = ({ icon, label }) => (
    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        {icon}
        <span className="sm:inline truncate max-w-[80px] sm:max-w-none">
          {label}
        </span>
      </div>
    </th>
  );

  const BookingDetailsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowDetailsModal(false)}
      />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
          <button
            onClick={() => setShowDetailsModal(false)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {selectedBooking && (
          <div className="p-6 space-y-5">
            {/* Package / Class Name */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-1">
                {selectedBooking?.package?.name ? "Package:" : "Class:"}{" "}
                <span className="font-normal">
                  {selectedBooking?.package?.name ??
                    (Array.isArray(selectedBooking?.class)
                      ? selectedBooking.class[0]?.name
                      : (selectedBooking?.class?.name ??
                        selectedBooking?.class)) ??
                    "N/A"}
                </span>
              </h3>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-800">
                  {typeof selectedBooking.user === "object"
                    ? selectedBooking.user?.name
                    : selectedBooking.user || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {typeof selectedBooking.user === "object"
                    ? selectedBooking.user?.phone
                    : selectedBooking.user || "N/A"}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800">
                  {selectedBooking.date
                    ? moment(selectedBooking.date).format("MMM DD, YYYY")
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800">
                  {selectedBooking.time
                    ? formatTo12Hour(selectedBooking.time)
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Created At */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Created At:{" "}
                <span className="font-medium text-gray-800">
                  {moment(selectedBooking.createdAt).format("MMM DD YYYY") ||
                    "N/A"}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filters Container */}
      <div className="flex flex-col md:flex-row gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Left side: Search */}
        <div className="flex-1 min-w-0">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by user, phone, class, location..."
              value={setSearch ? search : localSearch}
              onChange={handleSearchInputChange}
              className="w-full sm:w-80 pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
            />
            {(setSearch ? search : localSearch) && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Right side: Date Range Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Date Range:
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
              />
            </div>

            <span className="text-gray-500 text-center sm:inline hidden">
              to
            </span>
            <span className="text-gray-500 text-center sm:hidden">↓</span>

            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl shadow-sm border border-gray-200 bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr>
                <TableHeader
                  icon={<Package className="w-4 h-4 text-blue-600" />}
                  label="Class"
                />
                <TableHeader
                  icon={<User className="w-4 h-4 text-blue-600" />}
                  label="Customer"
                />
                <TableHeader
                  icon={<User className="w-4 h-4 text-blue-600" />}
                  label="Booked By"
                />
                <TableHeader
                  icon={<CreditCard className="w-4 h-4 text-blue-600" />}
                  label="Payment"
                />
                <TableHeader
                  icon={<Calendar className="w-4 h-4 text-blue-600" />}
                  label="Date"
                />
                <TableHeader
                  icon={<Clock className="w-4 h-4 text-blue-600" />}
                  label="Time"
                />
                <TableHeader
                  icon={<MapPin className="w-4 h-4 text-blue-600" />}
                  label="Location"
                />
                <TableHeader
                  icon={<Calendar className="w-4 h-4 text-blue-600" />}
                  label="Created At"
                />
                <TableHeader
                  icon={<CalendarDays className="w-4 h-4 text-blue-600" />}
                  label="Actions"
                />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBookings?.map((booking) => {
                const userData = booking.user;
                const location = booking.location;
                const classNames = Array.isArray(booking.class)
                  ? booking.class.length > 0
                    ? booking.class
                        .map((c) => c?.name)
                        .filter(Boolean)
                        .join(", ")
                    : null
                  : booking.class?.name || null;
                const displayName =
                  classNames || booking.package?.name || "N/A";

                // Get time for this specific booking
                const index = parseInt(booking._id.split("-")[1]) || 0;
                const time = booking.time;
                const displayTime = Array.isArray(time)
                  ? time[index % time.length]
                  : time;

                // Check if reschedule is available
                const allAvailabilities = Array.isArray(booking.class)
                  ? booking.class.flatMap((c) => c?.availability || [])
                  : booking.class?.availability || [];
                const isCurrentSame =
                  moment(booking?.date).format("DD-MM-YYYY") !==
                  moment(Date.now()).format("DD-MM-YYYY");
                const isThreeHoursBefore =
                  moment(booking?.date).diff(moment(Date.now()), "hours") > 3;
                const isEditable =
                  isCurrentSame &&
                  isThreeHoursBefore &&
                  allAvailabilities.length > 0;

                return (
                  <tr
                    key={booking._id}
                    className="hover:bg-blue-50/50 transition-colors duration-200"
                  >
                    {/* Class */}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col justify-center h-full">
                        <span className="text-sm font-medium text-gray-800">
                          {displayName}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col justify-center h-full">
                        <span className="text-sm font-medium text-gray-800">
                          {userData?.name || "N/A"}
                        </span>
                        <span className="text-xs text-gray-600">
                          {userData?.phone || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Booked By */}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col justify-center h-full">
                        <span
                          className={`text-sm font-medium ${booking.isBookedByAdmin ? "text-blue-600" : "text-gray-800"}`}
                        >
                          {booking.isBookedByAdmin ? "Admin" : "User"}
                        </span>
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <PaymentCell
                        row={booking}
                        handleupdateBookingPartialAmount={
                          handleupdateBookingPartialAmount
                        }
                      />
                    </td>

                    {/* Date */}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-800">
                        {booking.date
                          ? moment
                              .utc(booking.date)
                              .local()
                              .format("DD-MM-YYYY")
                          : "N/A"}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col justify-center h-full">
                        <span className="text-sm font-medium text-gray-800">
                          {displayTime
                            ? convertTo12HourFormat(displayTime)
                            : "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col justify-center h-full">
                        <span className="text-sm font-medium text-gray-800">
                          {location?.name || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-800">
                        {moment(
                          booking.createdAt?.$date || booking.createdAt,
                        ).format("DD-MM-YYYY")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isEditable ? (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setModal(true);
                              getClassById(booking?.class?._id);
                            }}
                            className="p-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Reschedule"
                          >
                            <CalendarDays className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 px-2 hidden sm:inline">
                            {allAvailabilities.length === 0
                              ? "No slots"
                              : "Ended"}
                          </span>
                        )}

                        <button
                          onClick={() => confirmDelete(booking._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {(!paginatedBookings || paginatedBookings.length === 0) && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {currentSearch ||
              fromDate ||
              toDate !== moment().add(7, "days").format("YYYY-MM-DD")
                ? "No bookings match your search/filters"
                : "No bookings found"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {currentSearch ||
              fromDate ||
              toDate !== moment().add(7, "days").format("YYYY-MM-DD")
                ? "Try adjusting your search or filters"
                : "Try adjusting your filters"}
            </p>
            {(currentSearch ||
              fromDate ||
              toDate !== moment().add(7, "days").format("YYYY-MM-DD")) && (
              <button
                onClick={() => {
                  clearSearch();
                  setFromDate(
                    moment()
                      .add(-7, "days")
                      .startOf("day")
                      .format("YYYY-MM-DD"),
                  );
                  setToDate(
                    moment().add(7, "days").startOf("day").format("YYYY-MM-DD"),
                  );
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

            {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 md:px-6 py-4 rounded-xl shadow-sm border border-gray-200 gap-4 mt-4">
        <div className="flex items-center gap-4 text-sm text-gray-600 text-center md:text-left">
          <span>
            Showing {totalRecords > 0 ? (activePage - 1) * activeLimit + 1 : 0} to{" "}
            {Math.min(activePage * activeLimit, totalRecords)} of {totalRecords} bookings
          </span>
          {setLimit && (
            <select
              value={activeLimit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                if (setPage) setPage(1);
              }}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-center gap-1 order-2 sm:order-1">
            <button
              onClick={() => setPage && setPage(1)}
              disabled={activePage === 1}
              className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="First page"
            >
              «
            </button>
            <button
              onClick={() => setPage && setPage(Math.max(activePage - 1, 1))}
              disabled={activePage === 1}
              className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (activePage <= 3) {
                  pageNum = i + 1;
                } else if (activePage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = activePage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage && setPage(pageNum)}
                    className={`min-w-[32px] px-2 py-1.5 rounded-lg transition-colors text-sm ${
                      activePage === pageNum
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage && setPage(Math.min(activePage + 1, totalPages))}
              disabled={activePage >= totalPages}
              className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage && setPage(totalPages)}
              disabled={activePage >= totalPages}
              className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Last page"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && <BookingDetailsModal />}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setBookingToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Booking"
        message="Do you really want to delete this booking? This action cannot be undone."
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
      {/* Reschedule Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <RescheduleModal
              selectedBooking={selectedBooking}
              handleModalClose={() => setModal(false)}
              fetchData={fetchData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsTable;
