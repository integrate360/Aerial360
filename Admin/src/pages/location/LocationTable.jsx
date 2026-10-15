import { useEffect, useState } from "react";
import { deleteLocation, EditLocation } from "../../Apis/ApiCalls";
import ConfirmationModal from "../../layouts/ConfirmationModal";
import { Edit, Trash2, MapPin, Home, Link } from "lucide-react";
import { toast } from "react-toastify";

const LocationTable = ({ locations, searchText }) => {
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLocationName, setDeleteLocationName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [edtFormData, setEdtFormData] = useState({
    name: "",
    address: "",
    googleMapLink: "",
  });

  useEffect(() => {
    if (locations?.length === 0) {
      setRows([]);
    } else {
      setRows(locations || []);
    }
  }, [locations]);

  const handleDeleteClick = (id, name) => {
    setSelectedId(id);
    setDeleteLocationName(name);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const del = await deleteLocation(selectedId);

      if (del?.status !== 200) {
        throw new Error("Failed to delete location");
      }

      setRows((prevRows) => prevRows.filter((row) => row._id !== selectedId));
      toast.success("Location deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete location");
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
    }
  };

  const handleEditClick = (id) => {
    const locationToEdit = rows.find((row) => row._id === id);
    if (locationToEdit) {
      setEdtFormData({
        name: locationToEdit.name,
        address: locationToEdit.address,
        googleMapLink: locationToEdit.googleMapLink,
      });
      setEditModal(true);
      setSelectedId(id);
    }
  };

  const handleEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", edtFormData.name);
      formData.append("address", edtFormData.address);
      formData.append("googleMapLink", edtFormData.googleMapLink);
      const response = await EditLocation(formData, selectedId);

      if (response?.status !== 200) {
        toast.error("Error editing location");
        return;
      }

      const updatedRows = rows.map((row) =>
        row._id === selectedId ? { ...row, ...edtFormData } : row,
      );
      setRows(updatedRows);
      setEditModal(false);
      toast.success("Location updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error editing location");
    }
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEdtFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const filteredRows = rows?.filter(
    (location) =>
      location.name?.toLowerCase().includes(searchText?.toLowerCase() || "") ||
      location.address?.toLowerCase().includes(searchText?.toLowerCase() || ""),
  );

  // Table Header Component matching UserList
  const TableHeader = ({ icon, label }) => (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </th>
  );

  if (filteredRows?.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
          <MapPin className="w-full h-full" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No locations found
        </h3>
        <p className="text-gray-500">
          {searchText
            ? "Try a different search term"
            : "Start by adding a new location"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide rounded-xl shadow-sm border border-gray-200 bg-white">
        {/* Desktop/Tablet View */}
        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <TableHeader
                icon={<Home className="w-4 h-4 text-blue-600" />}
                label="Location"
              />
              <TableHeader
                icon={<MapPin className="w-4 h-4 text-blue-600" />}
                label="Address"
              />
              <TableHeader
                icon={<Link className="w-4 h-4 text-blue-600" />}
                label="Map Link"
              />
              <TableHeader
                icon={<Edit className="w-4 h-4 text-blue-600" />}
                label="Actions"
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRows.map((row) => (
              <tr
                key={row._id}
                className="hover:bg-blue-50/50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {row.name || "Unnamed Location"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-800 max-w-xs">
                    {row.address || "No address provided"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {row.googleMapLink ? (
                    <a
                      href={row.googleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <Link className="w-4 h-4 mr-1.5" />
                      View on Maps
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">No link</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(row._id)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                      title="Edit Location"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(row._id, row.name)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                      title="Delete Location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredRows.map((row) => (
            <div
              key={row._id}
              className="border-b border-gray-200 p-4 hover:bg-blue-50/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {row.name || "Unnamed Location"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditClick(row._id)}
                    className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-600 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(row._id, row.name)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Address
                </div>
                <div className="text-sm text-gray-800">
                  {row.address || "No address provided"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Link className="w-3 h-3" />
                  Map Link
                </div>
                {row.googleMapLink ? (
                  <a
                    href={row.googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Link className="w-3 h-3 mr-1.5" />
                    Open in Maps
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm">
                    No link available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Location"
        message={`Are you sure you want to delete "${deleteLocationName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 transition-opacity"
              onClick={() => setEditModal(false)}
              aria-hidden="true"
            ></div>

            {/* Modal panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg transform transition-all">
              {/* Modal header */}
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Edit Location
                  </h3>
                  <button
                    onClick={() => setEditModal(false)}
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
              </div>

              {/* Modal body */}
              <div className="px-6 py-6 sm:px-8 sm:py-7">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="edit-name"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Location Name *
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={edtFormData.name}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., Main Studio, Downtown Branch"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-address"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Full Address *
                    </label>
                    <textarea
                      id="edit-address"
                      name="address"
                      value={edtFormData.address}
                      onChange={handleEditFormChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Enter complete address with city, state, zip code"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-googleMapLink"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Google Maps Link *
                    </label>
                    <input
                      type="url"
                      id="edit-googleMapLink"
                      name="googleMapLink"
                      value={edtFormData.googleMapLink}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="https://maps.google.com/?q=..."
                    />
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModal(false)}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEdit}
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
                      Save Changes
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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

export default LocationTable;
