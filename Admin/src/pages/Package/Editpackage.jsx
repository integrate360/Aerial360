import React, { useEffect, useState } from "react";
import { updatePackage } from "../../Apis/ApiCalls";
import {
  X,
  Loader2,
  CheckCircle,
  Clock,
  Calendar,
  IndianRupee,
  Layers,
  FileText,
  Check,
} from "lucide-react";

const EditPackage = ({
  fetchData,
  handleModalClose,
  classes,
  data,
  category,
}) => {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    services: [],
    duration: 0,
    price: 0,
    offerPrice: 0,
    category: "",
    days: 0,
  });

  useEffect(() => {
    if (data) {
      let categoryId = "";
      if (data.category) {
        categoryId =
          typeof data.category === "object" ? data.category._id : data.category;
      }

      setFormData({
        name: data.name || "",
        description: data.description || "",
        category: categoryId || "",
        services: data.services
          ? data.services.map((s) => s._id).filter((id) => !!id)
          : [],
        duration: data.duration || 0,
        price: data.price || 0,
        days: data.days || 0,
        offerPrice: data?.offerPrice || 0,
      });
    }
  }, [data]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceToggle = (classId) => {
    const currentServices = [...formData.services];
    const index = currentServices.indexOf(classId);
    if (index > -1) {
      currentServices.splice(index, 1);
    } else {
      currentServices.push(classId);
    }
    setFormData({ ...formData, services: currentServices });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      setError(true);
      setMessage("Name and Price are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await updatePackage(formData, data?._id || "");
      if (response.status === 200) {
        setSuccess(true);
        setMessage("Package updated successfully!");
        setTimeout(() => {
          fetchData();
          handleModalClose();
        }, 1500);
      } else {
        throw new Error("Error updating package");
      }
    } catch (error) {
      setError(true);
      setMessage("Failed to update package.");
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const labelStyle = "block text-sm font-semibold text-gray-700 mb-1.5";
  const inputStyle =
    "w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const iconInputWrapper = "relative";
  const inputIcon = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Package</h2>
            <p className="text-sm text-gray-500">
              Update package details and pricing
            </p>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
          {/* Status Messages */}
          {(error || success) && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${error ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
            >
              {success ? <CheckCircle size={20} /> : <X size={20} />}
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                Basic Information
              </h3>

              <div>
                <label className={labelStyle}>Package Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Description</label>
                <div className={iconInputWrapper}>
                  <FileText
                    className={`${inputIcon} top-4 translate-y-0`}
                    size={18}
                  />
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleFormChange}
                    className={`${inputStyle} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelStyle}>Category</label>
                <div className={iconInputWrapper}>
                  <Layers className={inputIcon} size={18} />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className={`${inputStyle} pl-10 appearance-none`}
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

            {/* Right Column: Configuration */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                Services & Pricing
              </h3>

              {/* Services Selector */}
              <div>
                <label className={labelStyle}>Included Services</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                  {classes?.map((cls) => {
                    const isSelected = formData.services.includes(cls._id);
                    return (
                      <div
                        key={cls._id}
                        onClick={() => handleServiceToggle(cls._id)}
                        className={`cursor-pointer p-3 rounded-lg border flex items-center gap-3 transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                            : "bg-white border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
                        >
                          {isSelected && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${isSelected ? "text-blue-800" : "text-gray-700"}`}
                        >
                          {cls.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Duration (Days)</label>
                  <div className={iconInputWrapper}>
                    <Clock className={inputIcon} size={18} />
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleFormChange}
                      className={`${inputStyle} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Slots</label>
                  <div className={iconInputWrapper}>
                    <Calendar className={inputIcon} size={18} />
                    <input
                      type="number"
                      name="days"
                      value={formData.days}
                      onChange={handleFormChange}
                      className={`${inputStyle} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div>
                  <label className={labelStyle}>Regular Price</label>
                  <div className={iconInputWrapper}>
                    <IndianRupee className={inputIcon} size={18} />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      className={`${inputStyle} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>
                    Offer Price{" "}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <div className={iconInputWrapper}>
                    <IndianRupee className={inputIcon} size={18} />
                    <input
                      type="number"
                      name="offerPrice"
                      value={formData.offerPrice}
                      onChange={handleFormChange}
                      className={`${inputStyle} pl-10`}
                    />
                  </div>
                  {formData.offerPrice > 0 &&
                    formData.price > formData.offerPrice && (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        {Math.round(
                          ((formData.price - formData.offerPrice) /
                            formData.price) *
                            100,
                        )}
                        % Discount Applied
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleModalClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPackage;
