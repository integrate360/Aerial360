import React from "react";
import AppointmentCard from "./AppointmentCard";
import { useAppDispatch, useAppSelector } from "src/Redux/hooks";
import { Class } from "src/Utils/Types";
import { Clock, MapPin } from "lucide-react";
import SectionHeader from "../../MainUtils/SectionHeader";
import { setIsPackage, setSlots, setSlotsEmpty } from "src/Redux/appSlice";

const MainOverview = ({
  next,
  prev,
}: {
  next: () => void;
  prev: () => void;
}) => {
  const packageData = useAppSelector((state) => state.app?.selectedPackage);
  const slots = useAppSelector((state) => state.app?.slots);
  const filteredLocations = slots?.map((e) => e?.location?.name);
  const uniqueLocations = [...new Set(filteredLocations)];
  const dispatch = useAppDispatch();
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        paddingBottom: "4rem",
      }}
    >
      <SectionHeader
        title="Booking Overview"
        isPrev={true}
        prev={() => {
          dispatch(setSlotsEmpty());
          prev();
        }}
      />

      <div className="w-full  bg-white rounded-lg shadow-sm p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className=" justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900">
              {packageData?.name}
            </h2>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span
                  className="text-sm font-bold"
                  style={{
                    backgroundColor: "rgba(51, 22, 130, 0.1)",
                    color: "rgba(51, 22, 130, 1)",
                    padding: "4px 8px",
                    borderRadius: "25px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  INR {packageData?.price?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              All services are booked separately.
            </p>
          </div>

          {/* Validity */}
          <div className="flex gap-5 mt-3">
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Expires after {packageData?.duration} days
              </span>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-1 text-gray-600 align-center">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {uniqueLocations?.map((e, i) => (
                <span className="text-sm">
                  {e}
                  {i == 0 && uniqueLocations?.length > 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{ width: "100%", height: "1px", backgroundColor: "lightgray" }}
        ></div>
        <p className="text-sm text-gray-600">{packageData?.description}</p>
        {/* Services Dropdown */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Appointment Information
          </h2>
          {slots?.map((e, i) => (
            <AppointmentCard data={e} key={i} />
          ))}
        </div>
      </div>
      <div className="class-bottom-next bg-white">
        <button
          onClick={() => {
            if (slots?.length < (packageData?.days ?? 0)) return prev();
            dispatch(setIsPackage(true));
            next();
          }}
          style={{
            color: "white",
          }}
        >
          {slots?.length < (packageData?.days ?? 0)
            ? "Select Remaining Slots"
            : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default MainOverview;
