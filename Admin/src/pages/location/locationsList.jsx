import { useState, useEffect } from "react";
import { createLocation, getAllLocations } from "../../Apis/ApiCalls";
import LocationTable from "./LocationTable";

const LocationsList = () => {
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    googleMapLink: "",
  });

  const fetchData = async () => {
    try {
      const res = await getAllLocations();
      console.log("Location data fetched");

      if (res) {
        setLocations(res.data?.reverse() || []);
        console.log(res.data || []);
      } else {
        setError(true);
        setMessage("Failed to fetch locations.");
        setTimeout(() => setError(false), 2000);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError(true);
      setMessage("An error occurred while fetching locations.");
      setTimeout(() => setError(false), 2000);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => {
    setOpenModal(false);
    setFormData({ name: "", address: "", googleMapLink: "" });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const { name, address, googleMapLink } = formData;

    if (!name || !address || !googleMapLink) {
      setError(true);
      setMessage("All fields are required.");
      setTimeout(() => setError(false), 2000);
      return;
    }

    try {
      const payload = { name, address, googleMapLink };
      const create = await createLocation(payload);

      if (create?.status !== 201) {
        setError(true);
        setMessage("Error creating location.");
        setTimeout(() => setError(false), 2000);
        return;
      }

      fetchData();
      setFormData({ name: "", address: "", googleMapLink: "" });
      handleModalClose();
    } catch (error) {
      console.error("Error creating location:", error);
      setError(true);
      setMessage("An error occurred while creating the location.");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <>
      {/* Error Toast Notification */}
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="px-4 py-6 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Locations
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage all your studio locations
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleModalOpen}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">Add New Location</span>
                <span className="sm:hidden">Add Location</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Table Container */}
        <div className="p-4 sm:p-6">
          <LocationTable locations={locations} searchText="" />
        </div>
      </div>

      {/* Add Location Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 transition-opacity"
              onClick={handleModalClose}
              aria-hidden="true"
            ></div>

            {/* Modal panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg transform transition-all">
              {/* Modal header */}
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Add New Location
                  </h3>
                  <button
                    onClick={handleModalClose}
                    className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Fill in the details to add a new location
                </p>
              </div>

              {/* Modal body */}
              <div className="px-6 py-6 sm:px-8 sm:py-7">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Location Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., Main Studio, Downtown Branch"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Full Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Enter complete address with city, state, zip code"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="googleMapLink"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Google Maps Link *
                    </label>
                    <input
                      type="url"
                      id="googleMapLink"
                      name="googleMapLink"
                      value={formData.googleMapLink}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="https://maps.google.com/?q=..."
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Paste the complete Google Maps URL
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Create Location
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocationsList;
