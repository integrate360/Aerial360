import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Calendar,
  Eye,
  Edit2,
  Trash2,
  X,
  Clock,
  User,
  MapPin,
  Users,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Check,
  Plus,
  Loader2,
  Search,
  Tag,
  Image as ImageIcon,
  Edit,
} from "lucide-react";
import {
  getAllLocations,
  getCategories,
  getStaff,
  createClass,
  updateClass,
  deleteClass,
} from "../../Apis/ApiCalls";
import ConfirmationModal from "../../layouts/ConfirmationModal";

// Utility function
const convertTo12HourFormat = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Helper function to get image URL
const getImageUrl = (image) => {
  if (!image) return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }
  return image;
};

// Sub-components
const ClassDisplay = ({ data, handleModalClose }) => {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleModalClose}
        />
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                No Class Selected
              </h2>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-gray-600">
              Please select a class to view details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleModalClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex justify-between items-center p-6">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {data.name || "Class Name"}
              </h1>
              <p className="text-gray-600 mt-1">
                Category: {getCategoryName(data.category)}
              </p>
            </div>
            <button
              onClick={handleModalClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Description
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                {data.description || "No description available"}
              </p>
            </div>
          </div>

          {/* Pricing */}
          {(data.price || data.offerPrice) && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.offerPrice && data.offerPrice > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm">Original Price</p>
                    <p className="text-xl font-semibold text-red-500 line-through">
                      ₹{data.offerPrice}
                    </p>
                  </div>
                )}
                {data.price && data.price > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm">Current Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{data.price}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  data.active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {data.active ? "Active" : "Inactive"}
              </span>
              <span className="text-gray-500 text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Availability Slots */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Class Schedule
            </h2>
            {data.availability && data.availability.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.availability.map((slot, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-blue-600">
                        {numToWeekDay[slot.day] || "Unknown Day"}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Slot {idx + 1}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-medium text-gray-800">
                            {convertTo12HourFormat(slot.time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium text-gray-800">
                            {slot.duration} minutes
                          </p>
                        </div>
                      </div>

                      {slot.trainers && slot.trainers.length > 0 && (
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Trainers</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {slot.trainers.map((trainer, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
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

                      {slot.locations && slot.locations.length > 0 && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Locations</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {slot.locations.map((location, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
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

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Max Capacity</p>
                          <p className="font-medium text-gray-800">
                            {slot.maxPeople} people
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                <p className="text-gray-600">
                  No availability slots configured for this class.
                </p>
              </div>
            )}
          </div>

          {/* Images */}
          {data.image && data.image.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Class Images
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.image.map((image, index) => {
                  const imageUrl = getImageUrl(image);
                  return imageUrl ? (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`${data.name} - Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm">
                          Image {index + 1}
                        </span>
                      </div> */}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p>Total Slots: {data.availability?.length || 0}</p>
                <p>Total Images: {data.image?.length || 0}</p>
              </div>
              <div className="text-sm text-gray-600">
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

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const ClassForm = ({
  isEdit = false,
  fetchData,
  handleModalClose,
  categories,
  trainers,
  location,
  data,
}) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    active: true,
    images: [],
    availability: [],
    offerPrice: "",
  });

  useEffect(() => {
    if (isEdit && data) {
      // Set existing images for preview
      if (data.image && Array.isArray(data.image)) {
        setExistingImages(data.image.map((img) => getImageUrl(img)));
      }

      setFormData({
        name: data.name || "",
        category:
          typeof data.category === "string"
            ? data.category
            : data.category?._id || "",
        description: data.description || "",
        price: data.price || "",
        active: data.active ?? true,
        images: [],
        offerPrice: data?.offerPrice || "",
        availability: Array.isArray(data.availability)
          ? data.availability.map((slot) => ({
              day: slot.day || 0,
              time: slot.time || "",
              duration: slot.duration || "",
              trainers: Array.isArray(slot.trainers)
                ? slot.trainers
                    .map((t) => (typeof t === "string" ? t : t._id))
                    .filter((t) => t !== undefined)
                : [],
              maxPeople: slot.maxPeople || "",
              locations: Array.isArray(slot.locations)
                ? slot.locations
                    .map((l) => (typeof l === "string" ? l : l._id))
                    .filter((l) => l !== undefined)
                : [],
            }))
          : [
              {
                day: "",
                time: "",
                duration: "",
                trainers: [],
                maxPeople: "",
                locations: [],
              },
            ],
      });
    } else {
      setFormData({
        offerPrice: "",
        name: "",
        category: "",
        description: "",
        price: "",
        active: true,
        images: [],
        availability: [
          {
            day: "",
            time: "",
            duration: "",
            trainers: [],
            maxPeople: "",
            locations: [],
          },
        ],
      });
      setExistingImages([]);
      setImagePreviews([]);
    }
  }, [isEdit, data]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      // Create preview URLs
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      // Add files to form data
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
    }
  };

  const removeImage = (index, isPreview = true) => {
    if (isPreview) {
      // Remove from previews and files
      URL.revokeObjectURL(imagePreviews[index]);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      const newFiles = formData.images.filter((_, i) => i !== index);
      setImagePreviews(newPreviews);
      setFormData((prev) => ({ ...prev, images: newFiles }));
    } else {
      // Remove existing image
      const newExisting = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExisting);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...formData.availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value,
    };
    setFormData({ ...formData, availability: newAvailability });
  };

  const handleTrainersChange = (index, trainerIds) => {
    handleAvailabilityChange(index, "trainers", trainerIds);
  };

  const handleLocationsChange = (index, locationIds) => {
    handleAvailabilityChange(index, "locations", locationIds);
  };

  const addAvailabilitySlot = () => {
    setFormData({
      ...formData,
      availability: [
        ...formData.availability,
        {
          day: "",
          time: "",
          duration: "",
          trainers: [],
          maxPeople: "",
          locations: [],
        },
      ],
    });
  };

  const removeAvailabilitySlot = (index) => {
    const newAvailability = formData.availability.filter((_, i) => i !== index);
    setFormData({ ...formData, availability: newAvailability });
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Validation
    if (!formData.name || !formData.description || !formData.price) {
      setError("Please fill in all required fields");
      setTimeout(() => setError(""), 2000);
      setLoading(false);
      return;
    }

    if (!isEdit && formData.images.length === 0) {
      setError("Please upload at least one image");
      setTimeout(() => setError(""), 2000);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("active", formData.active.toString());
      formDataToSend.append("offerPrice", formData.offerPrice || "");

      // Append images
      formData.images.forEach((file) => {
        formDataToSend.append("images", file);
      });

      // Append availability
      const availabilityData = formData.availability.map((slot) => ({
        ...slot,
        day: parseInt(slot.day) || 0,
        duration: parseInt(slot.duration) || 0,
        maxPeople: parseInt(slot.maxPeople) || 0,
      }));
      formDataToSend.append("availability", JSON.stringify(availabilityData));

      let response;
      if (isEdit) {
        response = await updateClass(formDataToSend, data?._id || "");
        if (response.status === 200) {
          toast.success("Class updated successfully!");
        } else {
          throw new Error(response.message || "Failed to update class");
        }
      } else {
        response = await createClass(formDataToSend);
        if (response.status === 200) {
          toast.success("Class created successfully!");
        } else {
          throw new Error(response.message || "Failed to create class");
        }
      }

      fetchData();
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.message || `Error ${isEdit ? "updating" : "creating"} class`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-xl p-8 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-800">
            {isEdit ? "Updating..." : "Creating..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleModalClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-xl font-bold text-gray-800">
              {isEdit ? "Edit Class" : "Add New Class"}
            </h2>
            <button
              onClick={handleModalClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price before Offer
              </label>
              <input
                type="number"
                name="offerPrice"
                value={formData.offerPrice}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Availability Slots */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Availability Slots
            </h3>
            {formData.availability.map((slot, index) => (
              <div
                key={index}
                className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">
                    Slot {index + 1}
                  </h4>
                  {formData.availability.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAvailabilitySlot(index)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={slot.day}
                      onChange={(e) =>
                        handleAvailabilityChange(index, "day", e.target.value)
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Day</option>
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "time",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={slot.duration}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "duration",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max People <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={slot.maxPeople}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "maxPeople",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Trainers Multi-select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trainers
                    </label>
                    <div className="border border-gray-300 rounded-lg p-2 min-h-[100px] max-h-[150px] overflow-y-auto">
                      {trainers.map((trainer) => (
                        <div
                          key={trainer._id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            id={`trainer-${index}-${trainer._id}`}
                            checked={slot.trainers.includes(trainer._id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const newTrainers = isChecked
                                ? [...slot.trainers, trainer._id]
                                : slot.trainers.filter(
                                    (id) => id !== trainer._id,
                                  );
                              handleTrainersChange(index, newTrainers);
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`trainer-${index}-${trainer._id}`}
                            className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
                          >
                            {trainer.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {slot.trainers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {slot.trainers.map((trainerId) => {
                          const trainer = trainers.find(
                            (t) => t._id === trainerId,
                          );
                          return trainer ? (
                            <span
                              key={trainerId}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm flex items-center gap-1"
                            >
                              {trainer.name}
                              <button
                                type="button"
                                onClick={() => {
                                  const newTrainers = slot.trainers.filter(
                                    (id) => id !== trainerId,
                                  );
                                  handleTrainersChange(index, newTrainers);
                                }}
                                className="text-blue-600 hover:text-blue-800 ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Locations Multi-select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Locations
                    </label>
                    <div className="border border-gray-300 rounded-lg p-2 min-h-[100px] max-h-[150px] overflow-y-auto">
                      {location.map((loc) => (
                        <div
                          key={loc._id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            id={`location-${index}-${loc._id}`}
                            checked={slot.locations.includes(loc._id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const newLocations = isChecked
                                ? [...slot.locations, loc._id]
                                : slot.locations.filter((id) => id !== loc._id);
                              handleLocationsChange(index, newLocations);
                            }}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <label
                            htmlFor={`location-${index}-${loc._id}`}
                            className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
                          >
                            {loc.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {slot.locations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {slot.locations.map((locationId) => {
                          const locationObj = location.find(
                            (l) => l._id === locationId,
                          );
                          return locationObj ? (
                            <span
                              key={locationId}
                              className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm flex items-center gap-1"
                            >
                              {locationObj.name}
                              <button
                                type="button"
                                onClick={() => {
                                  const newLocations = slot.locations.filter(
                                    (l) => l !== locationId,
                                  );
                                  handleLocationsChange(index, newLocations);
                                }}
                                className="text-green-600 hover:text-green-800 ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addAvailabilitySlot}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Availability Slot
            </button>
          </div>

          {/* File Upload with Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isEdit
                ? "Images (New images will replace existing ones)"
                : "Images *"}
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
              />
            </div>

            {/* Existing Images (for edit mode) */}
            {isEdit && existingImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Existing Images:
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={img}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=Image";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, false)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  New Images:
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={`preview-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, true)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {imagePreviews.length} new file(s) selected
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="active"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Active
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
            >
              {isEdit ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Update
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClassTable = ({
  classes,
  editModal,
  viewModal,
  selectedClass,
  handleDeleteClass,
  searchText,
  currentPage,
  setCurrentPage,
}) => {
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setRows(classes || []);
  }, [classes]);

  // Filter classes based on search text
  const filteredClasses = rows.filter(
    (cls) =>
      cls.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      cls.category?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDeleteClick = (id, name) => {
    setClassToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;

    setIsDeleting(true);
    try {
      const del = await deleteClass(classToDelete.id.toString());

      if (del?.status !== 200) {
        throw new Error("Failed to delete class");
      }

      setRows(rows.filter((row) => row._id !== classToDelete.id));
      toast.success(`${classToDelete.name} has been deleted successfully!`);
      setShowDeleteModal(false);
      setClassToDelete(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete class. Please try again.");
      toast.error("Failed to delete class");
    } finally {
      setIsDeleting(false);
    }
  };

  const TableHeader = ({ icon, label }) => (
    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </th>
  );

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide rounded-xl shadow-sm border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <TableHeader
                icon={<User className="w-4 h-4 text-blue-600" />}
                label="Name"
              />
              <TableHeader
                icon={<Tag className="w-4 h-4 text-blue-600" />}
                label="Category"
              />
              <TableHeader
                icon={<h2 className="text-[15px] text-blue-600">₹</h2>}
                label="Price"
              />
              <TableHeader
                icon={<ImageIcon className="w-4 h-4 text-blue-600" />}
                label="Images"
              />
              <TableHeader
                icon={<Check className="w-4 h-4 text-blue-600" />}
                label="Status"
              />
              <TableHeader
                icon={<Calendar className="w-4 h-4 text-blue-600" />}
                label="Actions"
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedClasses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No classes found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchText
                      ? "Try a different search term"
                      : "Start by adding a new class"}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedClasses.map((row) => (
                <tr
                  key={row._id}
                  className="hover:bg-blue-50/50 transition-colors duration-200"
                >
                  {/* Name */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col justify-center h-full">
                      <span className="text-sm font-medium text-gray-800">
                        {row.name || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col justify-center h-full">
                      <span className="text-sm font-medium text-gray-800">
                        {row.category?.title || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-800">
                      ₹{row.price || 0}
                    </span>
                  </td>

                  {/* Images */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {row.image?.slice(0, 3).map((img, index) => {
                        const imageUrl = getImageUrl(img);
                        return imageUrl ? (
                          <div key={index} className="w-12 h-12 flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={`Class ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/48?text=Image";
                              }}
                            />
                          </div>
                        ) : null;
                      })}
                      {row.image?.length > 3 && (
                        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <span className="text-xs text-gray-600">
                            +{row.image.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        row.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {row.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          selectedClass(row);
                          viewModal();
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          selectedClass(row);
                          editModal();
                        }}
                        className="p-2 hover:bg-yellow-50 rounded-lg transition-colors text-gray-600 hover:text-yellow-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(row._id, row.name)}
                        disabled={isDeleting && selectedId === row._id}
                        className={`p-2 hover:bg-red-50 rounded-lg transition-colors ${
                          error && row._id === selectedId
                            ? "text-red-600"
                            : "text-gray-600 hover:text-red-600"
                        }`}
                        title="Delete"
                      >
                        {isDeleting && selectedId === row._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 md:px-6 py-4 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div className="text-sm text-gray-600 text-center md:text-left">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredClasses?.length)} of{" "}
            {filteredClasses?.length} classes
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Page Numbers - Responsive */}
            <div className="flex items-center justify-center gap-1 order-2 sm:order-1">
              {/* Prev Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* MOBILE (3 pages) */}
              <div className="flex sm:hidden items-center gap-1 overflow-x-auto max-w-[200px] px-2">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;

                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] px-2 py-1.5 rounded-lg transition-colors text-sm ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* DESKTOP (5 pages) */}
              <div className="hidden sm:flex items-center gap-1 px-0">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] px-2 py-1.5 rounded-lg transition-colors text-sm ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Page Info - For mobile only */}
            <div className="text-sm text-gray-600 text-center order-1 sm:order-2 sm:hidden">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setClassToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Class"
        message={`Are you sure you want to delete "${classToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

// Main ClassList Component
const ClassList = ({ fetchClasses, classess, chooseCalender }) => {
  const [cats, setCats] = useState([]);
  const [staff, setStaff] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedClass, setSelectedClass] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      const [res, res2, res3] = await Promise.all([
        getStaff(),
        getCategories(),
        getAllLocations(),
      ]);

      if (res?.status !== 200 || res2?.status !== 200) {
        toast.error("Failed to fetch data");
        return;
      }

      setStaff(res?.data || []);
      setCats(res2?.data || []);
      setLocations(res3?.data || []);
      fetchClasses();
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Classes
              </h1>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, category, or description"
                  value={searchText}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full sm:w-64"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="p-2 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg transition-colors flex items-center gap-2"
                  onClick={chooseCalender}
                  title="Calendar View"
                >
                  <Calendar className="w-5 h-5" />
                </button>

                <button
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center sm:justify-start"
                  onClick={handleModalOpen}
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Class</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="p-2">
          <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
            <ClassTable
              classes={classess}
              editModal={() => setEditModal(true)}
              viewModal={() => setViewModal(true)}
              selectedClass={(e) => setSelectedClass(e)}
              handleDeleteClass={deleteClass}
              searchText={searchText}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {openModal && (
        <ClassForm
          isEdit={false}
          fetchData={fetchData}
          handleModalClose={handleModalClose}
          categories={cats}
          trainers={staff}
          location={locations}
        />
      )}

      {editModal && (
        <ClassForm
          isEdit={true}
          fetchData={fetchData}
          handleModalClose={() => setEditModal(false)}
          categories={cats}
          trainers={staff}
          location={locations}
          data={selectedClass}
        />
      )}

      {viewModal && (
        <ClassDisplay
          data={selectedClass}
          handleModalClose={() => setViewModal(false)}
        />
      )}
    </div>
  );
};

export default ClassList;
