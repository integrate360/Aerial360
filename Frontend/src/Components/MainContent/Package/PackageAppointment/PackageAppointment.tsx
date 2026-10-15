import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/Redux/hooks";
import { Class, slotDataType } from "src/Utils/Types"; // Ensure this type is correctly defined
import PackageSigleClassAppointment from "./PackageSigleClassAppointment";
import SectionHeader from "../../MainUtils/SectionHeader";
import { setSlots, setSlotsEmpty, removeSlot } from "src/Redux/appSlice";
import { getPopulatedClasses } from "src/Utils/ApiCalls";

const PackageAppointment = ({
  next,
  prev,
}: {
  next: () => void;
  prev: () => void;
}) => {
  const [step, setStep] = useState<number>(0);
  const [slotDatas, setSlotsData] = useState<slotDataType[]>([]);
  const [packageServices, setPackageServices] = useState<Class[]>([]);
  const [message, setMessage] = useState<string>("");
  const [unsavedItems, setUnsavedItems] = useState<Set<string>>(new Set());
  const [hasSyncedInitialStep, setHasSyncedInitialStep] =
    useState<boolean>(false);

  const handleUnsavedStatusChange = (sectionId: string, isUnsaved: boolean) => {
    setUnsavedItems((prev) => {
      const next = new Set(prev);
      if (isUnsaved) {
        next.add(sectionId);
      } else {
        next.delete(sectionId);
      }
      return next;
    });
  };

  const selectedPackage = useAppSelector(
    (state) => state?.app?.selectedPackage
  );
  const disptach = useAppDispatch();
  const slots = useAppSelector((state) => state?.app?.slots);

  useEffect(() => {
    setHasSyncedInitialStep(false);

    let isMounted = true;

    const loadPackageServices = async () => {
      const services = (selectedPackage?.services || []) as Array<Class | string>;
      const directServices = services.filter(
        (service): service is Class =>
          typeof service !== "string" && Boolean(service?._id)
      );

      const needsResolution =
        directServices.length !== services.length ||
        directServices.length === 0;

      if (!needsResolution) {
        if (isMounted) {
          setPackageServices(directServices);
        }
        return;
      }

      const res = await getPopulatedClasses();
      const availableClasses = res?.data || [];
      const resolvedServices = services
        .map((service) => {
          if (typeof service !== "string" && service?._id) {
            return service;
          }

          return availableClasses.find(
            (classItem: Class) =>
              classItem?._id === service || classItem?.name === service
          );
        })
        .filter((service): service is Class => Boolean(service?._id));

      if (isMounted) {
        setPackageServices(resolvedServices);
      }
    };

    loadPackageServices();

    return () => {
      isMounted = false;
    };
  }, [selectedPackage]);

  useEffect(() => {
    if (hasSyncedInitialStep) return;

    if (!packageServices.length) {
      setStep(0);
      return;
    }

    const bookedIndexes = slots
      .map((slot) =>
        packageServices.findIndex((service) => service?._id === slot.classId)
      )
      .filter((index) => index >= 0);

    if (!bookedIndexes.length) {
      setStep(0);
      setHasSyncedInitialStep(true);
      return;
    }

    setStep(Math.min(Math.max(...bookedIndexes), packageServices.length - 1));
    setHasSyncedInitialStep(true);
  }, [hasSyncedInitialStep, packageServices, slots]);

  const currentClass = packageServices[step] || null;
  const existingSlotsForCurrentClass = useMemo(() => {
    if (!currentClass?._id) return [];
    return slots.filter((slot) => slot.classId === currentClass._id);
  }, [currentClass, slots]);

  const uniqueSlotsCount = useMemo(() => {
    const currentValid = slotDatas.filter((s) => s.date && s.time);
    const otherSlots = slots.filter(
      (s) => !currentValid.some((cv) => cv.sectionId === s.sectionId)
    );
    return otherSlots.length + currentValid.length;
  }, [slots, slotDatas]);

  const persistCurrentSlots = (currentStepSlots: slotDataType[]) => {
    if (unsavedItems.size > 0) {
      setMessage("Please save all appointments before moving on");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return null;
    }

    const validSlots = currentStepSlots.filter(
      (slot) => slot?.date && slot?.time
    );

    disptach(setSlots(validSlots));

    return [
      ...slots.filter(
        (slot) =>
          !validSlots.some((newSlot) => newSlot.sectionId === slot.sectionId)
      ),
      ...validSlots,
    ];
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        // overflowY: "scroll",
        position: "relative",
        paddingBottom: "4rem",
      }}
    >
      <SectionHeader
        title={`Appointments ${uniqueSlotsCount}/${selectedPackage?.days}`}
        isPrev={true}
        prev={() => {
          if (unsavedItems.size > 0) {
            setMessage("Please save all appointments before going back");
            setTimeout(() => {
              setMessage("");
            }, 2000);
            return;
          }
          disptach(setSlotsEmpty());
          prev();
        }}
      />
      {currentClass && (
        <PackageSigleClassAppointment
          key={`${currentClass?._id}-${step}`}
          step={step}
          setStep={() => setStep(step + 1)}
          prevStep={() => {
            if (step == 0) return;
            setStep(step - 1);
          }}
          classes={currentClass}
          slots={selectedPackage?.days ?? 0}
          setSlotsData={setSlotsData}
          existingSlots={existingSlotsForCurrentClass}
          onUnsavedStatusChange={handleUnsavedStatusChange}
          uniqueSlotsCount={uniqueSlotsCount}
          onRemoveSlot={(sectionId) => disptach(removeSlot(sectionId))}
        />
      )}
      {/* Step progress indicator */}
      {packageServices.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            padding: "0.5rem 1rem",
            alignItems: "center",
          }}
        >
          {packageServices.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background:
                  i < step
                    ? "#22c55e"
                    : i === step
                    ? "#1f0e4e"
                    : "#d1d5db",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="class-bottom-next bg-white">
        {step > 0 && (
          <button
            onClick={() => {
              const updatedSlots = persistCurrentSlots(slotDatas);
              if (!updatedSlots || step === 0) return;
              setStep((prevStep) => prevStep - 1);
            }}
            style={{
              background: "none",
              border: "1px solid #1f0e4e",
              color: "#1f0e4e",
            }}
          >
            ← Previous Class
          </button>
        )}
        <button
          onClick={() => {
            const updatedSlots = persistCurrentSlots(slotDatas);

            if (!updatedSlots) return;

            if (updatedSlots.length >= (selectedPackage?.days ?? 0)) {
              next();
              return;
            }

            if (step + 1 < packageServices.length) {
              setStep((prevStep) => prevStep + 1);
              return;
            }

            setMessage("Please select all available slots");
            setTimeout(() => {
              setMessage("");
            }, 2000);
          }}
          style={{
            color: message ? "orangered" : "white",
            border: message ? "1px solid red" : "none",
          }}
        >
          {message ||
            (uniqueSlotsCount >= (selectedPackage?.days ?? 0) ||
            step + 1 >= packageServices.length
              ? "Continue →"
              : "Next Class →")}
        </button>
      </div>
    </div>
  );
};

export default PackageAppointment;
