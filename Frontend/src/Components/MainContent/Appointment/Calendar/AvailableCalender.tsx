import React, { useState } from "react";
import Calendar from "react-calendar";
import "./calendar.css";
import moment from "moment";

const AvailableCalender = ({
  enabledDays,
  sendDate,
}: {
  enabledDays: number[];
  sendDate: (date: Date) => void;
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const getCurrentMonthEndDate = (): Date => {
    return moment().endOf("month").toDate(); // End of the current month
  };
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const day = date.getDay();
      if (enabledDays.includes(day)) {
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#1f0e4e",
              opacity: 0.2,
              borderRadius: "4px",
            }}
          />
        );
      }
    }
    return null;
  };
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const day = date.getDay();
      return enabledDays.includes(day) ? "enabled-day" : "";
    }
  };
  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const day = date.getDay();
      return !enabledDays.includes(day); // Disable the days not in enabledDays
    }
    return false;
  };
  return (
    <div
      style={{
        width: "100%",
        paddingInline: "2rem",
      }}
    >
      <Calendar
        onChange={(value) => {
          const dateValue = Array.isArray(value) ? value[0] : value;
          if (dateValue && new Date(dateValue)) {
            console.log(moment(dateValue).format("YYYY-MM-DD"));
            setDate(value as Date);
            sendDate(value as Date);
          }
        }}
        value={date}
        tileContent={tileContent}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        minDate={moment().startOf("day").toDate()}
        // maxDate={getCurrentMonthEndDate()}
      />
    </div>
  );
};

export default AvailableCalender;
