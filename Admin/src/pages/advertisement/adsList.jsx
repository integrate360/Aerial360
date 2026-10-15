import { useState, useEffect } from "react";
import { createAds, getAds, getClasses } from "../../Apis/ApiCalls";
import AdsTable from "./adstable";
import {
  Plus,
  X,
  UploadCloud,
  Layers,
  FileText,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";

const AdsList = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [classes, setClasses] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    class: null,
    name: "",
    description: "",
    image: null,
    imagePreview: null,
  });
  const [searchText, setSearchText] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adsRes, classesRes] = await Promise.all([getAds(), getClasses()]);

      if (adsRes?.status !== 200 || classesRes?.status !== 200) {
        setError(true);
        setMessage(adsRes?.message || "Failed to load data.");
        toast.error("Failed to load data");
        return;
      }
      setClasses(classesRes?.data || []);
      setAds(adsRes?.data?.reverse() || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
      setMessage("Failed to fetch data");
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => {
    setOpenModal(false);
    setFormData({
      class: null,
      name: "",
      description: "",
      image: null,
      imagePreview: null,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image: file,
        imagePreview: previewUrl,
      });
    }
  };

  const handleClassChange = (selectedClass) => {
    setFormData({ ...formData, class: selectedClass });
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.image) {
      setError(true);
      setMessage("Please fill in all required fields.");
      toast.error("Please fill in all required fields");
      setTimeout(() => {
        setError(false);
        setMessage("");
      }, 2000);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append(
        "class",
        formData.class ? formData.class._id || "" : "",
      );
      formDataToSend.append("description", formData.description);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const create = await createAds(formDataToSend);
      if (create.status !== 201) {
        throw new Error("Creation failed");
      }

      fetchData();
      handleModalClose();
      setMessage("Banner created successfully!");
      toast.success("Banner created successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(true);
      setMessage("Failed to create banner. Please try again.");
      toast.error("Failed to create banner");
      setTimeout(() => {
        setError(false);
        setMessage("");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get image URL
  const getImageUrl = (imageData) => {
    if (!imageData) return null;

    if (typeof imageData === "string") {
      if (imageData.startsWith("http")) {
        return imageData;
      }
      return `${window.location.origin}/uploads/${imageData}`;
    }

    return null;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="w-full md:w-auto">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Banner Management
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage advertising banners for your application
                </p>
              </div>

              {/* Search and Add Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search banners..."
                    value={searchText}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full sm:w-64"
                  />
                </div>

                <button
                  onClick={handleModalOpen}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Banner</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-2">
            <AdsTable ads={ads} />
          </div>
        </div>

        {/* Add Banner Modal */}
        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleModalClose}
            />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
                <div className="flex justify-between items-center p-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Add New Banner
                  </h2>
                  <button
                    onClick={handleModalClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Class Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Class
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.class?._id || ""}
                      onChange={(e) =>
                        handleClassChange(
                          classes.find((c) => c._id === e.target.value),
                        )
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none bg-white"
                    >
                      <option value="">General (No specific class)</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="e.g. Summer Sale"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Short description..."
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Image <span className="text-red-500">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {formData.imagePreview ? (
                        <div className="text-center">
                          <CheckCircle
                            className="mx-auto text-green-500 mb-2"
                            size={24}
                          />
                          <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                            {formData.image?.name}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            Click to change
                          </p>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold text-blue-600">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>

                  {/* Image Preview */}
                  {formData.imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="h-32 w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleModalClose}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      loading ||
                      !formData.name.trim() ||
                      !formData.description.trim() ||
                      !formData.image
                    }
                    className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Create Banner
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdsList;
