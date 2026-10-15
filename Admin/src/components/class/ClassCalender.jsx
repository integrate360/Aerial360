import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  List,
  Calendar,
  Clock,
  Users,
  MapPin,
} from "lucide-react";

// Utility functions
const convertTo12HourFormat = (time) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Updated color generator to match sidebar theme
const generateColors = (count) => {
  // Color palette matching the sidebar theme
  const colors = [
    "#0D47A1", // Dark blue (primary)
    "#5472D3", // Medium blue (secondary)
    "#64B5F6", // Light blue
    "#1976D2", // Blue
    "#2196F3", // Bright blue
    "#0288D1", // Another blue shade
    "#1565C0", // Deep blue
    "#1E88E5", // Electric blue
    "#42A5F5", // Soft blue
    "#5C6BC0", // Indigo blue
  ];

  // If we need more colors than defined, generate subtle blue variants
  if (count > colors.length) {
    const additionalColors = [];
    for (let i = colors.length; i < count; i++) {
      // Create subtle blue variations
      const baseHue = 220; // Blue hue
      const lightness = 50 + (i % 3) * 10; // 50%, 60%, or 70% lightness
      const saturation = 60 + (i % 2) * 10; // 60% or 70% saturation
      additionalColors.push(`hsl(${baseHue}, ${saturation}%, ${lightness}%)`);
    }
    return [...colors, ...additionalColors];
  }

  return colors.slice(0, count);
};

// Calendar Tile Component for Monthly View
const CalendarTile = ({ date, classesWithColors }) => {
  const dayIndex = date.getDay();
  const matchingClasses = classesWithColors.filter(
    (classItem) => classItem.slot.day === dayIndex,
  );

  const parseTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const calculateTimeRange = (startTime, duration) => {
    const startMinutes = parseTime(startTime);
    const endMinutes = startMinutes + duration;

    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    return `${convertTo12HourFormat(formatTime(startMinutes))} - ${convertTo12HourFormat(
      formatTime(endMinutes),
    )}`;
  };

  const getLocationInfo = (slot) => {
    if (!slot.locations?.length) return "";
    return ` @ ${slot.locations.join(", ")}`;
  };

  if (matchingClasses.length === 0) return null;

  return (
    <div className="space-y-1 mt-1">
      {matchingClasses.map((classItem, index) => {
        const timeRange = calculateTimeRange(
          classItem.slot.time,
          classItem.slot.duration,
        );
        const locationInfo = getLocationInfo(classItem.slot);

        return (
          <div
            key={`${classItem.name}-${index}`}
            className="group relative rounded-md px-2 py-1.5 text-white text-xs font-medium cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
            style={{
              backgroundColor: classItem.color,
              borderLeft: `3px solid ${classItem.borderColor || "#FFFFFF"}`,
            }}
            title={`${classItem.name}\n${timeRange}${locationInfo}\nMax People: ${classItem.slot.maxPeople}`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="truncate flex-1 font-semibold">
                {classItem.name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5">
              <Clock className="w-2.5 h-2.5" />
              <span className="truncate">{timeRange.split(" - ")[0]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Monthly Calendar Component
const ClassMonthly = ({ data }) => {
  const [classesWithColors, setClassesWithColors] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Flatten all classes and their availability slots into a single array
    const allClassSlots = data.flatMap(
      (classItem) =>
        classItem.availability?.map((slot) => ({
          name: classItem.name,
          slot: {
            ...slot,
            trainers: slot.trainers?.map((trainer) =>
              typeof trainer === "string" ? trainer : trainer.name,
            ),
            locations: slot.locations?.map((location) =>
              typeof location === "string" ? location : location.name,
            ),
          },
        })) || [],
    );

    // Generate colors based on the total number of slots
    const colors = generateColors(allClassSlots.length);

    // Combine classes with their colors and add border colors
    const coloredClasses = allClassSlots.map((classSlot, index) => {
      const baseColor = colors[index % colors.length];
      // Create a slightly darker border color
      const borderColor = baseColor.replace(
        /hsl\((\d+), (\d+)%, (\d+)%\)/,
        (match, h, s, l) => {
          return `hsl(${h}, ${s}%, ${Math.max(30, parseInt(l) - 15)}%)`;
        },
      );

      return {
        ...classSlot,
        color: baseColor,
        borderColor: borderColor,
      };
    });

    setClassesWithColors(coloredClasses);
  }, [data]);

  // Generate calendar days
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === "forward" ? 1 : -1));
      return newDate;
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Calculate remaining empty cells to complete the grid
  const totalCells = Math.ceil(days.length / 7) * 7;
  while (days.length < totalCells) {
    days.push(null);
  }

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("backward")}
          className="p-2.5 hover:bg-[#F5F7FA] rounded-lg transition-colors text-gray-700 hover:text-[#0D47A1] border border-[#D8DDE6] hover:border-[#5472D3]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#1A1D25]">
          {formatMonthYear(currentDate)}
        </h2>
        <button
          onClick={() => navigateMonth("forward")}
          className="p-2.5 hover:bg-[#F5F7FA] rounded-lg transition-colors text-gray-700 hover:text-[#0D47A1] border border-[#D8DDE6] hover:border-[#5472D3]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-[#D8DDE6] rounded-xl overflow-hidden shadow-sm bg-white">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-[#F5F7FA] to-[#E8ECF5] border-b border-[#D8DDE6]">
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold text-[#1A1D25] border-r last:border-r-0 border-[#D8DDE6]"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => (
            <div
              key={index}
              className={`min-h-32 border-r border-b last:border-r-0 p-2 transition-colors ${
                date
                  ? isToday(date)
                    ? "bg-gradient-to-br from-blue-50/50 to-[#F5F7FA] border-blue-200"
                    : "hover:bg-[#F5F7FA]"
                  : "bg-[#F5F7FA]/50"
              }`}
            >
              {date && (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full ${
                        isToday(date)
                          ? "bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white"
                          : "text-[#1A1D25]"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <CalendarTile
                    date={date}
                    classesWithColors={classesWithColors}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Weekly Calendar Component
const ClassWeekly = ({ data }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [processedEvents, setProcessedEvents] = useState([]);

  useEffect(() => {
    // Process all availability slots for all classes
    const allEvents = [];
    data.forEach((classItem) => {
      classItem.availability?.forEach((slot) => {
        allEvents.push({
          name: classItem.name,
          day: slot.day,
          time: slot.time,
          duration: slot.duration,
          maxPeople: slot.maxPeople,
          trainers: slot.trainers?.map((trainer) =>
            typeof trainer === "string" ? trainer : trainer.name,
          ),
          locations: slot.locations?.map((location) =>
            typeof location === "string" ? location : location.name,
          ),
        });
      });
    });
    setProcessedEvents(allEvents);
  }, [data]);

  const timelineColors = generateColors(processedEvents.length);

  // Generate time slots from 00:00 to 23:00
  const timeSlots = Array.from(
    { length: 24 },
    (_, i) => `${String(i).padStart(2, "0")}:00`,
  );

  // Navigation functions
  const navigateWeek = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === "forward" ? 7 : -7));
      return newDate;
    });
  };

  // Get week days starting from current date
  const getWeekDays = (date) => {
    const days = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  // Format date helpers
  const formatDayName = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatDayNumber = (date) => {
    return date.getDate();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Parse time string to minutes since midnight
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Calculate event position and height
  const getEventStyle = (time, duration, i) => {
    const startMinutes = parseTime(time);
    const topPercentage = (startMinutes / (24 * 60)) * 100;
    const heightPercentage = (duration / 60 / 24) * 100;

    const baseColor = timelineColors[i % timelineColors.length];
    const borderColor = baseColor.replace(
      /hsl\((\d+), (\d+)%, (\d+)%\)/,
      (match, h, s, l) => {
        return `hsl(${h}, ${s}%, ${Math.max(30, parseInt(l) - 15)}%)`;
      },
    );

    return {
      top: `${topPercentage}%`,
      height: `${heightPercentage}%`,
      minHeight: "40px",
      backgroundColor: baseColor,
      borderLeft: `3px solid ${borderColor}`,
    };
  };

  const calculateTimeRange = (startTime, duration) => {
    const startMinutes = parseTime(startTime);
    const endMinutes = startMinutes + duration;

    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    return `${convertTo12HourFormat(formatTime(startMinutes))} - ${convertTo12HourFormat(formatTime(endMinutes))}`;
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Navigation controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateWeek("backward")}
          className="p-2.5 hover:bg-[#F5F7FA] rounded-lg transition-colors text-gray-700 hover:text-[#0D47A1] border border-[#D8DDE6] hover:border-[#5472D3]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-[#1A1D25]">
          {formatMonthYear(weekDays[0])}
        </h2>
        <button
          onClick={() => navigateWeek("forward")}
          className="p-2.5 hover:bg-[#F5F7FA] rounded-lg transition-colors text-gray700 hover:text-[#0D47A1] border border-[#D8DDE6] hover:border-[#5472D3]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="border border-[#D8DDE6] rounded-xl overflow-hidden shadow-sm bg-white">
        {/* Header */}
        <div className="grid grid-cols-8 bg-gradient-to-r from-[#F5F7FA] to-[#E8ECF5] border-b border-[#D8DDE6]">
          <div className="p-4 border-r border-[#D8DDE6]"></div>
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`p-4 text-center border-r last:border-r-0 border-[#D8DDE6] ${
                isToday(day) ? "bg-blue-100" : ""
              }`}
            >
              <div className="font-semibold text-[#1A1D25] text-sm">
                {formatDayName(day)}
              </div>
              <div
                className={`text-xl font-bold mt-1 inline-flex items-center justify-center w-10 h-10 rounded-full ${
                  isToday(day)
                    ? "bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white"
                    : "text-[#1A1D25]"
                }`}
              >
                {formatDayNumber(day)}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative" style={{ height: "800px" }}>
          {/* Time labels */}
          <div className="absolute left-0 top-0 w-20 h-full border-r border-[#D8DDE6] bg-[#F5F7FA] z-10">
            {timeSlots.map((time, i) => (
              <div
                key={i}
                className="text-xs text-[#1A1D25] border-b border-gray-100 flex items-start justify-end pr-3 pt-1 font-medium"
                style={{ height: `${100 / 24}%` }}
              >
                {convertTo12HourFormat(time)}
              </div>
            ))}
          </div>

          {/* Days columns */}
          <div className="ml-20 grid grid-cols-7 h-full">
            {weekDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`relative border-r border-[#D8DDE6] last:border-r-0 ${
                  isToday(day) ? "bg-blue-50/30" : ""
                }`}
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    to bottom,
                    transparent,
                    transparent calc(${100 / 24}% - 1px),
                    #D8DDE6 calc(${100 / 24}% - 1px),
                    #D8DDE6 ${100 / 24}%
                  )`,
                }}
              >
                {/* Events */}
                {processedEvents.map((event, eventIndex) => {
                  if (event.day === day.getDay()) {
                    const timeRange = calculateTimeRange(
                      event.time,
                      event.duration,
                    );

                    return (
                      <div
                        key={eventIndex}
                        className="absolute left-1 right-1 rounded-lg p-2 shadow-md text-white text-xs transition-all duration-200 hover:shadow-lg hover:z-20 cursor-pointer overflow-hidden"
                        style={getEventStyle(
                          event.time,
                          event.duration,
                          eventIndex,
                        )}
                        title={`${event.name}\n${timeRange}\nMax: ${event.maxPeople}\nLocations: ${event.locations?.join(", ") || "N/A"}`}
                      >
                        <div className="font-bold truncate mb-1">
                          {event.name}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-90 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="truncate">{timeRange}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-90">
                          <Users className="w-3 h-3" />
                          <span>{event.maxPeople}</span>
                        </div>
                        {event.locations && event.locations.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] opacity-90 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">
                              {event.locations[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Calendar Component
const ClassCalendar = ({ data, chooseList }) => {
  const [view, setView] = useState("monthly");

  return (
    <div className="space-y-6">
      {/* Main Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#D8DDE6]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#D8DDE6]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#5472D3]" />
                <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1D25]">
                  Class Calendar
                </h1>
              </div>
            </div>

            {/* View Toggle */}
            {/* <div className="flex border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setView("monthly")}
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  view === "monthly"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setView("weekly")}
                className={`px-4 py-2.5 text-sm font-medium border-l border-gray-300 transition-all duration-200 ${
                  view === "weekly"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Weekly
              </button>
            </div> */}
            <button
              onClick={chooseList}
              className="p-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#5472D3] hover:to-[#0D47A1] text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              title="Switch to list view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="p-4 sm:p-6">
          {view === "monthly" && <ClassMonthly data={data} />}
          {/* {view === "weekly" && <ClassWeekly data={data} />} */}
        </div>
      </div>
    </div>
  );
};

export default ClassCalendar;
