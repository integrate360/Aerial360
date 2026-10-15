import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import {
  showAvailability,
  createMultipleBookings,
  getExistingBookingsCount,
} from "../../Apis/ApiCalls";
import {
  Calendar,
  Clock,
  MapPin,
  X,
  Check,
  AlertCircle,
  Loader2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ConfirmationModal from "../../layouts/ConfirmationModal";

const ClassBookingModal = ({
  selectedBooking,
  handleModalClose,
  fetchData,
  isNewBooking = false,
  remainingSlots = 0,
  selectedServiceId,
  selectedServiceData,
}) => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLoading, setTimeLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [people] = useState(1);
  const maxSelectableDates = remainingSlots;

  // date wise one-click selected slot
  const [dateSelections, setDateSelections] = useState({});
  // date wise previewed slots from backend
  const [slotAvailability, setSlotAvailability] = useState({});

  useEffect(() => {
    if (selectedServiceData && selectedServiceData.availability) {
      generateAvailableDatesFromServiceData();
    } else if (selectedServiceId || selectedBooking?.class?._id) {
      fetchAvailableDatesFromServiceData();
    }
  }, [selectedServiceId, selectedBooking, selectedServiceData]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate]);

  const getClassId = () => selectedServiceId || selectedBooking?.class?._id;

  const getPackageExpiryDate = () => {
    if (selectedBooking?.extendedValidityEndDate) {
      return moment(selectedBooking.extendedValidityEndDate).endOf("day");
    }
    if (selectedBooking?.validityEndDate) {
      return moment(selectedBooking.validityEndDate).endOf("day");
    }
    if (selectedBooking?.createdAt) {
      const duration = selectedBooking.packageDuration || selectedBooking.package?.duration || 30;
      return moment(selectedBooking.createdAt).add(duration, "days").endOf("day");
    }
    return null;
  };

  const generateAvailableDatesFromServiceData = () => {
    try {
      if (!selectedServiceData?.availability) return;

      const availableDays = selectedServiceData.availability.map((slot) =>
        Number(slot.day),
      );

      const packageExpiry = getPackageExpiryDate();
      const startDate = moment().subtract(1, "year");
      const defaultEndDate = moment().add(1, "year");
      const endDate = packageExpiry && packageExpiry.isBefore(defaultEndDate) ? packageExpiry : defaultEndDate;
      const dates = [];

      for (
        let date = startDate.clone();
        date.isSameOrBefore(endDate);
        date.add(1, "day")
      ) {
        const dayOfWeek = date.isoWeekday();
        if (availableDays.includes(dayOfWeek)) {
          dates.push(date.format("DD-MM-YYYY"));
        }
      }

      setAvailableDates(dates);
    } catch (error) {
      console.error("Error generating available dates:", error);
      toast.error("Error loading available dates");
    }
  };

  const fetchAvailableDatesFromServiceData = async () => {
    try {
      const serviceId = getClassId();
      if (!serviceId) return;

      const packageExpiry = getPackageExpiryDate();
      const startDate = moment().subtract(1, "year").startOf("year");
      const defaultEndDate = moment().add(1, "year").endOf("year");
      const endDate = packageExpiry && packageExpiry.isBefore(defaultEndDate) ? packageExpiry : defaultEndDate;
      const dates = [];

      for (
        let date = startDate.clone();
        date.isSameOrBefore(endDate);
        date.add(1, "day")
      ) {
        try {
          const formattedDate = date.format("DD-MM-YYYY");
          const response = await showAvailability(formattedDate, serviceId);

          if (response?.data?.slots?.length > 0) {
            dates.push(formattedDate);
          }
        } catch (error) {
          continue;
        }
      }

      setAvailableDates(dates);
    } catch (error) {
      console.error("Error fetching available dates:", error);
      toast.error("Error loading available dates");
    }
  };

  const normalizeLocations = (slot) => {
    if (!Array.isArray(slot?.locations)) return [];
    return slot.locations.map((loc) => {
      if (typeof loc === "string") {
        return {
          _id: loc,
          name: "Location",
          address: "",
        };
      }
      return loc;
    });
  };

  const fetchAvailability = async (dateMoment) => {
    if (!dateMoment) return;

    setTimeLoading(true);
    try {
      const formattedDate = dateMoment.format("DD-MM-YYYY");
      const dayOfWeek = dateMoment.isoWeekday();

      let formattedSlots = [];

      if (selectedServiceData?.availability) {
        const daySlots = selectedServiceData.availability.filter(
          (slot) => Number(slot.day) === Number(dayOfWeek),
        );

        formattedSlots = daySlots.map((slot) => ({
          time: slot.time,
          duration: slot.duration,
          maxPeople: slot.maxPeople,
          locations: normalizeLocations(slot),
          trainers: slot.trainers || [],
          _id: slot._id,
          people: 0,
          day: slot.day,
        }));
      } else {
        const serviceId = getClassId();
        const response = await showAvailability(formattedDate, serviceId);
        formattedSlots = (response?.data?.slots || []).map((slot) => ({
          ...slot,
          locations: normalizeLocations(slot),
        }));
      }

      setAvailability(formattedSlots);

      if (formattedSlots.length > 0) {
        await previewAllSlotsForDate(dateMoment, formattedSlots);
      } else {
        const dateKey = dateMoment.format("DD-MM-YYYY");
        setSlotAvailability((prev) => ({
          ...prev,
          [dateKey]: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to fetch availability");
      setAvailability([]);
    } finally {
      setTimeLoading(false);
    }
  };

  const previewAllSlotsForDate = async (dateMoment, slotsForDate) => {
    try {
      const classId = getClassId();
      const dateKey = dateMoment.format("DD-MM-YYYY");
      const apiDate = dateMoment.format("YYYY-MM-DD");

      if (!classId || !slotsForDate?.length) {
        setSlotAvailability((prev) => ({
          ...prev,
          [dateKey]: [],
        }));
        return;
      }

      const uniqueTimes = [
        ...new Set(slotsForDate.map((slot) => slot.time).filter(Boolean)),
      ];

      const uniqueLocationIds = [
        ...new Set(
          slotsForDate.flatMap((slot) =>
            (slot.locations || []).map((loc) => loc?._id).filter(Boolean),
          ),
        ),
      ];

      if (!uniqueTimes.length || !uniqueLocationIds.length) {
        setSlotAvailability((prev) => ({
          ...prev,
          [dateKey]: [],
        }));
        return;
      }

      setPreviewLoading(true);

      const res = await getExistingBookingsCount({
        classId,
        date: apiDate,
        times: uniqueTimes,
        locationIds: uniqueLocationIds,
      });

      const backendSlots = res?.data?.slots || res?.slots || [];

      // keep only valid combinations that actually belong to this date's availability
      const validMap = new Set();
      slotsForDate.forEach((slot) => {
        (slot.locations || []).forEach((loc) => {
          validMap.add(`${slot.time}__${loc._id}`);
        });
      });

      const mergedSlots = backendSlots
        .filter((slot) => validMap.has(`${slot.time}__${slot.location}`))
        .map((slot) => {
          const localSlot = slotsForDate.find((s) => s.time === slot.time);
          const localLocation = localSlot?.locations?.find(
            (loc) => String(loc._id) === String(slot.location),
          );

          return {
            ...slot,
            locationName:
              localLocation?.name || slot.locationName || slot.location,
            locationAddress: localLocation?.address || "",
            duration: localSlot?.duration || 60,
          };
        });

      setSlotAvailability((prev) => ({
        ...prev,
        [dateKey]: mergedSlots,
      }));
    } catch (error) {
      console.error("Error previewing slots:", error);
      toast.error("Failed to preview slots");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDateSelect = async (date) => {
    const dateStr = date.format("DD-MM-YYYY");

    const packageExpiry = getPackageExpiryDate();
    if (packageExpiry && date.isAfter(packageExpiry, "day")) {
      toast.error(`Cannot select date after package expiry date (${packageExpiry.format("DD-MM-YYYY")})`);
      return;
    }

    if (!availableDates.includes(dateStr)) {
      toast.error("This date is not available for booking");
      return;
    }

    const isAlreadySelected = selectedDates.some((d) => d.isSame(date, "day"));

    // allow removing already selected date
    if (isAlreadySelected) {
      const newSelectedDates = selectedDates.filter(
        (d) => !d.isSame(date, "day"),
      );
      setSelectedDates(newSelectedDates);

      const newSelections = { ...dateSelections };
      delete newSelections[dateStr];
      setDateSelections(newSelections);

      if (newSelectedDates.length > 0) {
        setSelectedDate(newSelectedDates[0]);
      } else {
        setSelectedDate(date);
      }

      toast.info("Date removed from selection");
      return;
    }

    // block selecting next date if any previous selected date is still pending
    const pendingDate = selectedDates.find((d) => {
      const key = d.format("DD-MM-YYYY");
      const selection = dateSelections[key];
      return !(selection && selection.time && selection.location);
    });

    if (pendingDate) {
      toast.error(
        `Please complete slot selection for ${pendingDate.format("DD MMM YYYY")} before selecting another date`,
      );
      setSelectedDate(pendingDate);
      return;
    }

    if (selectedDates.length >= maxSelectableDates) {
      toast.error(`Maximum ${maxSelectableDates} dates allowed`);
      return;
    }

    setSelectedDates((prev) => [...prev, date]);
    setSelectedDate(date);
  };

  const handleSlotCardSelect = (slot) => {
    const dateStr = moment(slot.date, "YYYY-MM-DD").format("DD-MM-YYYY");

    if (!slot.bookingAvailable) {
      toast.error(slot.message || "This slot is fully booked");
      return;
    }

    setDateSelections((prev) => ({
      ...prev,
      [dateStr]: {
        time: slot.time,
        location: slot.location,
        locationName: slot.locationName,
        locationAddress: slot.locationAddress,
        duration: slot.duration || 60,
        bookingAvailable: slot.bookingAvailable,
        message: slot.message,
        capacity: Number(slot.capacity || 0),
        occupiedSeats: Number(slot.occupiedSeats || 0),
        remainingSeats: Number(slot.remainingSeats || 0),
        selectedClass: slot.selectedClass || null,
      },
    }));

    toast.success(
      `Selected ${formatTimeDisplay(slot.time)} - ${slot.locationName || "Location"} for ${moment(slot.date).format("DD MMM YYYY")}`,
    );
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date from the calendar");
      return;
    }

    const incompleteDates = selectedDates.filter((date) => {
      const dateStr = date.format("DD-MM-YYYY");
      const selection = dateSelections[dateStr];
      return !(selection && selection.time && selection.location);
    });

    if (incompleteDates.length > 0) {
      toast.error(`Please select a slot for ${incompleteDates.length} date(s)`);
      if (incompleteDates[0]) {
        setSelectedDate(incompleteDates[0]);
        const slotSection = document.querySelector(".time-slots-section");
        if (slotSection) {
          slotSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    const userId = selectedBooking?.user?._id;
    if (!userId) {
      toast.error("User information is missing. Please try again.");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    try {
      setLoading(true);

      const userId = selectedBooking?.user?._id;
      if (!userId) {
        toast.error("User information is missing.");
        return;
      }

      const bookingsPayload = {
        bookings: selectedDates.map((date) => {
          const dateStr = date.format("DD-MM-YYYY");
          const selection = dateSelections[dateStr];

          if (!selection?.time || !selection?.location) {
            throw new Error(`Missing slot selection for ${dateStr}`);
          }

          return {
            user: userId,
            dates: [date.clone().startOf("day").toISOString()],
            location: selection.location,
            time: selection.time,
            duration: selection.duration || 60,
            trainer: "",
            amount: selectedBooking.amount,
            people,
            classId: getClassId(),
            package: selectedBooking.package,
            uuid: selectedBooking.uuid,
          };
        }),
        uPackageId: selectedBooking._id,
      };

      const response = await createMultipleBookings(bookingsPayload);

      if (response?.success) {
        toast.success(`${selectedDates.length} classes booked successfully!`);
        fetchData();
        handleModalClose();
      } else {
        toast.error(response?.message || "Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error booking classes:", error);
      toast.error(`Failed to book classes: ${error.message}`);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const isDateDisabled = (date) => {
    const packageExpiry = getPackageExpiryDate();
    if (packageExpiry && date.isAfter(packageExpiry, "day")) {
      return true;
    }
    if (availableDates.length > 0) {
      const formattedDate = date.format("DD-MM-YYYY");
      return !availableDates.includes(formattedDate);
    }
    return true;
  };

  const getDaysInMonth = (date) => {
    const startDate = date.clone().startOf("month").startOf("week");
    const endDate = date.clone().endOf("month").endOf("week");
    const days = [];
    let currentDate = startDate.clone();

    while (currentDate.isSameOrBefore(endDate, "day")) {
      days.push(currentDate.clone());
      currentDate.add(1, "day");
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, "month"));
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) return "Invalid Time";
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const handleCancelBooking = () => {
    if (selectedDates.length > 0 || Object.keys(dateSelections).length > 0) {
      setShowCancelModal(true);
    } else {
      handleModalClose();
    }
  };

  const confirmCancel = () => {
    handleModalClose();
  };

  const navigateToDate = (date) => {
    setSelectedDate(date);
    const slotSection = document.querySelector(".time-slots-section");
    if (slotSection) {
      slotSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const isConfirmButtonEnabled = () => {
    if (selectedDates.length === 0 || loading) return false;

    return selectedDates.every((date) => {
      const dateStr = date.format("DD-MM-YYYY");
      const selection = dateSelections[dateStr];
      return selection && selection.time && selection.location;
    });
  };

  const getCompletedDatesCount = () => {
    return selectedDates.filter((date) => {
      const dateStr = date.format("DD-MM-YYYY");
      const selection = dateSelections[dateStr];
      return selection && selection.time && selection.location;
    }).length;
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {currentMonth.format("MMMM YYYY")}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center py-1">
              <span className="text-xs font-medium text-gray-500">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const isDisabled = isDateDisabled(date);
            const isSelected = selectedDates.some((d) => d.isSame(date, "day"));
            const isCurrentMonth = date.month() === currentMonth.month();
            const formattedDate = date.format("DD-MM-YYYY");
            const isAvailable = availableDates.includes(formattedDate);
            const isSelectedDate = selectedDate.isSame(date, "day");
            const hasSelection =
              dateSelections[formattedDate]?.time &&
              dateSelections[formattedDate]?.location;

            return (
              <button
                key={index}
                onClick={() => {
                  if (!isDisabled) handleDateSelect(date);
                }}
                disabled={isDisabled}
                className={`
                  h-10 rounded-lg text-sm font-medium transition-all duration-200
                  flex flex-col items-center justify-center relative
                  ${!isCurrentMonth ? "text-gray-400" : "text-gray-700"}
                  ${isSelectedDate ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                  ${
                    isSelected
                      ? hasSelection
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      : isAvailable
                        ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                        : "bg-gray-50 text-gray-400 border border-gray-200"
                  }
                  ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                `}
              >
                {date.date()}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const currentDateKey = selectedDate.format("DD-MM-YYYY");
  const currentPreviewSlots = slotAvailability[currentDateKey] || [];
  const currentSelectedSlot = dateSelections[currentDateKey];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
          <div className="px-6 rounded-lg py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {isNewBooking ? "Book Remaining Classes" : "Reschedule Class"}
              </h2>
              {isNewBooking && remainingSlots > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Remaining slots:{" "}
                  <span className="font-semibold text-blue-600">
                    {remainingSlots}
                  </span>
                </p>
              )}
              {selectedServiceId && (
                <p className="text-sm text-blue-600 font-medium mt-1">
                  <CalendarDays className="w-4 h-4 inline mr-1" />
                  Service: {selectedBooking.class.name}
                </p>
              )}
            </div>
            <button
              onClick={handleCancelBooking}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Select Dates
                  </h3>
                  {selectedDates.length > 0 && (
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {selectedDates.length} selected
                    </span>
                  )}
                </div>

                {availableDates.length === 0 ? (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500">
                        Loading available dates...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {renderCalendar()}

                    {selectedDates.length > 0 && (
                      <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">
                            Selected Dates:
                          </h4>
                          <span className="text-sm text-gray-600">
                            {maxSelectableDates - selectedDates.length} dates
                            remaining to select
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {selectedDates.map((date, index) => {
                            const dateStr = date.format("DD-MM-YYYY");
                            const selection = dateSelections[dateStr];
                            const hasSlot =
                              selection?.time && selection?.location;
                            const isCurrent = selectedDate.isSame(date, "day");

                            return (
                              <div
                                key={index}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${hasSlot ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"} ${isCurrent ? "ring-2 ring-blue-400" : ""}`}
                              >
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">
                                  {date.format("DD MMM YYYY")}
                                </span>

                                {hasSlot ? (
                                  <>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                      Complete
                                    </span>
                                    <span className="text-xs text-gray-600">
                                      {formatTimeDisplay(selection.time)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                    Pending
                                  </span>
                                )}

                                <button
                                  onClick={() => navigateToDate(date)}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                  title="View this date's slots"
                                >
                                  <Clock className="w-3 h-3" />
                                </button>

                                <button
                                  onClick={() => handleDateSelect(date)}
                                  className="ml-1 text-red-600 hover:text-red-800"
                                  title="Remove this date"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {getCompletedDatesCount() < selectedDates.length && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                              <p className="text-sm text-yellow-700">
                                {selectedDates.length -
                                  getCompletedDatesCount()}{" "}
                                date(s) need slot selection
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="time-slots-section">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Available Slots for {selectedDate.format("DD MMM YYYY")}
                  </h3>
                </div>

                {timeLoading || previewLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                    <p className="text-gray-600">Loading slots...</p>
                  </div>
                ) : currentPreviewSlots.length === 0 ? (
                  <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {availableDates.includes(currentDateKey)
                          ? "No available slots for this day"
                          : "Please select an available date first"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-3">
                        Click one slot directly:
                      </p>

                      <div className="space-y-3">
                        {currentPreviewSlots.map((slot, index) => {
                          const isSelected =
                            currentSelectedSlot?.time === slot.time &&
                            currentSelectedSlot?.location === slot.location;

                          return (
                            <button
                              key={`${slot.date}-${slot.time}-${slot.location}-${index}`}
                              type="button"
                              onClick={() => handleSlotCardSelect(slot)}
                              disabled={!slot.bookingAvailable}
                              className={`
                                w-full text-left p-4 rounded-xl border transition-all duration-200
                                ${
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : slot.bookingAvailable
                                      ? "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                }
                              `}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-semibold">
                                      {formatTimeDisplay(slot.time)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                      {slot.locationName || slot.location}
                                    </span>
                                  </div>

                                  {slot.locationAddress && (
                                    <p
                                      className={`text-xs ${isSelected ? "text-blue-100" : "text-gray-500"}`}
                                    >
                                      {slot.locationAddress}
                                    </p>
                                  )}

                                  <div
                                    className={`mt-3 grid grid-cols-2 gap-3 text-sm ${isSelected ? "text-blue-100" : "text-gray-600"}`}
                                  >
                                    <p>
                                      <strong>Capacity:</strong> {slot.capacity}
                                    </p>
                                    <p>
                                      <strong>Occupied:</strong>{" "}
                                      {slot.occupiedSeats}
                                    </p>
                                    <p>
                                      <strong>Remaining:</strong>{" "}
                                      {slot.remainingSeats}
                                    </p>
                                    <p>
                                      <strong>Status:</strong>{" "}
                                      {slot.bookingAvailable
                                        ? "Available"
                                        : "Full"}
                                    </p>
                                  </div>

                                  {slot.message && (
                                    <p
                                      className={`text-xs mt-2 ${isSelected ? "text-blue-100" : "text-gray-500"}`}
                                    >
                                      {slot.message}
                                    </p>
                                  )}
                                </div>

                                {isSelected && (
                                  <div className="shrink-0">
                                    <Check className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {currentSelectedSlot && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Date:</strong>{" "}
                          {selectedDate.format("DD MMM YYYY")}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Time:</strong>{" "}
                          {formatTimeDisplay(currentSelectedSlot.time)}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Location:</strong>{" "}
                          {currentSelectedSlot.locationName}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Booking Available:</strong>{" "}
                          {currentSelectedSlot.bookingAvailable ? "Yes" : "No"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Message:</strong>{" "}
                          {currentSelectedSlot.message}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Capacity:</strong>{" "}
                          {currentSelectedSlot.capacity}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Occupied Seats:</strong>{" "}
                          {currentSelectedSlot.occupiedSeats}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Remaining Seats:</strong>{" "}
                          {currentSelectedSlot.remainingSeats}
                        </p>

                        {currentSelectedSlot.selectedClass && (
                          <div className="mt-3 border-t pt-3">
                            <p className="text-sm text-gray-700">
                              <strong>Class Name:</strong>{" "}
                              {currentSelectedSlot.selectedClass.name}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Price:</strong>{" "}
                              {currentSelectedSlot.selectedClass.price}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Offer Price:</strong>{" "}
                              {currentSelectedSlot.selectedClass.offerPrice}
                            </p>

                            {currentSelectedSlot.selectedClass.image?.[0] && (
                              <img
                                src={currentSelectedSlot.selectedClass.image[0]}
                                alt={currentSelectedSlot.selectedClass.name}
                                className="mt-2 w-24 h-24 object-cover rounded-lg border"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {isConfirmButtonEnabled() && (
              <div className="mt-8 z-[9999] p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Booking Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-green-100">
                    <p className="text-sm text-gray-600">Selected Dates</p>
                    <p className="font-semibold text-gray-800 mt-1">
                      {selectedDates.length} dates
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedDates.map((d) => d.format("DD MMM")).join(", ")}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-green-100">
                    <p className="text-sm text-gray-600">Selected Slots</p>
                    <p className="font-semibold text-gray-800 mt-1">
                      {getCompletedDatesCount()} slots selected
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-green-100">
                    <p className="text-sm text-gray-600">People</p>
                    <p className="font-semibold text-gray-800 mt-1">
                      {people} person{people !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 rounded-lg py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <button
                onClick={handleCancelBooking}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>

              <div className="flex flex-col items-end">
                <div className="text-xs text-gray-500 mb-1">
                  {selectedDates.length} dates, {getCompletedDatesCount()}{" "}
                  complete
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!isConfirmButtonEnabled()}
                  className={`
                    px-8 py-2.5 rounded-lg font-semibold transition-all duration-200
                    flex items-center gap-2
                    ${
                      !isConfirmButtonEnabled()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Confirm Booking ({selectedDates.length} Classes)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmBooking}
        title="Confirm Booking"
        message={
          <div className="space-y-3">
            <p>Are you sure you want to book the following classes?</p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-medium">Booking Details:</p>
              <ul className="text-sm space-y-1 mt-2">
                <li>
                  • {selectedDates.length} class
                  {selectedDates.length !== 1 ? "es" : ""}
                </li>
                <li>• One slot selected directly for each date</li>
                <li>
                  • Package:{" "}
                  {selectedBooking.package?.name || selectedServiceData?.name}
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              This action will use {selectedDates.length} of your remaining{" "}
              {remainingSlots} slots.
            </p>
          </div>
        }
        confirmText="Confirm Booking"
        cancelText="Review"
        type="info"
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Continue Booking"
        type="warning"
      />
    </>
  );
};

export default ClassBookingModal;
