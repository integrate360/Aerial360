import React, { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
} from "date-fns";
import {
  getPackages,
  getAllUsers,
  bookingforadmin,
  getAllLocations,
} from "../../Apis/ApiCalls";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  CalendarIcon,
  Clock,
  MapPin,
  Package,
  User,
  DollarSign,
  CheckCircle,
  Plus,
  Search,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-toastify";

const daysOfWeek = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

const DAYS_OF_WEEK = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

const CalendarView = ({
  selectedDate,
  onDateSelect,
  availability,
  disableAllExceptSelected = false,
}) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const getCalendarWeeks = (month) => {
    const date = new Date(currentYear, month);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const startDate =
      start.getDay() === 0 ? start : subDays(start, start.getDay());
    const endDate = end.getDay() === 6 ? end : addDays(end, 6 - end.getDay());

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  const getDayAvailability = (date) => {
    const dayName = format(date, "EEEE");
    const dayNumber = date.getDay().toString();
    return availability.find(
      (a) =>
        daysOfWeek[a.day.toString()] === dayName ||
        a.day.toString() === dayNumber,
    );
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => setCurrentYear((prev) => prev - 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">{currentYear}</h3>
        <button
          type="button"
          onClick={() => setCurrentYear((prev) => prev + 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month) => {
          const weeks = getCalendarWeeks(month);
          return (
            <div
              key={month}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow duration-200 bg-white"
            >
              <h4 className="text-sm font-semibold text-gray-800 mb-3 text-center">
                {format(new Date(currentYear, month), "MMMM")}
              </h4>

              <div className="grid grid-cols-7 gap-0.5">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="text-center py-1">
                      <span className="text-xs font-medium text-gray-500">
                        {day}
                      </span>
                    </div>
                  ),
                )}

                {weeks.map((week, weekIndex) => (
                  <React.Fragment key={weekIndex}>
                    {week.map((date, dayIndex) => {
                      const available = !!getDayAvailability(date);
                      const isSelected =
                        selectedDate && isSameDay(date, selectedDate);
                      const isCurrentMonth = isSameMonth(
                        date,
                        new Date(currentYear, month),
                      );
                      const isDisabled =
                        !available ||
                        !isCurrentMonth ||
                        (disableAllExceptSelected &&
                          !!selectedDate &&
                          !isSelected);

                      return (
                        <div key={dayIndex} className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => available && onDateSelect(date)}
                            disabled={isDisabled}
                            className={`
                              w-7 h-7 rounded-md text-xs font-medium transition-all duration-200
                              flex items-center justify-center
                              ${
                                isSelected
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : available
                                    ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                                    : "bg-gray-50 text-gray-400 border border-gray-200"
                              }
                              ${!isCurrentMonth ? "opacity-50" : ""}
                              ${
                                isDisabled && !isSelected
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer"
                              }
                            `}
                          >
                            {format(date, "d")}
                          </button>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BookingForm = ({ onClose, onSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDayAvailability, setSelectedDayAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isPartial, setIsPartial] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    packageId: "",
    amount: 0,
    partialAmount: "",
    time: "",
    day: "",
    locationId: "",
    serviceId: "",
  });
  const [savedBookings, setSavedBookings] = useState([]);
  const [selectedPackageDays, setSelectedPackageDays] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const [pkgRes, userRes, locationsRes] = await Promise.all([
          getPackages(),
          getAllUsers(),
          getAllLocations(),
        ]);
        if (pkgRes?.status === 200) setPackages(pkgRes.data);
        if (userRes?.status === 200) {
          setUsers(userRes.data);
          setFilteredUsers(userRes.data);
        }
        if (locationsRes?.status === 200) setLocations(locationsRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Failed to load form data");
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userSearch.trim() === "") {
      setFilteredUsers(users); // Show only first 10 users by default
    } else {
      const searchTerm = userSearch.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.includes(searchTerm),
      );
      setFilteredUsers(filtered.slice(0, 10)); // Limit to 10 results
    }
  }, [userSearch, users]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData({ ...formData, userId: user._id });
    setUserSearch("");
    setShowUserDropdown(false);
    toast.error(null);
  };

  const handlePackageChange = (e) => {
    const selectedPackage = packages.find((pkg) => pkg._id === e.target.value);
    setFormData({
      ...formData,
      packageId: e.target.value,
      serviceId: "",
      amount: selectedPackage?.price || 0,
      time: "",
      day: "",
      locationId: "",
    });
    setSelectedPackageDays(selectedPackage?.days || 0);
    setSelectedService(null);
    setSelectedDayAvailability(null);
    setSelectedDate(null);
    setSavedBookings([]);
  };

  const handleSaveBooking = () => {
    // Validate user is selected
    if (!formData.userId) {
      toast.error("Please select a user first");
      setTimeout(() => toast.error(null), 2000);
      return;
    }

    if (
      !selectedDate ||
      !formData.time ||
      !formData.serviceId ||
      !selectedService ||
      !formData.locationId
    ) {
      toast.error(
        "Please select date, time, service, and location before saving",
      );
      setTimeout(() => toast.error(null), 2000);
      return;
    }

    const location = locations.find((loc) => loc._id === formData.locationId);
    if (!location) {
      toast.error("Selected location not found");
      setTimeout(() => toast.error(null), 2000);
      return;
    }

    const newBooking = {
      date: selectedDate,
      day: formData.day || "",
      time: formData.time,
      serviceId: formData.serviceId,
      serviceName: selectedService.name,
      locationId: formData.locationId,
      locationName: location.name,
    };

    setSavedBookings([...savedBookings, newBooking]);
    setSelectedDate(null);
    setFormData((prev) => ({ ...prev, time: "", day: "", locationId: "" }));
    setSelectedDayAvailability(null);
    toast.error(null);
  };

  const handleDeleteBooking = (index) => {
    setSavedBookings(savedBookings.filter((_, i) => i !== index));
  };

  const handleEditBooking = (index) => {
    // Validate user is selected
    if (!formData.userId) {
      toast.error("Please select a user first");
      setTimeout(() => toast.error(null), 2000);
      return;
    }

    const bookingToEdit = savedBookings[index];
    setSelectedDate(bookingToEdit.date);
    setFormData((prev) => ({
      ...prev,
      day: bookingToEdit.day,
      time: bookingToEdit.time,
      serviceId: bookingToEdit.serviceId,
      locationId: bookingToEdit.locationId,
    }));

    const service = packages
      .find((p) => p._id === formData.packageId)
      ?.services?.find((s) => s._id === bookingToEdit.serviceId);

    if (service) {
      setSelectedService(service);
      const dayName = format(bookingToEdit.date, "EEEE");
      const dayNumber = bookingToEdit.date.getDay().toString();
      const availabilityEntry = service.availability?.find(
        (a) =>
          daysOfWeek[a.day.toString()] === dayName ||
          a.day.toString() === dayNumber,
      );
      setSelectedDayAvailability(availabilityEntry || null);
    }

    handleDeleteBooking(index);
  };

  const handleServiceChange = (e) => {
    // Validate user is selected
    if (!formData.userId) {
      toast.error("Please select a user first");
      setTimeout(() => toast.error(null), 2000);
      return;
    }

    const service = packages
      .find((p) => p._id === formData.packageId)
      ?.services?.find((s) => s._id === e.target.value);

    setFormData({
      ...formData,
      serviceId: e.target.value,
      day: "",
      time: "",
      locationId: "",
    });
    setSelectedService(service || null);
    setSelectedDayAvailability(null);
    setSelectedDate(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.error(null);

    try {
      // Validate all required fields
      if (!formData.userId) throw new Error("Please select a user");
      if (!formData.packageId) throw new Error("Please select a package");
      if (savedBookings.length === 0)
        throw new Error("Please save at least one booking");

      const amount = isPartial
        ? parseFloat(formData.partialAmount || "0")
        : formData.amount;
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");
      if (isPartial && amount > formData.amount)
        throw new Error("Partial amount exceeds total");

      const payload = {
        ...formData,
        amount: formData.amount,
        partialAmount: amount,
        dates: savedBookings.map((b) => b.date),
        times: savedBookings.map((b) => b.time),
        serviceIds: savedBookings.map((b) => b.serviceId),
        locationId: savedBookings.map((b) => b.locationId),
        user: selectedUser?.name || "",
        package:
          packages.find((pkg) => pkg._id === formData.packageId)?.name || "",
      };

      const res = await bookingforadmin(payload);
      if (res?.status === 200 || res?.status === 201) {
        toast.success(
          `Successfully created ${savedBookings.length} booking${savedBookings.length !== 1 ? "s" : ""}!`,
        );

        // Reset form
        setFormData({
          userId: "",
          packageId: "",
          amount: 0,
          partialAmount: "",
          time: "",
          day: "",
          locationId: "",
          serviceId: "",
        });
        setSelectedUser(null);
        setSelectedDate(null);
        setSelectedService(null);
        setSelectedDayAvailability(null);
        setSavedBookings([]);
        setUserSearch("");
        setIsPartial(false);
        setShowUserDropdown(false);

        await onSuccess();
        onClose();
      } else {
        throw new Error(res?.data?.message || "Booking failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
      setTimeout(() => toast.error(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) return "Invalid Time";
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  if (isFetching) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-xl p-8 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-800">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Create New Booking
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Saved Bookings */}
          {savedBookings.length > 0 && (
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Saved Bookings ({savedBookings.length}/{selectedPackageDays}{" "}
                    slots)
                  </h3>
                  {selectedPackageDays > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Package includes {selectedPackageDays} sessions
                    </p>
                  )}
                </div>
                {savedBookings.length === selectedPackageDays && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      All sessions selected
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {savedBookings.map((booking, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CalendarIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-800">
                            {format(booking.date, "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-700">
                            {formatTimeDisplay(booking.time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {booking.locationName}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditBooking(index)}
                          disabled={!formData.userId}
                          className={`p-1 rounded transition-colors duration-200 ${
                            !formData.userId
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:bg-blue-50"
                          }`}
                          title="Edit booking"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                          title="Delete booking"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* User Selection - Updated to match ClassForm style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    User <span className="text-red-500">*</span>
                  </div>
                </label>

                {selectedUser ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedUser.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {selectedUser.name}
                          </div>
                          {selectedUser.email && (
                            <div className="text-xs text-gray-600 mt-1">
                              {selectedUser.email}
                            </div>
                          )}
                          {selectedUser.phone && (
                            <div className="text-xs text-gray-600">
                              {selectedUser.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null);
                          setFormData({ ...formData, userId: "" });
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search user by name, email, or phone..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onFocus={() => setShowUserDropdown(true)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {showUserDropdown ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {showUserDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              key={user._id}
                              onClick={() => handleUserSelect(user)}
                              className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-800 truncate">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Package Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Package <span className="text-red-500">*</span>
                  </div>
                </label>
                <select
                  value={formData.packageId}
                  onChange={handlePackageChange}
                  disabled={!formData.userId}
                  className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !formData.userId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  required
                >
                  <option value="">Select a package</option>
                  {packages.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.name} - ₹{pkg.price?.toLocaleString()}
                    </option>
                  ))}
                </select>
                {!formData.userId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a user first
                  </p>
                )}
              </div>

              {/* Service Selection */}
              {formData.packageId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.serviceId || ""}
                    onChange={handleServiceChange}
                    disabled={!formData.userId}
                    className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !formData.userId ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    required
                  >
                    <option value="">Select a service</option>
                    {packages
                      .find((p) => p._id === formData.packageId)
                      ?.services?.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px]">₹</p>
                    Total Amount <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: Number(e.target.value),
                    })
                  }
                  disabled={!formData.userId || !formData.packageId}
                  className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !formData.userId || !formData.packageId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  required
                />
              </div>
            </div>

            {/* Calendar View */}
            {selectedService?.availability && formData.userId && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Select Date
                </h3>
                <CalendarView
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    if (!formData.userId) {
                      toast.error("Please select a user first");
                      setTimeout(() => toast.error(null), 2000);
                      return;
                    }

                    if (selectedDate && isSameDay(date, selectedDate)) {
                      setSelectedDate(null);
                      setFormData((prev) => ({
                        ...prev,
                        day: "",
                        time: "",
                        locationId: "",
                      }));
                      setSelectedDayAvailability(null);
                      return;
                    }

                    const dayName = format(date, "EEEE");
                    const dayNumber = date.getDay().toString();
                    const availabilityEntry =
                      selectedService.availability?.find(
                        (a) =>
                          daysOfWeek[a.day.toString()] === dayName ||
                          a.day.toString() === dayNumber,
                      );

                    if (availabilityEntry) {
                      setSelectedDate(date);
                      setFormData((prev) => ({
                        ...prev,
                        day: availabilityEntry.day.toString(),
                        time: "",
                        locationId: "",
                      }));
                      setSelectedDayAvailability(availabilityEntry);
                      toast.error(null);
                    }
                  }}
                  availability={selectedService.availability}
                  disableAllExceptSelected={!!selectedDate}
                />
              </div>
            )}

            {/* Time and Location Selection */}
            {selectedDayAvailability && formData.userId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <select
                    value={formData.time || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select time</option>
                    <option value={selectedDayAvailability.time}>
                      {formatTimeDisplay(selectedDayAvailability.time)}
                    </option>
                  </select>
                </div>

                {/* Location Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <select
                    value={formData.locationId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, locationId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select location</option>
                    {selectedDayAvailability.locations?.map((locationId) => {
                      const location = locations.find(
                        (loc) => loc._id === locationId,
                      );
                      return location ? (
                        <option key={location._id} value={location._id}>
                          {location.name}
                        </option>
                      ) : null;
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* Save Booking Button */}
            {selectedDayAvailability && formData.userId && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSaveBooking}
                  disabled={
                    !formData.time ||
                    !formData.locationId ||
                    savedBookings.length >= selectedPackageDays
                  }
                  className={`
                    px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
                    ${
                      savedBookings.length >= selectedPackageDays
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : !formData.time || !formData.locationId
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                    }
                  `}
                >
                  <Plus className="w-4 h-4" />
                  {savedBookings.length >= selectedPackageDays
                    ? "Maximum bookings reached"
                    : "Save Booking Slot"}
                </button>
              </div>
            )}

            {/* Partial Payment */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="partialPayment"
                  checked={isPartial}
                  onChange={(e) => {
                    setIsPartial(e.target.checked);
                    if (!e.target.checked)
                      setFormData({ ...formData, partialAmount: "" });
                  }}
                  disabled={!formData.userId}
                  className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 ${
                    !formData.userId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <label
                  htmlFor="partialPayment"
                  className={`text-sm font-medium ${
                    !formData.userId ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  Partial Payment
                </label>
              </div>

              {isPartial && formData.userId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partial Amount
                  </label>
                  <input
                    type="text"
                    min="0"
                    max={formData.amount}
                    value={formData.partialAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        partialAmount: e.target.value,
                      })
                    }
                    placeholder={`Enter amount (max: ₹${formData.amount.toLocaleString()})`}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={isPartial}
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading || savedBookings.length === 0 || !formData.userId
                }
                className={`
                  px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200
                  ${
                    loading || savedBookings.length === 0 || !formData.userId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Booking ({savedBookings.length} slot
                    {savedBookings.length !== 1 ? "s" : ""})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
