import React, { useState, useEffect } from "react";
import { getAllAppVersions, upsertAppVersion } from "../../Apis/ApiCalls";
import {
  Smartphone,
  Play,
  Calendar,
  Edit2,
  Save,
  X,
  ExternalLink,
  AlertCircle,
  MessageSquare,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";

// Custom Apple Icon component
const AppleIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.8-.74 2.07.25 3.1 1.26 3.96 2.51-3.17 1.68-2.6 6.04.54 7.23-.29 1.51-1.32 2.18-2.22 3.23-.33.48-.66.96-1.16 1.48zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.54 4.33-3.74 4.25z" />
  </svg>
);

const AppVersionsList = () => {
  const [appVersions, setAppVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const itemsPerPage = 2;

  // State for the edit form
  const [editForm, setEditForm] = useState({
    android: {
      latestVersion: "",
      buildVersion: "",
      minimumVersion: "",
      forceUpdate: false,
      updateUrl: "",
      message: "",
    },
    ios: {
      latestVersion: "",
      buildVersion: "",
      minimumVersion: "",
      forceUpdate: false,
      updateUrl: "",
      message: "",
    },
  });

  useEffect(() => {
    fetchAppVersions();
  }, []);

  const fetchAppVersions = async () => {
    try {
      setLoading(true);
      const response = await getAllAppVersions();
      if (response.success) {
        setAppVersions(response.data);
      } else {
        throw new Error("Failed to fetch app versions");
      }
    } catch (err) {
      setError("Error fetching app versions");
      toast.error("Failed to fetch app versions");
    } finally {
      setLoading(false);
    }
  };

  // Filter app versions
  const filteredVersions = appVersions.filter((version) => {
    const androidVersion = version.android?.latestVersion || "";
    const iosVersion = version.ios?.latestVersion || "";
    const search = searchText.toLowerCase();

    return (
      androidVersion.toLowerCase().includes(search) ||
      iosVersion.toLowerCase().includes(search)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredVersions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVersions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handleEdit = (version) => {
    setEditingId(version._id);
    setEditForm({
      android: { ...version.android },
      ios: { ...version.ios },
    });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      const response = await upsertAppVersion({
        ...editForm,
        _id: editingId,
      });

      if (response.success) {
        await fetchAppVersions();
        setEditingId(null);
        toast.success("App version updated successfully!");
      } else {
        throw new Error("Failed to update app version");
      }
    } catch (err) {
      setError("Error updating app version");
      toast.error("Failed to update app version");
    }
  };

  const handleInputChange = (platform, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 min-h-[600px] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-blue-600" />
                App Version Control
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage update settings for Android and iOS applications
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2">
          <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
            {currentItems.length === 0 ? (
              <div className="text-center py-12">
                <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No app versions found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchText
                    ? "Try a different search term"
                    : "No configuration available"}
                </p>
              </div>
            ) : (
              currentItems.map((version) => (
                <div
                  key={version._id}
                  className="mb-6 last:mb-0 border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Top Bar: Timestamp & Edit Button */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Last Updated: {formatDate(version.updatedAt)}</span>
                    </div>

                    {editingId === version._id ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(version)}
                        className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md w-full sm:w-auto"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Configuration
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                    {/* === ANDROID SECTION === */}
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 bg-gradient-to-r from-green-50 to-green-100 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            Android
                          </h3>
                          <p className="text-sm text-gray-500">
                            Google Play Store
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Version Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                              LATEST VERSION
                            </label>
                            {editingId === version._id ? (
                              <input
                                type="text"
                                value={editForm.android.latestVersion}
                                onChange={(e) =>
                                  handleInputChange(
                                    "android",
                                    "latestVersion",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-800">
                                {version.android.latestVersion || "0.0.0"}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                              BUILD NUMBER
                            </label>
                            {editingId === version._id ? (
                              <input
                                type="text"
                                value={editForm.android.buildVersion}
                                onChange={(e) =>
                                  handleInputChange(
                                    "android",
                                    "buildVersion",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-800">
                                {version.android.buildVersion || "0"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                              MIN VERSION
                            </label>
                            {editingId === version._id ? (
                              <input
                                type="text"
                                value={editForm.android.minimumVersion}
                                onChange={(e) =>
                                  handleInputChange(
                                    "android",
                                    "minimumVersion",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-800">
                                {version.android.minimumVersion || "0.0.0"}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                              FORCE UPDATE
                            </label>
                            {editingId === version._id ? (
                              <div className="flex items-center gap-2">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editForm.android.forceUpdate}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "android",
                                        "forceUpdate",
                                        e.target.checked,
                                      )
                                    }
                                    className="sr-only peer"
                                  />
                                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 relative"></div>
                                </label>
                                <span className="text-sm text-gray-700">
                                  {editForm.android.forceUpdate
                                    ? "Mandatory"
                                    : "Optional"}
                                </span>
                              </div>
                            ) : (
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                  version.android.forceUpdate
                                    ? "bg-gradient-to-r from-red-50 to-red-100 text-red-600 border border-red-200"
                                    : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200"
                                }`}
                              >
                                {version.android.forceUpdate
                                  ? "Mandatory"
                                  : "Optional"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Store URL */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                            STORE URL
                          </label>
                          {editingId === version._id ? (
                            <input
                              type="text"
                              value={editForm.android.updateUrl}
                              onChange={(e) =>
                                handleInputChange(
                                  "android",
                                  "updateUrl",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                              placeholder="https://play.google.com/..."
                            />
                          ) : (
                            <a
                              href={version.android.updateUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 break-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {version.android.updateUrl || "No URL configured"}
                            </a>
                          )}
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                            UPDATE MESSAGE
                          </label>
                          {editingId === version._id ? (
                            <textarea
                              rows="2"
                              value={editForm.android.message}
                              onChange={(e) =>
                                handleInputChange(
                                  "android",
                                  "message",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm resize-none"
                              placeholder="Enter update message..."
                            />
                          ) : (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 flex gap-3 text-gray-700 text-sm">
                              <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <p>
                                {version.android.message ||
                                  "Please update the app to continue using it."}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* === iOS SECTION === */}
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full flex items-center justify-center">
                          <AppleIcon className="w-6 h-6 text-gray-800" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            iOS
                          </h3>
                          <p className="text-sm text-gray-500">
                            Apple App Store
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Version Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                              LATEST VERSION
                            </label>
                            {editingId === version._id ? (
                              <input
                                type="text"
                                value={editForm.ios.latestVersion}
                                onChange={(e) =>
                                  handleInputChange(
                                    "ios",
                                    "latestVersion",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-800">
                                {version.ios.latestVersion || "0.0.0"}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                              BUILD NUMBER
                            </label>
                            {editingId === version._id ? (
                              <input
                                type="text"
                                value={editForm.ios.buildVersion}
                                onChange={(e) =>
                                  handleInputChange(
                                    "ios",
                                    "buildVersion",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-800">
                                {version.ios.buildVersion || "0"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                              MIN VERSION
                            </label>
                            {editingId === version._id ? (
                              <input
                                type="text"
                                value={editForm.ios.minimumVersion}
                                onChange={(e) =>
                                  handleInputChange(
                                    "ios",
                                    "minimumVersion",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-800">
                                {version.ios.minimumVersion || "0.0.0"}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                              FORCE UPDATE
                            </label>
                            {editingId === version._id ? (
                              <div className="flex items-center gap-2">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editForm.ios.forceUpdate}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "ios",
                                        "forceUpdate",
                                        e.target.checked,
                                      )
                                    }
                                    className="sr-only peer"
                                  />
                                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 relative"></div>
                                </label>
                                <span className="text-sm text-gray-700">
                                  {editForm.ios.forceUpdate
                                    ? "Mandatory"
                                    : "Optional"}
                                </span>
                              </div>
                            ) : (
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                  version.ios.forceUpdate
                                    ? "bg-gradient-to-r from-red-50 to-red-100 text-red-600 border border-red-200"
                                    : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200"
                                }`}
                              >
                                {version.ios.forceUpdate
                                  ? "Mandatory"
                                  : "Optional"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Store URL */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                            STORE URL
                          </label>
                          {editingId === version._id ? (
                            <input
                              type="text"
                              value={editForm.ios.updateUrl}
                              onChange={(e) =>
                                handleInputChange(
                                  "ios",
                                  "updateUrl",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                              placeholder="https://apps.apple.com/..."
                            />
                          ) : (
                            <a
                              href={version.ios.updateUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 break-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {version.ios.updateUrl || "No URL configured"}
                            </a>
                          )}
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                            UPDATE MESSAGE
                          </label>
                          {editingId === version._id ? (
                            <textarea
                              rows="2"
                              value={editForm.ios.message}
                              onChange={(e) =>
                                handleInputChange(
                                  "ios",
                                  "message",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm resize-none"
                              placeholder="Enter update message..."
                            />
                          ) : (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 flex gap-3 text-gray-700 text-sm">
                              <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <p>
                                {version.ios.message ||
                                  "Please update the app to continue using it."}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 md:px-6 py-4 rounded-xl shadow-sm border border-gray-200 gap-4">
            <div className="text-sm text-gray-600 text-center md:text-left">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredVersions?.length)}{" "}
              of {filteredVersions?.length} configurations
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Page Numbers - Responsive */}
              <div className="flex items-center justify-center gap-1 order-2 sm:order-1">
                {/* Prev Button */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
      </div>
    </div>
  );
};

export default AppVersionsList;
