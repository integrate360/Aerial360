import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: <XCircle className="w-12 h-12 text-red-600" />,
          confirmButton:
            "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500",
          iconBg: "bg-red-50",
        };
      case "success":
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600" />,
          confirmButton:
            "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-green-500",
          iconBg: "bg-green-50",
        };
      case "info":
        return {
          icon: <Info className="w-12 h-12 text-blue-600" />,
          confirmButton:
            "bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white focus:ring-blue-500",
          iconBg: "bg-blue-50",
        };
      case "warning":
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-yellow-600" />,
          confirmButton:
            "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white focus:ring-yellow-500",
          iconBg: "bg-yellow-50",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-sm">
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <XCircle className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="bg-white px-6 pt-6 pb-5">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${styles.iconBg} mb-4`}
              >
                {styles.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-[#1A1D25] mb-2">{title}</h3>

              {/* Message */}
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                {message}
              </p>

              {/* Buttons */}
              <div className="mt-6 flex w-full gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${styles.confirmButton}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage:
// <ConfirmationModal
//   isOpen={showModal}
//   onClose={() => setShowModal(false)}
//   onConfirm={handleConfirm}
//   title="Delete Booking"
//   message="Are you sure you want to delete this booking? This action cannot be undone."
//   confirmText="Delete"
//   cancelText="Cancel"
//   type="danger"
//   isLoading={isDeleting}
// />

export default ConfirmationModal;
