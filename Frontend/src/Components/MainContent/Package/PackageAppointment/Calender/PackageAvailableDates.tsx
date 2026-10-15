// PackageAvailableCalender.tsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "./calendar.css";
import moment from "moment";
import { useAppSelector } from "src/Redux/hooks";

interface PackageAvailableCalenderProps {
  enabledDays: number[];
  sendDate: (date: Date) => void;
  selectedDates?: string[]; // Array of dates that are already selected
}

const PackageAvailableCalender: React.FC<PackageAvailableCalenderProps> = ({
  enabledDays,
  sendDate,
  selectedDates = [],
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const packageData = useAppSelector((state) => state.app.selectedPackage);

  const getCurrentMonthEndDate = (): Date => {
    return moment().add(packageData?.duration, "days").toDate();
  };

  const isDateAlreadySelected = (date: Date): boolean => {
    const dateStr = moment(date).toISOString();
    return selectedDates.includes(dateStr);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const day = date.getDay();

      // If date is already selected in another slot
      if (isDateAlreadySelected(date)) {
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#ff6b6b",
              opacity: 0.2,
              borderRadius: "4px",
            }}
          />
        );
      }

      // Regular enabled day
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
      if (isDateAlreadySelected(date)) {
        return "disabled-date";
      }
      return enabledDays.includes(day) ? "enabled-day" : "";
    }
  };

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const day = date.getDay();
      return isDateAlreadySelected(date) || !enabledDays.includes(day);
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
          if (dateValue && dateValue instanceof Date) {
            if (!isDateAlreadySelected(dateValue)) {
              setDate(dateValue);
              sendDate(dateValue);
            }
          }
        }}
        value={date}
        tileContent={tileContent}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        minDate={moment().startOf("day").toDate()}
        maxDate={getCurrentMonthEndDate()}
      />
    </div>
  );
};

export default PackageAvailableCalender;
