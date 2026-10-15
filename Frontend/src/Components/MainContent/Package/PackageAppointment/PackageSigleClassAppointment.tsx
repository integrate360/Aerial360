import React, { useEffect, useState } from "react";
import { Class, slotDataType } from "src/Utils/Types";
import PackageCalenderItem from "./Calender/PackageCalenderItem";
import { useAppSelector } from "src/Redux/hooks";

const PackageSingleClassAppointment = ({
  classes,
  slots,
  step,
  prevStep,
  setStep,
  setSlotsData,
  existingSlots,
  onUnsavedStatusChange,
  uniqueSlotsCount,
  onRemoveSlot,
}: {
  classes: Class;
  slots: number;
  step: number;
  setStep: () => void;
  prevStep: () => void;
  setSlotsData: (d: slotDataType[]) => void;
  existingSlots: slotDataType[];
  onUnsavedStatusChange: (sectionId: string, isUnsaved: boolean) => void;
  uniqueSlotsCount: number;
  onRemoveSlot: (sectionId: string) => void;
}) => {
  const [count, setCount] = useState<number>(0);
  const [data, setData] = useState<slotDataType[]>(existingSlots || []);
  const [message, setMessgage] = useState<string>("");
  const [addMore, setAddMore] = useState<boolean>(false);

  const slotss = useAppSelector((state) => state.app?.slots);
  const selectedPackage = useAppSelector((state) => state.app?.selectedPackage);

  useEffect(() => {
    const seededData = existingSlots || [];
    setData(seededData);
    
    // If the user hasn't selected any slots for this class yet, but they have already reached the package limit across other classes, we shouldn't render any empty slots.
    if (seededData.length === 0 && uniqueSlotsCount >= (selectedPackage?.days ?? 0)) {
      setCount(0);
    } else {
      setCount(Math.max(seededData.length, 1));
    }
    
    setSlotsData(seededData);
  }, [classes?._id, existingSlots]);

  useEffect(() => {
    if (data?.length > 0 && data[data?.length - 1].time && data[data?.length - 1].date) {
      setAddMore(true);
    } else {
      setAddMore(false);
    }
  }, [data]);

  const updateDataAtIndex = (newData: slotDataType, index: number) => {
    setData((prevData) => {
      const newArray = [...prevData];
      newArray[index] = newData;
      setSlotsData(newArray);
      return newArray;
    });
  };

  const handleRemoveSlot = (index: number, sectionId: string) => {
    onRemoveSlot(sectionId);
    
    setData((prevData) => {
      const newArray = prevData.filter((_, i) => i !== index);
      setSlotsData(newArray);
      return newArray;
    });
    
    setCount((prev) => Math.max(0, prev - 1));
    onUnsavedStatusChange(sectionId, false);
  };

  return (
    <div style={{ padding: "1rem 1.25rem", paddingBottom: "0" }}>
      {/* Class info header */}
      <div
        style={{
          marginBottom: "1rem",
          padding: "0.75rem 1rem",
          background: "#1f0e4e08",
          borderRadius: "10px",
          borderLeft: "4px solid #1f0e4e",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            textTransform: "capitalize",
            color: "#1f0e4e",
            margin: 0,
          }}
        >
          {classes?.name}
        </h3>
        {classes?.description && (
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: "4px 0 0 0",
            }}
          >
            {classes?.description}
          </p>
        )}
      </div>

      {/* Step indicator */}
      <p
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "0.5rem",
        }}
      >
        Select your appointments
      </p>

      {/* Appointment cards */}
      {Array.from({ length: count }, (_, index) => (
        <PackageCalenderItem
          key={`${classes?._id}-${index}`}
          classes={classes}
          sendDataToParent={(newData) => updateDataAtIndex(newData, index)}
          index={index}
          step={step}
          selectedDates={[]}
          allSelectedSlots={[...slotss, ...data]}
          initialData={data[index]}
          onUnsavedStatusChange={onUnsavedStatusChange}
          onDelete={() => handleRemoveSlot(index, data[index]?.sectionId || `${classes?._id || ""}-${step}-${index}`)}
        />
      ))}

      {/* Add More button */}
      {uniqueSlotsCount < (selectedPackage?.days ?? 0) && addMore && (
        <button
          onClick={() => {
            if (uniqueSlotsCount >= (selectedPackage?.days ?? 0)) {
              setMessgage("Reached Maximum Slots");
              setTimeout(() => {
                setMessgage("");
              }, 1500);
              return;
            }
            setCount((prev) => prev + 1);
          }}
          style={{
            marginTop: "0.75rem",
            width: "100%",
            padding: "0.6rem",
            borderRadius: "8px",
            border: "2px dashed #d1d5db",
            background: "transparent",
            color: "#6b7280",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {message || "+ Add Another Appointment"}
        </button>
      )}
    </div>
  );
};

export default PackageSingleClassAppointment;
