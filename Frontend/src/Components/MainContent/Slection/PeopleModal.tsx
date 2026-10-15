import React, { useState } from "react";
import { Minus, Plus, X } from "lucide-react";

const BringingAnyoneModal = ({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (additionalPeople: number) => void;
}) => {
  const [additionalPeople, setAdditionalPeople] = useState(0);

  const handleDecrement = () => {
    if (additionalPeople > 0) {
      setAdditionalPeople((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    setAdditionalPeople((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Bringing anyone with you?</h2>
          <button
            onClick={() => onClose()}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm">Additional people</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center">{additionalPeople}</span>
              <button
                onClick={handleIncrement}
                className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Number of people that are coming with you.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => onClose()}
            className="px-6 py-2 border rounded-md hover:bg-gray-50"
          >
            No
          </button>
          <button
            onClick={() => onConfirm(additionalPeople)}
            className={`px-6 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 ${
              additionalPeople == 0 ? "cursor-not-allowed" : ""
            }`}
            disabled={additionalPeople == 0}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BringingAnyoneModal;
