import { useState } from "react";

// Icon component
const IconifyIcon = ({
  icon,
  color = "currentColor",
  fontSize = "1rem",
  className = "",
  onClick = () => {},
}) => {
  const iconMap = {
    "mingcute:close-fill": "✕",
    "mingcute:clock-line": "🕐",
    "mingcute:user-2-line": "👤",
    "mingcute:location-2-line": "📍",
    "mingcute:users-line": "👥",
    "mingcute:calendar-line": "📅",
    "mingcute:time-line": "⏱️",
  };

  return (
    <span
      className={className}
      style={{
        color,
        fontSize,
        cursor: onClick ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClick}
    >
      {iconMap[icon] || icon}
    </span>
  );
};

// Utility function
const convertTo12HourFormat = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const ClassDisplay = ({ data, handleModalClose, imageApi }) => {
  const numToWeekDay = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  const getCategoryName = (category) => {
    if (!category) return "No Category";
    if (typeof category === "object") return category.title || "No Category";
    return category;
  };

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900 text-white rounded-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">No Class Selected</h2>
            <button
              onClick={handleModalClose}
              className="p-2 hover:bg-gray-800 rounded"
            >
              <IconifyIcon icon="mingcute:close-fill" fontSize="1.25rem" />
            </button>
          </div>
          <p>Please select a class to view details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-gray-900">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">
              {data.name || "Class Name"}
            </h1>
            <p className="text-gray-400 mt-1">
              Category: {getCategoryName(data.category)}
            </p>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 hover:bg-gray-800 rounded"
          >
            <IconifyIcon icon="mingcute:close-fill" fontSize="1.25rem" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <div className="bg-gray-800 rounded p-4">
              <p className="text-gray-300 leading-relaxed">
                {data.description || "No description available"}
              </p>
            </div>
          </div>

          {/* Pricing */}
          {(data.price || data.offerPrice) && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.offerPrice && data.offerPrice > 0 && (
                  <div className="bg-gray-800 rounded p-4">
                    <p className="text-gray-400 text-sm">Original Price</p>
                    <p className="text-xl font-semibold text-red-400 line-through">
                      ${data.offerPrice}
                    </p>
                  </div>
                )}
                {data.price && data.price > 0 && (
                  <div className="bg-gray-800 rounded p-4">
                    <p className="text-gray-400 text-sm">Current Price</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${data.price}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.active
                    ? "bg-green-900 text-green-300"
                    : "bg-red-900 text-red-300"
                }`}
              >
                {data.active ? "Active" : "Inactive"}
              </span>
              <span className="text-gray-400 text-sm">
                • Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Availability Slots */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Class Schedule</h2>
            {data.availability && data.availability.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.availability.map((slot, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-cyan-400">
                        {numToWeekDay[slot.day] || "Unknown Day"}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-cyan-900 text-cyan-300 rounded">
                        Slot {idx + 1}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <IconifyIcon
                          icon="mingcute:time-line"
                          className="text-cyan-400"
                        />
                        <div>
                          <p className="text-sm text-gray-400">Time</p>
                          <p className="font-medium">
                            {convertTo12HourFormat(slot.time)}
                          </p>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-2">
                        <IconifyIcon
                          icon="mingcute:clock-line"
                          className="text-cyan-400"
                        />
                        <div>
                          <p className="text-sm text-gray-400">Duration</p>
                          <p className="font-medium">{slot.duration} minutes</p>
                        </div>
                      </div>

                      {/* Trainers */}
                      {slot.trainers && slot.trainers.length > 0 && (
                        <div className="flex items-start gap-2">
                          <IconifyIcon
                            icon="mingcute:user-2-line"
                            className="text-cyan-400 mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-400">Trainers</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {slot.trainers.map((trainer, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs"
                                >
                                  {typeof trainer === "object"
                                    ? trainer.name
                                    : trainer}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Locations */}
                      {slot.locations && slot.locations.length > 0 && (
                        <div className="flex items-start gap-2">
                          <IconifyIcon
                            icon="mingcute:location-2-line"
                            className="text-cyan-400 mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-400">Locations</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {slot.locations.map((location, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs"
                                >
                                  {typeof location === "object"
                                    ? location.name
                                    : location}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Max People */}
                      <div className="flex items-center gap-2">
                        <IconifyIcon
                          icon="mingcute:users-line"
                          className="text-cyan-400"
                        />
                        <div>
                          <p className="text-sm text-gray-400">Max Capacity</p>
                          <p className="font-medium">{slot.maxPeople} people</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded p-6 text-center">
                <p className="text-gray-400">
                  No availability slots configured for this class.
                </p>
              </div>
            )}
          </div>

          {/* Images */}
          {data.image && data.image.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Class Images</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.image.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageApi + image}
                      alt={`${data.name} - Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm">
                        Image {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                <p>Total Slots: {data.availability?.length || 0}</p>
                <p>Total Images: {data.image?.length || 0}</p>
              </div>
              <div className="text-sm text-gray-400">
                <p>ID: {data._id?.substring(0, 8)}...</p>
                <p>Class created on: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDisplay;
