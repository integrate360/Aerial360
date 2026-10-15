import React, { useState, useEffect, useRef } from "react";
import { createBooking } from "../Apis/ApiCalls";
import {
  Search,
  ChevronDown,
  ChevronUp,
  X,
  User,
  BookOpen,
  AlertCircle,
  Briefcase,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";

const AddBooking = ({
  fetchData,
  handleModalClose,
  users,
  classes,
  trainers,
  locations,
}) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableTrainers, setAvailableTrainers] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [enabledDays, setEnabledDays] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    user: null,
    class: null,
    trainer: null,
    location: null,
    time: "",
    duration: "",
    date: "",
    amount: "",
    partialAmount: "",
  });

  // Dropdown states
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarView, setCalendarView] = useState("month");

  // Search states
  const [userSearch, setUserSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [trainerSearch, setTrainerSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [timeSearch, setTimeSearch] = useState("");

  // Refs for search inputs to maintain focus
  const userSearchRef = useRef(null);
  const classSearchRef = useRef(null);
  const trainerSearchRef = useRef(null);
  const locationSearchRef = useRef(null);
  const timeSearchRef = useRef(null);

  // Filtered lists with useMemo to prevent unnecessary re-renders
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) =>
        user?.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user?.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user?.phone?.includes(userSearch),
    );
  }, [users, userSearch]);

  const filteredClasses = React.useMemo(() => {
    if (!classes) return [];
    return classes.filter((classItem) =>
      classItem?.name?.toLowerCase().includes(classSearch.toLowerCase()),
    );
  }, [classes, classSearch]);

  const filteredTrainers = React.useMemo(() => {
    if (!trainers) return [];
    return trainers.filter((trainer) =>
      trainer?.name?.toLowerCase().includes(trainerSearch.toLowerCase()),
    );
  }, [trainers, trainerSearch]);

  const filteredLocations = React.useMemo(() => {
    if (!locations) return [];
    return locations.filter((location) =>
      location?.name?.toLowerCase().includes(locationSearch.toLowerCase()),
    );
  }, [locations, locationSearch]);

  const filteredTimes = React.useMemo(() => {
    if (!availableTimes) return [];
    return availableTimes.filter((time) =>
      time.toLowerCase().includes(timeSearch.toLowerCase()),
    );
  }, [availableTimes, timeSearch]);

  // Validate form
  const validateForm = () => {
    let isValid = true;

    if (!formData.user) {
      toast.error("User is required");
      isValid = false;
    }
    if (!formData.class) {
      toast.error("Class is required");
      isValid = false;
    }
    if (!formData.trainer) {
      toast.error("Trainer is required");
      isValid = false;
    }
    if (!formData.location) {
      toast.error("Location is required");
      isValid = false;
    }
    if (!formData.time) {
      toast.error("Time is required");
      isValid = false;
    }

    const duration = parseInt(formData.duration);
    if (!duration) {
      toast.error("Duration is required");
      isValid = false;
    } else if (duration < 1) {
      toast.error("Duration must be at least 1 minute");
      isValid = false;
    } else if (duration > 480) {
      toast.error("Duration cannot exceed 8 hours");
      isValid = false;
    }

    if (!formData.date) {
      toast.error("Date is required");
      isValid = false;
    }
    // else if (new Date(formData.date) < new Date()) {
    //   toast.error("Date cannot be in the past");
    //   isValid = false;
    // }

    const amount = parseFloat(formData.amount);
    if (!amount && amount !== 0) {
      toast.error("Amount is required");
      isValid = false;
    } else if (amount < 0) {
      toast.error("Amount cannot be negative");
      isValid = false;
    }

    return isValid;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const bookingData = {
        user: formData.user?._id || "",
        class: formData.class?._id || "",
        trainer: formData.trainer?._id || "",
        time: formData.time,
        duration: Number(formData.duration),
        dates: formData.date ? [new Date(formData.date)] : [],
        date: formData.date ? new Date(formData.date) : undefined,
        location: formData.location?._id || "",
        amount: Number(formData.amount),
        partialAmount: Number(formData.partialAmount) || 0,
        name: "",
      };

      const response = await createBooking(bookingData);
      if (response.status === 201) {
        toast.success("Booking created successfully!");
        await fetchData(false);
        handleModalClose();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
    }
  };

  // Handle form field changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle class selection
  const handleClassSelect = (classItem) => {
    handleInputChange("class", classItem);
    handleInputChange("amount", classItem?.price?.toString() || "");
    setSelectedClass(classItem);

    const days = classItem?.availability?.map((slot) => slot.day) || [];
    setEnabledDays(days);

    // Reset dependent fields
    handleInputChange("time", "");
    handleInputChange("duration", "");
    handleInputChange("trainer", null);
    handleInputChange("location", null);

    setShowClassDropdown(false);
    setClassSearch("");
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    handleInputChange("date", dateString);
    setSelectedDate(date);

    // Update available times
    if (selectedClass && selectedClass.availability) {
      const dayOfWeek = date.getDay();
      const availableSlots =
        selectedClass.availability?.filter((slot) => slot.day === dayOfWeek) ||
        [];
      const times = availableSlots.map((slot) => slot.time);
      setAvailableTimes(times);

      if (availableSlots.length > 0) {
        const slotTrainers = availableSlots.flatMap(
          (slot) => slot.trainers || [],
        );
        setAvailableTrainers(slotTrainers);

        const slotLocations = availableSlots.flatMap(
          (slot) => slot.locations || [],
        );
        setAvailableLocations(slotLocations);
      }
    }
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    handleInputChange("time", time);

    if (selectedClass?.availability) {
      const dayOfWeek = selectedDate
        ? selectedDate.getDay()
        : new Date(formData.date).getDay();
      const slot = selectedClass.availability.find(
        (s) => s.day === dayOfWeek && s.time === time,
      );
      if (slot) {
        handleInputChange("duration", slot.duration.toString());
      }
    }

    setShowTimeDropdown(false);
    setTimeSearch("");
  };

  // Handle trainer selection
  const handleTrainerSelect = (trainer) => {
    handleInputChange("trainer", trainer);
    setShowTrainerDropdown(false);
    setTrainerSearch("");
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    handleInputChange("location", location);
    setShowLocationDropdown(false);
    setLocationSearch("");
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    handleInputChange("user", user);
    setShowUserDropdown(false);
    setUserSearch("");
  };

  // Clear selected user
  const clearUserSelection = () => {
    handleInputChange("user", null);
    setUserSearch("");
  };

  // Calendar functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date) => {
    const day = date.getDay();
    return !enabledDays.includes(day);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
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
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      const isToday = date.toDateString() === new Date().toDateString();
      const isEnabledDay = enabledDays.includes(date.getDay());

      const dayClasses = `
        h-12 flex items-center justify-center border border-[#D8DDE6] cursor-pointer rounded-lg transition-all duration-200
        ${
          isDisabled
            ? "bg-[#F5F7FA] text-[#A0A7B8] cursor-not-allowed"
            : isSelected
              ? "bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white shadow-md"
              : isToday
                ? "border-2 border-[#5472D3] bg-white"
                : isEnabledDay
                  ? "hover:bg-[#F5F7FA] text-[#1A1D25] bg-white"
                  : "text-[#A0A7B8] bg-white"
        }
      `.trim();

      days.push(
        <div
          key={day}
          className={dayClasses}
          onClick={() => !isDisabled && handleDateSelect(date)}
        >
          {day}
          {isEnabledDay && !isDisabled && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-500"></div>
          )}
        </div>,
      );
    }

    return (
      <div className="bg-white border border-[#D8DDE6] rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
              )
            }
            className="px-3 py-1.5 bg-white border border-[#D8DDE6] rounded-lg hover:bg-[#F5F7FA] text-[#1A1D25] transition-all duration-200 shadow-sm"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold text-[#1A1D25]">
            {months[month]} {year}
          </h3>
          <button
            type="button"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
              )
            }
            className="px-3 py-1.5 bg-white border border-[#D8DDE6] rounded-lg hover:bg-[#F5F7FA] text-[#1A1D25] transition-all duration-200 shadow-sm"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-center font-medium text-[#666D80] text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  // Create a new component for searchable dropdowns
  const SearchableDropdown = ({
    show,
    setShow,
    options,
    onSelect,
    value,
    placeholder,
    disabled = false,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    icon: Icon,
    searchRef,
    getLabel = (item) => item?.name || "",
    getSubLabel,
  }) => {
    useEffect(() => {
      if (show && searchRef.current) {
        setTimeout(() => {
          searchRef.current?.focus();
        }, 100);
      }
    }, [show]);

    if (disabled) {
      return (
        <div className="relative">
          <div className="w-full px-4 py-3 bg-white border border-[#D8DDE6] rounded-lg text-[#A0A7B8] shadow-sm">
            {value ? getLabel(value) : placeholder}
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShow(!show);
          }}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-left flex justify-between items-center shadow-sm transition-all duration-200 border-[#D8DDE6] hover:border-[#5472D3] ${
            value ? "text-[#1A1D25]" : "text-[#666D80]"
          }`}
        >
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            {Icon && <Icon size={18} className="text-[#5472D3]" />}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {value ? getLabel(value) : placeholder}
              </div>
              {value && getSubLabel && (
                <div className="text-sm text-[#666D80] truncate">
                  {getSubLabel(value)}
                </div>
              )}
            </div>
          </div>
          <span className="text-[#666D80] ml-2">
            {show ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {show && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShow(false)}
            />
            <div
              className="absolute z-20 w-full mt-1 bg-white border border-[#D8DDE6] rounded-lg shadow-lg max-h-60 overflow-y-auto"
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="sticky top-0 bg-white p-2 border-b border-[#D8DDE6]">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666D80]"
                    size={16}
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-3 py-2 border border-[#D8DDE6] rounded-lg text-[#1A1D25] text-sm focus:outline-none focus:border-[#5472D3]"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="py-1">
                {options && options.length > 0 ? (
                  options.map((option) => (
                    <div
                      key={option._id || option}
                      onClick={() => {
                        onSelect(option);
                        setShow(false);
                      }}
                      className="px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer text-[#1A1D25] border-b border-[#F5F7FA] last:border-b-0 transition-all duration-200"
                    >
                      <div className="font-medium">{getLabel(option)}</div>
                      {getSubLabel && (
                        <div className="text-sm text-[#666D80] mt-1">
                          {getSubLabel(option)}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-[#666D80] text-center">
                    No options available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Custom dropdown component with search
  const Dropdown = ({
    show,
    setShow,
    options,
    onSelect,
    getLabel = (option) => option?.name || "",
    getSubLabel,
    placeholder = "Select...",
    value,
    disabled = false,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    icon: Icon,
    searchRef,
  }) => {
    if (disabled) {
      return (
        <div className="relative">
          <div className="w-full px-4 py-3 bg-white border border-[#D8DDE6] rounded-lg text-[#A0A7B8] shadow-sm">
            {value ? getLabel(value) : placeholder}
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShow(!show);
            setTimeout(() => {
              if (searchRef?.current && show) {
                searchRef.current.focus();
              }
            }, 100);
          }}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-left flex justify-between items-center shadow-sm transition-all duration-200 border-[#D8DDE6] hover:border-[#5472D3] ${
            value ? "text-[#1A1D25]" : "text-[#666D80]"
          }`}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon size={18} className="text-[#5472D3]" />}
            <span>{value ? getLabel(value) : placeholder}</span>
          </div>
          <span className="text-[#666D80]">
            {show ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {show && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShow(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-[#D8DDE6] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {onSearchChange && (
                <div className="sticky top-0 bg-white p-2 border-b border-[#D8DDE6]">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666D80]"
                      size={16}
                    />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full pl-10 pr-3 py-2 border border-[#D8DDE6] rounded-lg text-[#1A1D25] text-sm focus:outline-none focus:border-[#5472D3]"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="py-1">
                {options && options.length > 0 ? (
                  options.map((option, index) => (
                    <div
                      key={option._id || option || index}
                      onClick={() => {
                        onSelect(option);
                        setShow(false);
                      }}
                      className="px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer text-[#1A1D25] border-b border-[#F5F7FA] last:border-b-0 transition-all duration-200"
                    >
                      <div className="font-medium">{getLabel(option)}</div>
                      {getSubLabel && (
                        <div className="text-sm text-[#666D80] mt-1">
                          {getSubLabel(option)}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-[#666D80] text-center">
                    No options available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // User dropdown
  const UserDropdown = () => {
    useEffect(() => {
      if (showUserDropdown && userSearchRef.current) {
        setTimeout(() => {
          userSearchRef.current?.focus();
        }, 100);
      }
    }, [showUserDropdown]);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowUserDropdown(!showUserDropdown);
          }}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-left flex justify-between items-center shadow-sm transition-all duration-200 border-[#D8DDE6] hover:border-[#5472D3] ${
            formData.user ? "text-[#1A1D25]" : "text-[#666D80]"
          }`}
        >
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            {formData.user ? (
              <>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0D47A1] to-[#5472D3] flex items-center justify-center text-white text-sm font-medium">
                  {formData.user.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {formData.user.name}
                  </div>
                  <div className="text-sm text-[#666D80] truncate">
                    {formData.user.email || formData.user.phone}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearUserSelection();
                  }}
                  className="p-1 hover:bg-[#F5F7FA] rounded-full"
                >
                  <X size={16} className="text-[#666D80]" />
                </button>
              </>
            ) : (
              <>
                <User size={18} className="text-[#5472D3]" />
                <span>Select User</span>
              </>
            )}
          </div>
          <span className="text-[#666D80] ml-2">
            {showUserDropdown ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </span>
        </button>

        {showUserDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowUserDropdown(false)}
            />
            <div
              className="absolute z-20 w-full mt-1 bg-white border border-[#D8DDE6] rounded-lg shadow-lg max-h-60 overflow-y-auto"
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="sticky top-0 bg-white p-2 border-b border-[#D8DDE6]">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666D80]"
                    size={16}
                  />
                  <input
                    ref={userSearchRef}
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-3 py-2 border border-[#D8DDE6] rounded-lg text-[#1A1D25] text-sm focus:outline-none focus:border-[#5472D3]"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="py-1">
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className="px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer text-[#1A1D25] border-b border-[#F5F7FA] last:border-b-0 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0D47A1] to-[#5472D3] flex items-center justify-center text-white text-sm font-medium">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {user.name}
                          </div>
                          <div className="text-sm text-[#666D80] truncate">
                            {user.email} • {user.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-[#666D80] text-center">
                    No users found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#D8DDE6]"
        onWheel={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#D8DDE6] bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1D25]">
              Add New Booking
            </h2>
            <p className="text-sm text-[#666D80] mt-1">
              Fill in the details to create a new booking
            </p>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="p-2 hover:bg-[#F5F7FA] rounded-lg transition-all duration-200 text-[#666D80] hover:text-[#1A1D25]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-[#1A1D25] font-medium mb-2">
              User *
            </label>
            <UserDropdown />
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-[#1A1D25] font-medium mb-2">
              Class *
            </label>
            <SearchableDropdown
              show={showClassDropdown}
              setShow={setShowClassDropdown}
              options={filteredClasses}
              onSelect={handleClassSelect}
              getLabel={(classItem) => classItem?.name || ""}
              getSubLabel={(classItem) =>
                classItem?.price ? `₹${classItem.price}` : ""
              }
              placeholder="Select Class"
              value={formData.class}
              searchValue={classSearch}
              onSearchChange={setClassSearch}
              searchPlaceholder="Search classes..."
              icon={BookOpen}
              searchRef={classSearchRef}
            />
          </div>

          {/* Calendar */}
          <div>
            <label className="block text-[#1A1D25] font-medium mb-2">
              Date *
            </label>
            {renderCalendar()}
            {formData.date && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">
                  Selected Date:{" "}
                  {(() => {
                    const [year, month, day] = formData.date
                      .split("-")
                      .map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-[#1A1D25] font-medium mb-2">
              Time *
            </label>
            <SearchableDropdown
              show={showTimeDropdown}
              setShow={setShowTimeDropdown}
              options={filteredTimes}
              onSelect={handleTimeSelect}
              getLabel={(time) => time}
              placeholder="Select Time"
              value={formData.time}
              disabled={!formData.date || availableTimes.length === 0}
              searchValue={timeSearch}
              onSearchChange={setTimeSearch}
              searchPlaceholder="Search times..."
              searchRef={timeSearchRef}
            />
          </div>

          {/* Trainer Selection */}
          <div>
            <label className="block text-[#1A1D25] font-medium mb-2">
              Trainer *
            </label>
            <SearchableDropdown
              show={showTrainerDropdown}
              setShow={setShowTrainerDropdown}
              options={availableTrainers}
              onSelect={handleTrainerSelect}
              getLabel={(trainer) => trainer?.name || ""}
              placeholder="Select Trainer"
              value={formData.trainer}
              disabled={!formData.time}
              searchValue={trainerSearch}
              onSearchChange={setTrainerSearch}
              searchPlaceholder="Search trainers..."
              icon={Briefcase}
              searchRef={trainerSearchRef}
            />
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-[#1A1D25] font-medium mb-2">
              Location *
            </label>
            <SearchableDropdown
              show={showLocationDropdown}
              setShow={setShowLocationDropdown}
              options={availableLocations}
              onSelect={handleLocationSelect}
              getLabel={(location) => location?.name || ""}
              placeholder="Select Location"
              value={formData.location}
              disabled={!formData.time}
              searchValue={locationSearch}
              onSearchChange={setLocationSearch}
              searchPlaceholder="Search locations..."
              icon={MapPin}
              searchRef={locationSearchRef}
            />
          </div>
          {/* Duration */}
          <div>
            <label className="block text-[#1A1D25] font-medium mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-lg text-[#1A1D25] shadow-sm transition-all duration-200 border-[#D8DDE6] hover:border-[#5472D3] focus:border-[#5472D3] ${
                !formData.time
                  ? "opacity-50 cursor-not-allowed bg-[#F5F7FA]"
                  : ""
              }`}
              disabled={!formData.time}
              min="1"
              max="480"
              placeholder="Enter duration in minutes"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[#1A1D25] font-medium mb-2">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666D80]">
                ₹
              </span>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#D8DDE6] rounded-lg text-[#1A1D25] shadow-sm transition-all duration-200 hover:border-[#5472D3] focus:border-[#5472D3]"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Partial Amount */}
          <div>
            <label className="block text-[#1A1D25] font-medium mb-2">
              Partial Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666D80]">
                ₹
              </span>
              <input
                type="text"
                value={formData.partialAmount}
                onChange={(e) =>
                  handleInputChange("partialAmount", e.target.value)
                }
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#D8DDE6] rounded-lg text-[#1A1D25] shadow-sm transition-all duration-200 hover:border-[#5472D3] focus:border-[#5472D3]"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-[#D8DDE6] sticky bottom-0 bg-white pb-4">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-6 py-3 border border-[#D8DDE6] text-[#1A1D25] rounded-lg hover:bg-[#F5F7FA] transition-all duration-200 shadow-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white rounded-lg hover:from-[#0D3A7A] hover:to-[#4162C5] transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBooking;
