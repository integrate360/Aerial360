import React from "react";
import {
  Package,
  Clock,
  DollarSign,
  X,
  Calendar,
  User,
  AlertCircle,
  Check,
  CalendarIcon,
} from "lucide-react";

const ServiceSelectionModal = ({
  open,
  onClose,
  selectedPackageBooking,
  remainingSlots,
  onServiceSelect,
}) => {
  if (!open || !selectedPackageBooking) return null;

  const { package: packageData, user } = selectedPackageBooking;

  const handleServiceBook = (service) => {
    onServiceSelect(service);
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) return "Invalid Time";
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const getDayName = (dayNumber) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayNumber] || `Day ${dayNumber}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Select Service to Book
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">{packageData.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${remainingSlots <= 0 ? "text-red-600" : "text-blue-600"}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{remainingSlots} slots</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Alert */}
          {remainingSlots <= 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">No remaining slots available</p>
                <p className="text-sm mt-1">
                  Please purchase additional slots to book more classes.
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Available Services
            </h3>

            {remainingSlots > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  {remainingSlots} slot{remainingSlots !== 1 ? "s" : ""}{" "}
                  available for booking
                </span>
              </div>
            )}
          </div>

          {/* Services Grid */}
          {packageData.services &&
          packageData.services.filter((service) => service.active !== false)
            .length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packageData.services
                .filter((service) => service.active !== false)
                .map((service) => (
                  <div
                    key={service._id}
                    className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 bg-white flex flex-col"
                  >
                    {/* Service Image */}
                    {service.image && service.image.length > 0 && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={service.image[0]}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* {service.category && (
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                              {service.category}
                            </span>
                          </div>
                        )} */}
                      </div>
                    )}

                    {/* Service Content */}
                    <div className="p-5 flex-1">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-lg text-gray-800 line-clamp-1">
                            {service.name}
                          </h4>
                          {service.active === false && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              Inactive
                            </span>
                          )}
                        </div>

                        {service.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                            {service.description}
                          </p>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="mb-4">
                        {service.price && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-gray-800">
                                ₹{service.price.toLocaleString()}
                              </span>
                              {service.offerPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{service.offerPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Availability Info */}
                      {service.availability &&
                        service.availability.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">
                                Available Times
                              </span>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                              {service.availability
                                .slice(0, 4)
                                .map((slot, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-xs"
                                  >
                                    <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                    <span className="text-gray-700 font-medium">
                                      {getDayName(slot.day)}
                                    </span>
                                    <span className="text-gray-600">
                                      {formatTimeDisplay(slot.time)}
                                    </span>
                                    {slot.duration && (
                                      <span className="text-gray-500 text-xs">
                                        ({slot.duration} min)
                                      </span>
                                    )}
                                  </div>
                                ))}
                              {service.availability.length > 4 && (
                                <div className="text-xs text-gray-500 italic">
                                  +{service.availability.length - 4} more time
                                  slots
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => handleServiceBook(service)}
                        disabled={remainingSlots <= 0}
                        className={`
                          w-full px-4 py-3 rounded-lg font-medium transition-all duration-200
                          flex items-center justify-center gap-2
                          ${
                            remainingSlots <= 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white"
                          }
                        `}
                      >
                        <CalendarIcon className="w-4 h-4" />
                        Book Service
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Services Available
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                There are no active services available for this package at the
                moment.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {packageData.services?.filter((s) => s.active !== false)
                    .length || 0}
                </span>{" "}
                active service
                {packageData.services?.filter((s) => s.active !== false)
                  .length !== 1
                  ? "s"
                  : ""}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal;
