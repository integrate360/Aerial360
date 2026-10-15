import React, { useState } from "react";
import { createPackage } from "../../Apis/ApiCalls";
import {
  X,
  Loader2,
  CheckCircle,
  Clock,
  Calendar,
  IndianRupee,
  Tag,
  Package2,
  Layers,
  Info,
} from "lucide-react";

const AddPackage = ({ fetchData, handleModalClose, classes, category }) => {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    services: [],
    duration: "",
    price: "",
    offerPrice: "",
    category: "",
    days: "",
  });

  const [touched, setTouched] = useState({});

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleServiceToggle = (classId) => {
    const currentServices = [...formData.services];
    const index = currentServices.indexOf(classId);
    if (index > -1) currentServices.splice(index, 1);
    else currentServices.push(classId);
    setFormData({ ...formData, services: currentServices });
  };

  const validateForm = () => {
    if (!formData.name) return "Name is required";
    if (!formData.category) return "Category is required";
    if (formData.services.length === 0) return "Select at least one service";
    if (!formData.price) return "Price is required";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(true);
      setMessage(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await createPackage(formData);
      if (response.status === 201) {
        setSuccess(true);
        setMessage("Package created successfully!");
        setTimeout(() => {
          fetchData();
          handleModalClose();
        }, 1000);
      } else {
        throw new Error("Failed");
      }
    } catch (err) {
      setError(true);
      setMessage("Failed to create package.");
    } finally {
      setLoading(false);
    }
  };

  // Styles for Clean UI
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400";
  const iconInputContainer = "relative";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Package2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Add New Package
              </h2>
              <p className="text-sm text-gray-500">
                Create a new service bundle for your customers
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Alerts */}
          {(error || success) && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
            >
              {success ? <CheckCircle size={20} /> : <X size={20} />}
              <p className="font-medium text-sm">{message}</p>
              <button
                onClick={() => {
                  setError(false);
                  setSuccess(false);
                }}
                className="ml-auto"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                <Info size={18} className="text-blue-600" /> Basic Details
              </h3>

              <div>
                <label className={labelClass}>Package Name</label>
                <input
                  type="text"
                  name="name"
                  className={inputClass}
                  placeholder="e.g. Summer Fitness Pro"
                  onChange={handleFormChange}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  rows={4}
                  className={inputClass}
                  placeholder="Detailed description..."
                  onChange={handleFormChange}
                ></textarea>
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <div className={iconInputContainer}>
                  <Layers className={iconClass} size={18} />
                  <select
                    name="category"
                    className={`${inputClass} pl-10 appearance-none bg-white`}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Category</option>
                    {category?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                <Tag size={18} className="text-blue-600" /> Services & Pricing
              </h3>

              <div>
                <label className={labelClass}>Include Services</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {classes?.map((cls) => (
                    <div
                      key={cls._id}
                      onClick={() => handleServiceToggle(cls._id)}
                      className={`cursor-pointer px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 border transition-all ${
                        formData.services.includes(cls._id)
                          ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                          : "bg-white border-transparent text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.services.includes(cls._id) ? "bg-blue-600 border-blue-600" : "border-gray-400"}`}
                      >
                        {formData.services.includes(cls._id) && (
                          <CheckCircle size={10} className="text-white" />
                        )}
                      </div>
                      {cls.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Duration (Days)</label>
                  <div className={iconInputContainer}>
                    <Clock className={iconClass} size={18} />
                    <input
                      type="number"
                      name="duration"
                      className={`${inputClass} pl-10`}
                      placeholder="30"
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Slots</label>
                  <div className={iconInputContainer}>
                    <Calendar className={iconClass} size={18} />
                    <input
                      type="number"
                      name="days"
                      className={`${inputClass} pl-10`}
                      placeholder="12"
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Regular Price</label>
                  <div className={iconInputContainer}>
                    <IndianRupee className={iconClass} size={18} />
                    <input
                      type="number"
                      name="price"
                      className={`${inputClass} pl-10`}
                      placeholder="5000"
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Offer Price</label>
                  <div className={iconInputContainer}>
                    <IndianRupee className={iconClass} size={18} />
                    <input
                      type="number"
                      name="offerPrice"
                      className={`${inputClass} pl-10`}
                      placeholder="4500"
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            onClick={handleModalClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-white hover:shadow-sm transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            Create Package
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPackage;
