import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  MapPin,
  Clock,
  Tag,
  ListChecks,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { getAllBookingsdates } from "../Apis/ApiCalls";

const MonthlyBookings = () => {
  const [bookingEvents, setBookingEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({
    bookings: [],
    date: "",
    time: "",
  });

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBookingsdates();

      if (Array.isArray(response)) {
        setBookingEvents(response);
      } else if (
        response &&
        "data" in response &&
        Array.isArray(response.data)
      ) {
        setBookingEvents(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDateForComparison = (date) => {
    const localDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const day = localDate.getDate().toString().padStart(2, "0");
    const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
    const year = localDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const extractDateFromApiFormat = (apiDate) => {
    return apiDate.split(" ")[0];
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDateForComparison(date);
    const bookingsMap = new Map();

    bookingEvents.forEach((booking) => {
      const hasMatchingDate = booking.dates.some((apiDate) => {
        const cleanDate = extractDateFromApiFormat(apiDate);
        return cleanDate === dateStr;
      });

      if (hasMatchingDate) {
        const time = booking.time[0] || "No Time";
        const key = time;

        if (bookingsMap.has(key)) {
          bookingsMap.get(key).bookings.push(booking);
        } else {
          bookingsMap.set(key, {
            time,
            bookings: [booking],
          });
        }
      }
    });

    // Convert to array and sort by time
    const sortedTimeSlots = Array.from(bookingsMap.values()).sort((a, b) => {
      // Helper function to convert time string to minutes for comparison
      const timeToMinutes = (timeStr) => {
        if (!timeStr || timeStr === "No Time") return Infinity;

        const timeMatch = timeStr.match(/(\d+):?(\d+)?\s*(am|pm)/i);
        if (!timeMatch) return Infinity;

        let [, hour, minute = "0", meridiem] = timeMatch;
        hour = parseInt(hour, 10);
        minute = parseInt(minute, 10);

        // Convert to 24-hour format
        if (meridiem.toLowerCase() === "pm" && hour !== 12) {
          hour += 12;
        }
        if (meridiem.toLowerCase() === "am" && hour === 12) {
          hour = 0;
        }

        return hour * 60 + minute;
      };

      const aMinutes = timeToMinutes(a.time);
      const bMinutes = timeToMinutes(b.time);

      return aMinutes - bMinutes;
    });

    return sortedTimeSlots;
  };

  if (loading) {
    return (
      <div className="min-h-[500px] bg-gradient-to-br from-[#F5F7FA] to-white rounded-lg border border-[#D8DDE6] shadow-sm flex justify-center items-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-12 h-12 border-4 border-[#D8DDE6] border-t-[#0D47A1] rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-bold text-[#1A1D25]">
            Loading calendar...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[500px] bg-white rounded-lg border border-[#D8DDE6] shadow-sm flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-5 text-center max-w-md">
          <div className="p-4 bg-red-50 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1A1D25] mb-2">
              Error Loading Calendar
            </div>
            <p className="text-[#5472D3] mb-4">{error}</p>
          </div>
          <button
            onClick={fetchBookings}
            className="px-6 py-3 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            const newDate = new Date(currentViewDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setCurrentViewDate(newDate);
          }}
          className="p-2.5 hover:bg-[#F5F7FA] rounded-lg transition-colors text-gray-700 hover:text-[#0D47A1] border border-[#D8DDE6] hover:border-[#5472D3]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#1A1D25]">
          {currentViewDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() => {
            const newDate = new Date(currentViewDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setCurrentViewDate(newDate);
          }}
          className="p-2.5 hover:bg-[#F5F7FA] rounded-lg transition-colors text-gray-700 hover:text-[#0D47A1] border border-[#D8DDE6] hover:border-[#5472D3]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-[#D8DDE6] rounded-xl overflow-hidden shadow-sm bg-white">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-[#F5F7FA] to-[#E8ECF5] border-b border-[#D8DDE6]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold text-[#1A1D25] border-r last:border-r-0 border-[#D8DDE6]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {(() => {
            const year = currentViewDate.getFullYear();
            const month = currentViewDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const days = [];

            // Empty cells for days before the first day of month
            for (let i = 0; i < firstDay; i++) {
              days.push(
                <div
                  key={`empty-${i}`}
                  className="min-h-32 bg-[#F5F7FA]/50"
                ></div>,
              );
            }

            // Days of the month
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day);
              const events = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              days.push(
                <div
                  key={day}
                  className={`min-h-32 border-r border-b p-2 transition-colors ${
                    isToday
                      ? "bg-gradient-to-br from-blue-50/50 to-[#F5F7FA] border-blue-200"
                      : "hover:bg-[#F5F7FA]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full ${
                        isToday
                          ? "bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white"
                          : "text-[#1A1D25]"
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {events.map((group, index) => {
                      const count = group.bookings.length;
                      return (
                        <div
                          key={index}
                          className="group relative rounded-md px-2 py-1.5 text-white text-xs font-medium cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                          style={{
                            backgroundColor: "#0D47A1",
                            borderLeft: "3px solid #1565C0",
                          }}
                          onClick={() => {
                            setModal(true);
                            setSelectedTimeSlot({
                              bookings: group.bookings,
                              date: formatDateForComparison(date),
                              time: group.time,
                            });
                          }}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate flex-1 font-semibold">
                              {group.time}
                            </span>
                            <span className="ml-1 bg-white/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>,
              );
            }

            return days;
          })()}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModal(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-[#D8DDE6] animate-modal-in">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white p-5 border-b border-white/20">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">Booking Details</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span className="font-medium text-xs">
                        {selectedTimeSlot.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium text-xs">
                        {selectedTimeSlot.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-medium text-xs">
                        {selectedTimeSlot.bookings.length} Booking
                        {selectedTimeSlot.bookings.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setModal(false)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 group"
                >
                  <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-160px)] bg-[#F5F7FA]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTimeSlot.bookings.map((booking, index) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-lg p-4 border border-[#D8DDE6] hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    {/* Top Row - Customer Name and Location */}
                    <div className="flex items-start gap-3 mb-3 pb-3 border-b border-[#D8DDE6]">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0D47A1] to-[#5472D3] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                        {booking.user?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3 min-w-0">
                        {/* Customer Name */}
                        <div className="min-w-0">
                          <p className="text-xs text-[#5472D3] font-medium mb-0.5">
                            Customer Name
                          </p>
                          <p className="font-bold text-sm text-[#1A1D25] truncate">
                            {booking.user}
                          </p>
                        </div>
                        {/* Location */}
                        <div className="min-w-0">
                          <p className="text-xs text-[#5472D3] font-medium mb-0.5">
                            Location
                          </p>
                          <p className="font-bold text-sm text-[#1A1D25] truncate">
                            {booking.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-[#5472D3] bg-[#5472D3]/10 px-2.5 py-1 rounded-full flex-shrink-0">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Bottom Row - Time Slot and Booking Type */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#F5F7FA] rounded-lg p-3 border border-[#D8DDE6]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="p-1.5 bg-amber-100 rounded">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <span className="text-xs font-medium text-[#5472D3]">
                            Time Slot
                          </span>
                        </div>
                        <div className="font-semibold text-sm text-[#1A1D25]">
                          {booking.time[0] || "Not specified"}
                        </div>
                      </div>

                      <div className="bg-[#F5F7FA] rounded-lg p-3 border border-[#D8DDE6]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="p-1.5 bg-violet-100 rounded">
                            <Tag className="h-3.5 w-3.5 text-violet-600" />
                          </div>
                          <span className="text-xs font-medium text-[#5472D3]">
                            Booking Type
                          </span>
                        </div>
                        <div className="font-semibold text-sm text-[#1A1D25]">
                          {booking.bookingTypeName || "Standard"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[#D8DDE6] p-3 flex justify-center">
              <button
                onClick={() => setModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Hide Scrollbar */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-modal-in {
          animation: modal-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

// ==================== BookingCalender Component ====================
const BookingCalender = ({ data, chooseList }) => {
  const [view, setView] = useState("monthly");

  return (
    <div className="space-y-6">
      {/* Main Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#D8DDE6]">
        {/* Header */}
        <div className="p-6 border-b border-[#D8DDE6]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-[#5472D3]" />
                <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1D25]">
                  Booking Calendar
                </h1>
              </div>
            </div>

            <button
              onClick={chooseList}
              className="p-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#5472D3] hover:to-[#0D47A1] text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              title="Switch to list view"
            >
              <ListChecks className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="p-6">
          <MonthlyBookings />
        </div>
      </div>
    </div>
  );
};

export default BookingCalender;
