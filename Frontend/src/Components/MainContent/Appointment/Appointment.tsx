import React, { useState } from "react";
import moment from "moment";
import SectionHeader from "../MainUtils/SectionHeader";
import { useAppDispatch, useAppSelector } from "src/Redux/hooks";
import {
  setWasPrev,
  setDate,
  setTime,
  setAvailablity,
  setIsPackage,
  setLocation,
  setPeople,
  setMaxPeople,
} from "src/Redux/appSlice";
import AvailableCalender from "./Calendar/AvailableCalender";
import { convertTo12HourFormat } from "src/Utils/Functions";
import { getAvailableOfClass } from "src/Utils/ApiCalls";
import { Location } from "src/Utils/Types";

const Appointment = ({
  next,
  prev,
}: {
  next: () => void;
  prev: () => void;
}) => {
  const dispatch = useAppDispatch();
  const classes = useAppSelector((state) => state.app.class);
  const [locIsOpen, setLocIsOpen] = useState(false);
  const location = useAppSelector((s) => s.app?.location);
  const [max, setMax] = useState<number>(1);
  const [time, setTimes] = useState<
    {
      day: string;
      time: string;
      trainers: string[];
      duration: number;
      maxPeople: number;
      people: number;
      locations: Location[];
      _id: string;
    }[]
  >([]);
  const [date, setDates] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLocations, setSelectedLocations] = useState<Location | null>(
    null
  );
  const [locationsState, setLocationsState] = useState<Location[]>([]);
  const handleLocSelect = (locItem: Location) => {
    setSelectedLocations(locItem);
    dispatch(setLocation(locItem));
    setLocIsOpen(false);
  };
  const currentDate = moment();
  const tenMinutesFromNow = moment().add(10, "minutes");
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        // overflowY: "scroll",
        paddingBottom: "4rem",
      }}
    >
      <SectionHeader
        title="Date & Time"
        isPrev={true}
        prev={() => {
          dispatch(setWasPrev(true));
          setTimeout(() => {
            dispatch(setWasPrev(false));
          }, 500);
          prev();
        }}
      />
      <AvailableCalender
        enabledDays={
          classes?.availability
            ?.map((slot) => {
              if (
                slot.day &&
                ((location?._id &&
                  slot.locations.some((loc) => loc._id === location._id)) ||
                  true)
              ) {
                return slot.day;
              }
              return 0;
            })
            .filter((day) => day !== 0) || []
        }
        sendDate={async (date) => {
          setLoading(true);
          setDates(date);
          dispatch(setDate(date.toISOString()));
          dispatch(setTime(""));
          setSelectedTime("");
          setTimes([]);
          const res = await getAvailableOfClass({
            classId: classes?._id || "",
            date: moment(date).format("DD-MM-YYYY"),
          });
          if (res.status! != 200) {
            setMessage(res.message || "Failed to fetch available slots");
            setTimeout(() => {
              setMessage("");
            }, 2000);
            setLoading(false);
            return;
          }
          setTimes(res?.data?.slots);
          setLoading(false);
        }}
      />
      {time?.filter((slot) => {
        if (!date || !moment(date).isSame(moment(), "day")) {
          return true;
        }
        const now = moment();
        const cutoff = now.clone().subtract(2, "hours");
        const slotTime = moment(slot.time, ["HH:mm", "h:mm A"]);
        const slotFullMoment = moment(date).hour(slotTime.hour()).minute(slotTime.minute());
        return slotFullMoment.isAfter(cutoff);
      })?.length > 0 && (
        <div className="px-5 py-3 mb-5">
          <h3 className="mb-2 fs-12" style={{ fontSize: "14px" }}>
            {moment(date).format("MMMM DD, YYYY") +
              " " +
              convertTo12HourFormat(selectedTime || time[0].time)}
          </h3>
          <div className="grid gap-1 grid-cols-2">
            {time
              ?.filter((slot) => {
                if (!date || !moment(date).isSame(moment(), "day")) {
                  return true;
                }
                const now = moment();
                const cutoff = now.clone().subtract(2, "hours");
                const slotTime = moment(slot.time, ["HH:mm", "h:mm A"]);
                const slotFullMoment = moment(date).hour(slotTime.hour()).minute(slotTime.minute());
                return slotFullMoment.isAfter(cutoff);
              })
              ?.map((t, i) => {
                return (
                  <button
                    key={i}
                    className={`rounded py-2 br-2 align-center${
                      selectedTime === t?.time
                        ? " time-button text-white"
                        : " border-solid border-2 border-blue-900  text-black"
                    }`}
                    style={{
                      cursor:
                        t?.people >= t?.maxPeople ? "not-allowed" : "pointer",
                    }}
                    disabled={t?.people >= t?.maxPeople}
                    onClick={() => {
                      const remainingPeople = t.maxPeople - t.people;
                      setLocationsState(t?.locations || []);
                      dispatch(setTime(t?.time));
                      setSelectedLocations(t?.locations[0]);
                      dispatch(setLocation(t?.locations[0] || null));
                      dispatch(
                        setAvailablity({
                          ...t,
                          locations: t.locations
                            .map((location) => location._id!)
                            .filter((id) => id !== undefined),
                        })
                      );
                      setSelectedTime(t?.time);
                      setMax(remainingPeople);
                      dispatch(setMaxPeople(remainingPeople));
                    }}
                  >
                    {t.people >= t?.maxPeople
                      ? "Fulley Booked"
                      : convertTo12HourFormat(t?.time) +
                        "\n" +
                        t?.people +
                        "/" +
                        t?.maxPeople}
                  </button>
                );
              })}
          </div>
        </div>
      )}
      {/* {selectedTime && (
        <div className="flex gap-2" style={{ marginLeft: "1.5rem" }}>
          <div className="select-wrapper">
            <p style={{ marginBottom: ".4rem" }}>Location</p>
            <button
              onClick={() => {
                setLocIsOpen(!locIsOpen);
              }}
              className="select-button"
            >
              <span>
                {selectedLocations ? selectedLocations.name : "Select Location"}
              </span>
              <span className={`arrow ${locIsOpen ? "open" : ""}`}>▼</span>
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
                          // onMouseLeave={() => setHoveredCategoryId(null)}
                        >
                          <div className="category-title">{category?.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )} */}
      <div className="class-bottom-next bg-white">
        <button
          onClick={() => {
            if (!selectedTime || !selectedLocations) {
              setMessage("Please select a Date, Time & Location");
              setTimeout(() => {
                setMessage("");
              }, 2000);
              return;
            }
            dispatch(setIsPackage(false));
            dispatch(setPeople(1));
            next();
          }}
          style={{
            color: message != "" ? "orangered" : "white",
            border: message != "" ? "1px solid red" : "none",
          }}
          disabled={loading}
        >
          {loading ? "loading.." : message != "" ? message : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default Appointment;
