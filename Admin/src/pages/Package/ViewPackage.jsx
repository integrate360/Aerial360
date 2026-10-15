import React from "react";
import {
  Calendar,
  Clock,
  IndianRupee,
  X,
  Tag,
  Package,
  Check,
} from "lucide-react";

const PackageDisplay = ({ data, handleModalClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white rounded-t-xl">
          <div className="flex gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl h-fit">
              <Package size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
              {data.category?.title && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500 font-medium">
                  <Tag size={14} />
                  <span>{data.category.title}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
              <Clock className="mx-auto text-blue-600 mb-2" size={20} />
              <p className="text-lg font-bold text-gray-900">{data.duration}</p>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Days Validity
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
              <IndianRupee className="mx-auto text-green-600 mb-2" size={20} />
              <div className="flex flex-col items-center">
                {data.offerPrice > 0 ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{data.offerPrice}
                    </p>
                    <span className="text-xs text-gray-400 line-through">
                      ₹{data.price}
                    </span>
                  </>
                ) : (
                  <p className="text-lg font-bold text-gray-900">
                    ₹{data.price}
                  </p>
                )}
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Price
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
              <Calendar className="mx-auto text-purple-600 mb-2" size={20} />
              <p className="text-lg font-bold text-gray-900">{data.days}</p>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Weekly Slots
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Description
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                {data.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Included Services List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Included Services
            </h3>
            {Array.isArray(data.services) && data.services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.services.map((service, index) => (
                  <div
                    key={service._id || index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="mt-0.5 min-w-[16px]">
                      <Check size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {service.name}
                      </h4>
                      {service.price && (
                        <span className="text-xs text-gray-500 mt-1 block">
                          Value: ₹{service.price}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No specific services listed.
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>
              Created:{" "}
              {new Date(data.createdAt || Date.now()).toLocaleDateString()}
            </span>
            {data.updatedAt && (
              <span>
                Updated: {new Date(data.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDisplay;
