import React, { useState } from "react";
import { deletePackage } from "../../Apis/ApiCalls";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import ConfirmationModal from "../../layouts/ConfirmationModal";

const PackageTable = ({
  packages,
  editModal,
  viewModal,
  selectedPackage,
  setPackages,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination Logic
  const totalPages = Math.ceil(packages?.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPackages = packages?.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteClick = (id) => {
    setPackageToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!packageToDelete) return;
    try {
      await deletePackage(packageToDelete);
      setPackages((prev) => prev.filter((pkg) => pkg._id !== packageToDelete));
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  // Helper to generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Sliding window logic for many pages
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Package
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Services
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Validity
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Slots
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentPackages?.length > 0 ? (
              currentPackages.map((row) => (
                <tr
                  key={row._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{row.name}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {row.services?.slice(0, 2).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {s.name}
                        </span>
                      ))}
                      {row.services?.length > 2 && (
                        <span className="text-xs text-gray-500 self-center">
                          +{row.services.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {row?.category?.title || "-"}
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="font-bold text-gray-900">
                        ₹{row.offerPrice || row.price}
                      </span>
                      {row.offerPrice > 0 && row.offerPrice < row.price && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                          ₹{row.price}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {row.duration} Days
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {row.days} / week
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          selectedPackage(row);
                          viewModal();
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          selectedPackage(row);
                          editModal();
                        }}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(row._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No packages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FIXED PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50 gap-4">
          {/* Text Info */}
          <span className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, packages.length)} of {packages.length}{" "}
            entries
          </span>

          {/* Numbered Buttons */}
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              className="p-2 rounded-lg bg-white border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`min-w-[32px] h-8 px-3 rounded-lg text-sm font-medium transition-all border ${
                  currentPage === number
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                {number}
              </button>
            ))}

            {/* Next Button */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              className="p-2 rounded-lg bg-white border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Package"
        message="Are you sure you want to delete this package?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PackageTable;
