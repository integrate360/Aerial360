import moment from "moment";
import React, { useEffect, useState } from "react";
import { setLocation } from "src/Redux/appSlice";
import { useAppDispatch, useAppSelector } from "src/Redux/hooks";
import { getAvailableOfClass } from "src/Utils/ApiCalls";
import { convertTo12HourFormat } from "src/Utils/Functions";
import { Class, Location, slotDataType, Staff } from "src/Utils/Types";
import PackageAvailableCalender from "./PackageAvailableDates";
import { Calendar, Clock, MapPin, Edit2, Check, Trash2 } from "lucide-react";

const PackageCalenderItem = ({
  classes,
  sendDataToParent,
  index,
  selectedDates,
  initialData,
  allSelectedSlots = [],
  step,
  onUnsavedStatusChange,
  onDelete,
}: {
  classes: Class;
  sendDataToParent: (data: slotDataType) => void;
  index: number;
  selectedDates: string[];
  initialData?: slotDataType;
  allSelectedSlots?: slotDataType[];
  step: number;
  onUnsavedStatusChange: (sectionId: string, isUnsaved: boolean) => void;
  onDelete?: () => void;
}) => {
  const [time, setTimes] = useState<
    {
      day: string;
      time: string;
      trainers: Staff[];
      duration: number;
      maxPeople: number;
      people: number;
      locations: Location[];
      _id: string;
    }[]
  >([]);
  const dispatch = useAppDispatch();
  const emptyLocation: Location = {
    _id: "",
    name: "",
    address: "",
    googleMapLink: "",
    createdAt: "",
  };
  const emptyTrainer: Staff = {
    email: "",
    name: "",
    phone: "",
    emergencyPhone: "",
    _id: "",
  };
  const [isSaved, setIsSaved] = useState<boolean>(
    !!(initialData?.date && initialData?.time)
  );
  const [slotData, setSlotData] = useState<slotDataType>(
    initialData || {
      date: "",
      classId: classes?._id || "",
      sectionId: `${classes?._id || ""}-${step}-${index}`,
      time: "",
      location: emptyLocation,
      classDuration: 0,
      trainer: emptyTrainer,
      className: classes?.name || "",
    }
  );
  const [date, setDates] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    initialData?.time || ""
  );
  const [locIsOpen, setLocIsOpen] = useState(false);
  const [trainOpen, setTrainIsOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Location | null>(
    initialData?.location?._id ? initialData.location : null
  );
  const [trainers, setTrainers] = useState<Staff[]>([]);
  const [selectedTrainer, setSelectedTrainers] = useState<Staff | undefined>(
    initialData?.trainer?._id ? initialData.trainer : undefined
  );
  const [locationsState, setLocationsState] = useState<Location[]>(
    initialData?.location?._id ? [initialData.location] : []
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!initialData) return;

    setSlotData(initialData);
    setDates(initialData?.date ? new Date(initialData.date) : undefined);
    setSelectedTime(initialData?.time || "");
    setSelectedLocations(
      initialData?.location?._id ? initialData.location : null
    );
    setSelectedTrainers(
      initialData?.trainer?._id ? initialData.trainer : undefined
    );
    setLocationsState(initialData?.location?._id ? [initialData.location] : []);
    setIsSaved(!!(initialData?.date && initialData?.time));
  }, [
    initialData?.classId,
    initialData?.date,
    initialData?.time,
    initialData?.location?._id,
    initialData?.trainer?._id,
  ]);

  useEffect(() => {
    if (slotData && isSaved) {
      sendDataToParent(slotData);
    }
  }, [slotData, isSaved]);

  useEffect(() => {
    // An item is "unsaved" if it has a date and time selected but isSaved is false
    const hasSelection = !!(date && selectedTime);
    onUnsavedStatusChange(slotData.sectionId, hasSelection && !isSaved);

    return () => {
      onUnsavedStatusChange(slotData.sectionId, false);
    };
  }, [date, selectedTime, isSaved, slotData.sectionId]);

  const isDateDisabled = (date: Date) => {
    // Count how many slots are scheduled for this day of week in the current class
    const dayOfWeek = date.getDay();
    const scheduledSlotsCount =
      classes?.availability?.filter((a) => a.day === dayOfWeek)?.length || 0;

    if (scheduledSlotsCount === 0) return false;

    // Count how many slots for THIS specific date are already selected for THIS class
    const selectedForThisDate = allSelectedSlots.filter(
      (s) =>
        moment(s.date).isSame(moment(date), "day") &&
        s.classId === classes?._id &&
        s.sectionId !== slotData.sectionId
    );

    return selectedForThisDate.length >= scheduledSlotsCount;
  };

  const handleLocSelect = (locItem: Location) => {
    setSlotData((prev) => ({
      ...prev,
      location: locItem,
    }));
    setSelectedLocations(locItem);
    dispatch(setLocation(locItem));
    setLocIsOpen(false);
  };
  const handleTrainSelect = (locItem: Staff) => {
    setSlotData((prev) => ({
      ...prev,
      trainer: locItem,
    }));
    setSelectedTrainers(locItem);
    setTrainIsOpen(false);
  };
  const currentDate = moment();
  const tenMinutesFromNow = moment().add(10, "minutes");

  const filteredSlots = time?.filter((slot) => {
    // 1. Filter out slots already selected in other steps of this package
    const isAlreadySelected = allSelectedSlots.some(
      (s) =>
        moment(s.date).isSame(moment(date), "day") &&
        s.time === slot.time &&
        s.sectionId !== slotData.sectionId
    );
    if (isAlreadySelected) return false;

    // 2. If no date is selected, show all slots
    if (!date) return true;

    // 3. For today's date, we trust the backend's availability response.
    // We only perform a very basic check to ensure the slot hasn't passed by a significant margin (e.g. 2 hours)
    // to handle cases where the backend might return stale data, but otherwise we show what the API gives us.
    const isToday = moment(date).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD");
    if (!isToday) return true;

    const now = moment();
    const cutoff = now.clone().subtract(2, "hours");
    
    const slotTime = moment(slot.time, ["HH:mm", "h:mm A"]);
    const slotFullMoment = moment(date).hour(slotTime.hour()).minute(slotTime.minute());

    // Allow slots that are not more than 2 hours in the past
    return slotFullMoment.isAfter(cutoff);
  });

  return (
    <div
      style={{
        marginTop: "0.75rem",
        border: isSaved ? "2px solid #22c55e" : "1px solid #d1d5db",
        borderRadius: "12px",
        overflow: "hidden",
        background: isSaved ? "#f0fdf4" : "#fff",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 1rem",
          background: isSaved ? "#dcfce7" : "#f8f9fa",
          borderBottom: isSaved ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: isSaved ? "#166534" : "#6b7280",
          }}
        >
          Appointment {index + 1}
        </span>
        {isSaved && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#166534",
              background: "#bbf7d0",
              padding: "4px 8px",
              borderRadius: "12px",
            }}
          >
            <Check size={14} strokeWidth={3} /> Saved
          </span>
        )}
      </div>

      {/* Saved summary card - shown when saved instead of calendar */}
      {isSaved && date && selectedTime ? (
        <div style={{ padding: "1rem" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "0.75rem",
              background: "#fff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color="#1f0e4e" />
              <span
                style={{ fontSize: "14px", fontWeight: 600, color: "#1f0e4e" }}
              >
                {moment(date).format("dddd, MMMM DD, YYYY")}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={18} color="#374151" />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                {convertTo12HourFormat(selectedTime)}
              </span>
            </div>
            {selectedLocations && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <MapPin size={18} color="#374151" />
                <span style={{ fontSize: "14px", color: "#374151" }}>
                  {selectedLocations.name}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "0.75rem" }}>
            <button
              onClick={() => setIsSaved(false)}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Edit2 size={14} /> Edit
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                style={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "1px solid #fca5a5",
                  background: "#fef2f2",
                  color: "#ef4444",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                title="Delete Appointment"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Calendar */}
          <PackageAvailableCalender
            enabledDays={
              isSaved
                ? []
                : classes?.availability?.map((slot) => slot.day) || []
            }
            sendDate={async (date) => {
              if (isSaved) return;

              if (isDateDisabled(date)) {
                setMessage(
                  "You have already selected all available slots for this date"
                );
                setTimeout(() => {
                  setMessage("");
                }, 2000);
                return;
              }

              setDates(date);
              setTimes([]);
              setSelectedTime("");
              setSelectedLocations(null);
              setSelectedTrainers(undefined);
              setSlotData((prev) => ({
                ...prev,
                date: moment(date).toISOString(),
                time: "",
                classDuration: 0,
                location: emptyLocation,
                trainer: emptyTrainer,
              }));
              const res = await getAvailableOfClass({
                classId: classes?._id || "",
                date: moment(date).format("DD-MM-YYYY"),
              });
              if (res.status! != 200) {
                setMessage(res.message || "Failed to fetch available slots");
                setTimeout(() => {
                  setMessage("");
                }, 2000);
                return;
              }

              // Check if any available times remain after filtering out existing selections
              const availableTimes = res?.data?.slots?.filter((slot: any) => {
                const isAlreadySelected = allSelectedSlots.some(
                  (s) =>
                    moment(s.date).isSame(moment(date), "day") &&
                    s.time === slot.time &&
                    s.sectionId !== slotData.sectionId
                );
                return !isAlreadySelected;
              });

              if (availableTimes?.length === 0) {
                setMessage("No more available slots for this date");
                setTimeout(() => {
                  setMessage("");
                }, 2000);
                setDates(undefined);
                setTimes([]);
                return;
              }

              setTimes(res?.data?.slots);
            }}
            selectedDates={allSelectedSlots
              .filter(
                (s) =>
                  s.classId === classes?._id &&
                  s.sectionId !== slotData.sectionId
              )
              .map((s) => s.date)
              .filter((dateStr) =>
                isDateDisabled(moment(dateStr).toDate())
              )}
          />

          {/* Time slots section */}
          <div
            style={{
              padding: "0 1.25rem 1rem",
              background: "#1f0e4e0a",
            }}
          >
            {date && filteredSlots?.length > 0 && (
              <div style={{ paddingTop: "0.75rem" }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Available Times — {moment(date).format("MMM DD")}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                  }}
                >
                  {filteredSlots.map((t, i) => {
                    const isFull = t?.people >= t?.maxPeople;
                    const isSelected = selectedTime === t?.time;
                    return (
                      <button
                        key={i}
                        disabled={isSaved || isFull}
                        className={`rounded py-2 br-2 align-center${
                          isSelected
                            ? " time-button text-white"
                            : " border-solid border-2 border-blue-900 text-black"
                        }`}
                        style={{
                          cursor: isFull || isSaved ? "not-allowed" : "pointer",
                          opacity: isFull ? 0.5 : 1,
                          borderRadius: "8px",
                          padding: "0.6rem 0.5rem",
                          fontSize: "13px",
                          fontWeight: isSelected ? 700 : 500,
                          transition: "all 0.2s ease",
                          lineHeight: "1.4",
                        }}
                        onClick={() => {
                          setSlotData((prev) => ({
                            ...prev,
                            time: t?.time,
                            classDuration: t?.duration,
                            location: t?.locations?.[0] || emptyLocation,
                            trainer: t?.trainers?.[0] || emptyTrainer,
                          }));
                          setLocationsState(t?.locations);
                          setSelectedLocations(t?.locations[0]);
                          setSelectedTrainers(t?.trainers[0]);
                          setSelectedTime(t?.time);
                        }}
                      >
                        {isFull ? (
                          "Fully Booked"
                        ) : (
                          <>
                            <span style={{ display: "block" }}>
                              {convertTo12HourFormat(t?.time)}
                            </span>
                            <span
                              style={{
                                display: "block",
                                fontSize: "11px",
                                opacity: 0.7,
                              }}
                            >
                              {t?.people}/{t?.maxPeople} spots
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location selector + Save button */}
            {selectedTime && (
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div className="select-wrapper" style={{ marginBottom: 0 }}>
                  <p
                    style={{
                      marginBottom: "0.3rem",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Location
                  </p>
                  <button
                    disabled={isSaved}
                    onClick={() => {
                      setLocIsOpen(!locIsOpen);
                    }}
                    className="select-button"
                    style={{ cursor: isSaved ? "not-allowed" : "pointer" }}
                  >
                    <span>
                      {selectedLocations
                        ? selectedLocations.name
                        : "Select Location"}
                    </span>
                    <span className={`arrow ${locIsOpen ? "open" : ""}`}>
                      ▼
                    </span>
                  </button>
                  {locIsOpen && (
                    <div className="dropdown-container">
                      <div className="dropdown-content">
                        <div className="categories-list-loc">
                          {locationsState?.map((category) => {
                            return (
                              <div
                                key={category._id}
                                className="category-item"
                                onClick={() => handleLocSelect(category)}
                              >
                                <div className="category-title">
                                  {category?.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (isSaved) {
                      setIsSaved(false);
                    } else {
                      if (!date || !selectedTime) {
                        setMessage("Please select date and time");
                        setTimeout(() => setMessage(""), 2000);
                        return;
                      }
                      setIsSaved(true);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#1f0e4e",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Check size={16} strokeWidth={3} /> Save Appointment
                </button>
              </div>
            )}

            {/* Message */}
            {message && (
              <p
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  color: "#dc2626",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                {message}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PackageCalenderItem;
