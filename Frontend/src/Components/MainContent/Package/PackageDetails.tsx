import React from "react";
import { MapPin, Clock, ChevronDown } from "lucide-react";
import { Class, PackageClass } from "src/Utils/Types";
import { useAppSelector } from "src/Redux/hooks";

const PackageDetails = ({
  next,
  prev,
}: {
  next: () => void;
  prev: () => void;
}) => {
  const packageData = useAppSelector((state) => state.app.selectedPackage);

  return (
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
            <span className="text-sm">Multiple Locations</span>
          </div>
        </div>
      </div>

      {/* Services Dropdown */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          {packageData?.name} allows you to select from:
        </p>
        {packageData?.services?.map((e: Class | string) => (
          <div className="p-2 flex gap-2 border border-gray-400 rounded">
            <div style={{ height: "60px", width: "60px" }}>
              {typeof e !== "string" && (
                <img
                  src={(e as Class)?.image?.[0]}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              )}
            </div>
            <div className="">
              <p className="text-sm font-bold">
                {typeof e !== "string" && (e as Class)?.name}
              </p>
              <p className="text-sm text-gray-500" style={{ fontSize: "12px" }}>
                {typeof e !== "string" && (e as Class)?.description}
              </p>
              {/* <ChevronDown className="w-5 h-5" /> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageDetails;
