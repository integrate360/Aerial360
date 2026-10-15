import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  X,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import moment from "moment";
import { rescheduleBooking, showAvailability } from "../Apis/ApiCalls";

const RescheduleModal = ({ selectedBooking, handleModalClose, fetchData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [enabledDays, setEnabledDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Initialize with booking date
  useEffect(() => {
    if (selectedBooking?.date) {
      setSelectedDate(selectedBooking.date);
      setCurrentMonth(new Date(selectedBooking.date));
    }
  }, [selectedBooking]);

  useEffect(() => {
    setLoading(true);

    const classes = selectedBooking?.class
      ? Array.isArray(selectedBooking.class)
        ? selectedBooking.class
        : []
      : [];

    const allEnabledDays = classes.flatMap(
      (c) => c.availability?.map((slot) => slot.day) || [],
    );

    setEnabledDays([...new Set(allEnabledDays)]);
    setLoading(false);
  }, [selectedBooking]);

  useEffect(() => {
    if (selectedBooking && selectedDate) {
      const classes = selectedBooking.class
        ? Array.isArray(selectedBooking.class)
          ? selectedBooking.class
          : []
        : [];

      const classIds = classes.map((c) => c._id);

      Promise.all(
        classIds.map((classId) =>
          showAvailability(moment(selectedDate).format("DD-MM-YYYY"), classId),
        ),
      ).then((responses) => {
        const combinedAvailability = {
          slots: responses.flatMap((res) => res.slots),
        };
        processAvailabilityData(combinedAvailability);
      });
    } else {
      setAvailableTimes([]);
      setAvailableLocations([]);
    }
  }, [selectedDate]);

  const processAvailabilityData = (availability) => {
    if (availability && availability.slots) {
      const uniqueTimes = [
        ...new Set(availability.slots.map((slot) => slot.time)),
      ];
      setAvailableTimes(uniqueTimes);

      if (uniqueTimes.length > 0) {
        setSelectedTime(uniqueTimes[0]);
        updateLocationsForTime(uniqueTimes[0], availability.slots);
      }
    }
  };

  const updateLocationsForTime = (time, slots) => {
    const timeSlot = slots.find((slot) => slot.time === time);
    if (timeSlot) {
      const locations = timeSlot.locations.map((location) => ({
        ...location,
        key: location._id,
        value: location.name,
      }));
      setAvailableLocations(locations);
      setSelectedLocation(locations[0] || null);
    }
  };

  useEffect(() => {
    if (selectedTime && selectedBooking && selectedDate) {
      const classes = selectedBooking.class
        ? Array.isArray(selectedBooking.class)
          ? selectedBooking.class
          : []
        : [];

      const classIds = classes.map((c) => c._id);

      Promise.all(
        classIds.map((classId) =>
          showAvailability(moment(selectedDate).format("DD-MM-YYYY"), classId),
        ),
      ).then((responses) => {
        const combinedSlots = responses.flatMap((res) => res.slots);
        updateLocationsForTime(selectedTime, combinedSlots);
      });
    }
  }, [selectedTime]);

  const handleReschedule = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      setError(null);
      if (!selectedBooking?.id) throw new Error("Booking ID is undefined");

      const res = await rescheduleBooking(
        new Date(selectedDate),
        selectedBooking?.id,
        selectedBooking.date ? new Date(selectedBooking.date) : new Date(),
        {
          location: selectedLocation?._id ?? "",
          time: selectedTime,
        },
      );

      if (!res) throw new Error("Failed to reschedule booking");
      fetchData();
      handleModalClose();
    } catch (err) {
      console.error("Reschedule error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to reschedule booking",
      );
    } finally {
      setLoading(false);
    }
  };

  // Custom Calendar Functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date) => {
    const day = date.getDay();
    const dateIsPast = moment(date).isBefore(moment(), "day");
    return !enabledDays.includes(day) || dateIsPast;
  };

  const handleDateSelect = (date) => {
    if (!isDateDisabled(date)) {
      setSelectedDate(date.toISOString());
    }
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const formatTime12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const CustomCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled = isDateDisabled(date);
      const isSelected =
        selectedDate &&
        date.getDate() === new Date(selectedDate).getDate() &&
        date.getMonth() === new Date(selectedDate).getMonth() &&
        date.getFullYear() === new Date(selectedDate).getFullYear();
      const isToday = date.toDateString() === new Date().toDateString();
      const isEnabledDay = enabledDays.includes(date.getDay());

      const dayClasses = `
        h-12 flex items-center justify-center border rounded-lg cursor-pointer relative transition-all duration-200
        ${
          isDisabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : isSelected
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-md"
              : isToday
                ? "border-2 border-blue-400 bg-blue-50"
                : isEnabledDay
                  ? "hover:bg-blue-50 hover:border-blue-300 text-gray-800 border-gray-200"
                  : "text-gray-400 border-gray-200"
        }
        ${isEnabledDay && !isDisabled ? "font-medium" : ""}
      `;

      days.push(
        <div
          key={day}
          className={dayClasses}
          onClick={() => !isDisabled && handleDateSelect(date)}
        >
          {day}
          {isEnabledDay && !isDisabled && !isSelected && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          )}
          {isToday && !isSelected && !isDisabled && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600"></div>
          )}
        </div>,
      );
    }

    return (
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {months[month]} {year}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{days}</div>

        <div className="mt-6 pt-5 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Available Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700"></div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Dropdown = ({
    show,
    setShow,
    options,
    onSelect,
    getLabel = (option) => option?.toString() || "",
    placeholder = "Select...",
    value,
    disabled = false,
    error = "",
    icon: Icon,
  }) => {
    if (disabled) {
      return (
        <div className="relative">
          <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-gray-400" />}
            <span>{value ? getLabel(value) : placeholder}</span>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShow(!show)}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-left flex justify-between items-center transition-all duration-200
            ${
              error
                ? "border-red-500"
                : "border-gray-300 hover:border-blue-500 focus:border-blue-500"
            }
            ${disabled ? "cursor-not-allowed bg-gray-100" : "cursor-pointer"}
          `}
          disabled={disabled}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon
                className={`w-5 h-5 ${disabled ? "text-gray-400" : "text-gray-500"}`}
              />
            )}
            <span
              className={value ? "text-gray-800 font-medium" : "text-gray-500"}
            >
              {value ? getLabel(value) : placeholder}
            </span>
          </div>
          <span
            className={`text-sm ${disabled ? "text-gray-400" : "text-gray-500"}`}
          >
            ▼
          </span>
        </button>

        {show && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShow(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {options && options.length > 0 ? (
                options.map((option, index) => (
                  <div
                    key={option._id || index}
                    onClick={() => {
                      onSelect(option);
                      setShow(false);
                    }}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  >
                    {getLabel(option)}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No options available
                </div>
              )}
            </div>
          </>
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <h3 className="text-lg font-semibold text-gray-800 mt-6">
              Loading Availability...
            </h3>
            <p className="text-gray-600 text-center mt-2">
              Please wait while we fetch available slots
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={handleModalClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Reschedule Booking
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select a new date, time, and location
                </p>
              </div>
            </div>
            <button
              onClick={handleModalClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700">Error</p>
              <p className="text-red-600 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* Current Booking Info */}
          {selectedBooking && (
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Current Booking Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Class/Package</p>
                  <p className="text-gray-800 font-medium">
                    {selectedBooking?.package?.name ??
                      (typeof selectedBooking?.class === "object"
                        ? selectedBooking.class?.name
                        : selectedBooking?.class) ??
                      "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Current Date</p>
                  <p className="text-gray-800 font-medium">
                    {selectedBooking.date
                      ? moment(selectedBooking.date).format("MMM DD, YYYY")
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Current Time</p>
                  <p className="text-gray-800 font-medium">
                    {selectedBooking.time
                      ? formatTime12Hour(selectedBooking.time)
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-800 font-medium">
                    {selectedBooking.location?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Calendar */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Select New Date
              </h3>
              <CustomCalendar />
              {selectedDate && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 font-medium flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Selected:{" "}
                    <span className="font-bold">
                      {moment(selectedDate).format("MMMM DD, YYYY")}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Time & Location Selection */}
            <div className="space-y-6">
              {/* Time Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Select Time
                </h3>
                <Dropdown
                  show={showTimeDropdown}
                  setShow={setShowTimeDropdown}
                  options={availableTimes}
                  onSelect={(time) => setSelectedTime(time)}
                  getLabel={(time) => formatTime12Hour(time)}
                  placeholder="Select Time"
                  value={selectedTime}
                  disabled={!selectedDate}
                  icon={Clock}
                />
                {!selectedDate && (
                  <p className="text-yellow-600 text-sm mt-2">
                    Please select a date first to view available times
                  </p>
                )}
                {selectedDate && availableTimes.length === 0 && (
                  <p className="text-gray-600 text-sm mt-2">
                    No available time slots for the selected date
                  </p>
                )}
              </div>

              {/* Location Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Select Location
                </h3>
                <Dropdown
                  show={showLocationDropdown}
                  setShow={setShowLocationDropdown}
                  options={availableLocations}
                  onSelect={(location) => setSelectedLocation(location)}
                  getLabel={(location) => location?.name || ""}
                  placeholder="Select Location"
                  value={selectedLocation}
                  disabled={!selectedTime}
                  icon={MapPin}
                />
              </div>

              {/* Summary Card */}
              {(selectedDate || selectedTime || selectedLocation) && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    New Booking Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedDate && (
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-700 font-medium">
                          Date
                        </p>
                        <p className="text-gray-800 font-bold mt-1">
                          {moment(selectedDate).format("MMM DD, YYYY")}
                        </p>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-700 font-medium">
                          Time
                        </p>
                        <p className="text-gray-800 font-bold mt-1">
                          {formatTime12Hour(selectedTime)}
                        </p>
                      </div>
                    )}
                    {selectedLocation && (
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-700 font-medium">
                          Location
                        </p>
                        <p className="text-gray-800 font-bold mt-1">
                          {selectedLocation.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReschedule}
              disabled={
                !selectedDate || !selectedTime || !selectedLocation || loading
              }
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Reschedule Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
