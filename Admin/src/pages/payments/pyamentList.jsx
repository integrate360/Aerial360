import { useEffect, useState, useMemo, useCallback } from "react";
import { getPayments } from "../../Apis/ApiCalls";
import moment from "moment";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Calendar,
  User,
  Package,
  Layers,
  Clock,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

const PaymentList = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPayments: 0,
    totalPages: 0,
  });
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Fetch payments with pagination and filters
  const fetchPayments = useCallback(
    async (
      page = 1,
      filterType = filter,
      search = searchText,
      showLoader = true,
    ) => {
      try {
        if (showLoader) {
          setLoading(true);
        }
        // Build query parameters for backend
        const queryParams = {
          page,
          limit: 10, // Match backend limit
        };

        // Add filter if not "all"
        if (filterType !== "all") {
          queryParams.filter = filterType;
        }

        // Add search if provided
        if (search.trim()) {
          queryParams.search = search;
        }

        const response = await getPayments(queryParams);

        const payments = response?.data?.payments;
        const paginationData = response?.data?.pagination;
        const revenueData = response?.data?.revenue;

        if (Array.isArray(payments)) {
          const formattedPayments = payments.map((payment) => ({
            ...payment,
            amount: payment.amount || 0,
            user: payment.user || { name: "Unknown", email: "N/A" },
            package: payment.package || { name: "Package", duration: null },
            class: payment.class || { name: "Class", duration: null },
          }));

          setRows(formattedPayments);

          // Set pagination data from backend
          if (paginationData) {
            setPagination({
              page: paginationData.page || page,
              limit: paginationData.limit || 10,
              totalPayments: paginationData.totalPayments || 0,
              totalPages: paginationData.totalPages || 1,
            });
          }

          // ✅ FIX: Use filtered revenue when filter is not "all"
          if (revenueData) {
            // If we have a filter applied (not "all"), show filtered revenue
            // If no filter, show all-time revenue
            if (filterType !== "all" && revenueData.filtered !== undefined) {
              setTotal(revenueData.filtered);
            } else {
              setTotal(revenueData.allTime || 0);
            }
          } else {
            // Fallback to calculate from current page if revenue not provided
            const totalAmount = formattedPayments.reduce(
              (acc, payment) => acc + (payment.amount || 0),
              0,
            );
            setTotal(totalAmount);
          }
        } else {
          setRows([]);
          setPagination((prev) => ({
            ...prev,
            totalPayments: 0,
            totalPages: 0,
          }));
          setTotal(0);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        setRows([]);
        setPagination((prev) => ({ ...prev, totalPayments: 0, totalPages: 0 }));
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [filter, searchText], // Remove dependencies that cause unnecessary re-renders
  );

  // Initial fetch and refetch when filter changes
  useEffect(() => {
    fetchPayments(1, filter, searchText, false);
  }, [filter]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchPayments(1, filter, searchText, false);
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchText]);

  const clearFilters = () => {
    setFilter("all");
    setSearchText("");
    setCurrentPage(1);
    fetchPayments(1, "all", "", false);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      fetchPayments(newPage, filter, searchText, false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const TableHeader = ({ icon, label }) => (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </th>
  );

  // Function to get filter label with dates for better clarity
  const getFilterLabel = () => {
    switch (filter) {
      case "weekly":
        return `This Week (${moment().startOf("week").format("MMM DD")} - ${moment().endOf("week").format("MMM DD, YYYY")})`;
      case "lastWeek":
        const lastWeekStart = moment().subtract(1, "week").startOf("week");
        const lastWeekEnd = moment().subtract(1, "week").endOf("week");
        return `Last Week (${lastWeekStart.format("MMM DD")} - ${lastWeekEnd.format("MMM DD, YYYY")})`;
      case "monthly":
        return `This Month (${moment().format("MMMM YYYY")})`;
      case "lastMonth":
        const lastMonth = moment().subtract(1, "month");
        return `Last Month (${lastMonth.format("MMMM YYYY")})`;
      case "yearly":
        return `This Year (${moment().format("YYYY")})`;
      case "lastYear":
        const lastYear = moment().subtract(1, "year");
        return `Last Year (${lastYear.format("YYYY")})`;
      default:
        return "All Time";
    }
  };

  // Skeleton Loading Component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                Payment History
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">Total Revenue:</span>
                <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {total.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {getFilterLabel()}
                </span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by customer or service..."
                  value={searchText}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full sm:w-64"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full sm:w-48 appearance-none cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="weekly">This Week</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="monthly">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="yearly">This Year</option>
                  <option value="lastYear">Last Year</option>
                </select>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="p-2">
          <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto scrollbar-hide rounded-xl shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <tr>
                    <TableHeader
                      icon={<User className="w-4 h-4 text-blue-600" />}
                      label="Customer"
                    />
                    <TableHeader
                      icon={<Package className="w-4 h-4 text-blue-600" />}
                      label="Service Type"
                    />
                    <TableHeader
                      icon={<IndianRupee className="w-4 h-4 text-blue-600" />}
                      label="Amount"
                    />
                    <TableHeader
                      icon={<Calendar className="w-4 h-4 text-blue-600" />}
                      label="Date & Time"
                    />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    // Show skeleton loading
                    Array.from({ length: 10 }).map((_, index) => (
                      <SkeletonRow key={index} />
                    ))
                  ) : rows.length > 0 ? (
                    rows.map((payment) => (
                      <tr
                        key={payment?._id || Math.random()}
                        className="hover:bg-blue-50/50 transition-colors duration-200"
                      >
                        {/* Customer */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full flex items-center justify-center border border-blue-100">
                                <div className="text-blue-700 font-bold">
                                  {payment.user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                                </div>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-800 block">
                                  {payment.user?.name || "Unknown User"}
                                </span>
                                <span className="text-xs text-gray-500 truncate max-w-[180px] block">
                                  {payment.user?.email || "No email"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Service Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-2 rounded-lg ${payment.isPackage ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-orange-50 text-orange-600 border border-orange-100"}`}
                              >
                                {payment.isPackage ? (
                                  <Package className="w-4 h-4" />
                                ) : (
                                  <Layers className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-800">
                                  {payment.isPackage
                                    ? payment.package?.name || "Package"
                                    : payment.class?.name || "Class"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200">
                              <IndianRupee className="w-3 h-3 mr-1" />
                              {payment.amount?.toLocaleString() || "0"}
                            </span>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-center h-full">
                            <span className="text-sm font-medium text-gray-800">
                              {payment.createdAt
                                ? moment(payment.createdAt).format("DD-MM-YYYY")
                                : "N/A"}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {payment.createdAt
                                ? moment(payment.createdAt).format("hh:mm A")
                                : ""}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <AlertCircle className="w-12 h-12 text-gray-400" />
                          <p className="text-gray-500">No payments found</p>
                          <p className="text-sm text-gray-400">
                            {searchText || filter !== "all"
                              ? "Try a different search term or filter"
                              : "No payment records available"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center bg-white px-4 md:px-6 py-4 rounded-xl shadow-sm border border-gray-200 gap-4">
            <div className="text-sm text-gray-600 text-center md:text-left">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalPayments,
              )}{" "}
              of {pagination.totalPayments} payments
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Page Numbers - Responsive */}
              <div className="flex items-center justify-center gap-1 order-2 sm:order-1">
                {/* Prev Button */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                  className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="First page"
                >
                  «
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* MOBILE (3 pages) */}
                <div className="flex sm:hidden items-center gap-1 overflow-x-auto max-w-[200px] px-2">
                  {Array.from(
                    { length: Math.min(3, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;

                      if (pagination.totalPages <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 2) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 1) {
                        pageNum = pagination.totalPages - 2 + i;
                      } else {
                        pageNum = pagination.page - 1 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[32px] px-2 py-1.5 rounded-lg transition-colors text-sm ${
                            pagination.page === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>

                {/* DESKTOP (5 pages) */}
                <div className="hidden sm:flex items-center gap-1 px-0">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[32px] px-2 py-1.5 rounded-lg transition-colors text-sm ${
                            pagination.page === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Last page"
                >
                  »
                </button>
              </div>

              {/* Page Info - For mobile only */}
              <div className="text-sm text-gray-600 text-center order-1 sm:order-2 sm:hidden">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default PaymentList;
