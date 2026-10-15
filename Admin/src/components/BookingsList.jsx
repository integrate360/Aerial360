import { useEffect, useState } from "react";
import { Calendar, Plus, Loader2 } from "lucide-react";
import {
  getAllLocations,
  getAllUsers,
  getClasses,
  getStaff,
} from "../Apis/ApiCalls";
import BookingsTable from "./BookingsTable";
import AddBooking from "./AddBooking";

const BookingsList = ({
  fetchClasses,
  classess,
  chooseCalender,
  search,
  setSearch,
  page,
  setPage,
  limit,
  setLimit,
  pagination,
  fetchBookingsData,
}) => {
  const [viewModal, setViewModal] = useState(false);
  const [fetchedClassed, setFechedClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [location, setLocation] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsersAndClasses = async (showLoading = true) => {
    try {
      setError(null);

      const [usersResponse, staffResponse, classesResponse, locationResponse] =
        await Promise.all([
          getAllUsers(),
          getStaff(),
          getClasses(),
          getAllLocations(),
        ]);

      // Check all responses
      const errors = [];
      if (usersResponse?.status !== 200) errors.push("Failed to fetch users");
      if (staffResponse?.status !== 200) errors.push("Failed to fetch staff");
      if (classesResponse?.status !== 200)
        errors.push("Failed to fetch classes");
      if (locationResponse?.status !== 200)
        errors.push("Failed to fetch locations");

      if (errors.length > 0) {
        setError(errors.join(", "));
        return;
      }

      setUsers(usersResponse?.data || []);
      setFechedClasses(classesResponse?.data || []);
      setLocation(locationResponse?.data || []);
      setStaff(staffResponse?.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load booking data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchClasses();
      await fetchUsersAndClasses();
    } catch (error) {
      console.log("Error refreshing:", error);
      setError("Failed to refresh bookings");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsersAndClasses(false);
  }, []); // Only run once on mount

  // if (loading) {
  //   return (
  //     <div className="bg-white rounded-lg shadow-lg min-h-[700px] flex items-center justify-center">
  //       <div className="text-center">
  //         <Loader2 className="w-12 h-12 text-[#5472D3] animate-spin mx-auto mb-4" />
  //         <p className="text-[#666D80]">Loading bookings...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#D8DDE6]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#D8DDE6]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1D25] mb-2">
                Bookings Management
              </h1>
              <p className="text-sm sm:text-base text-[#5472D3] font-medium">
                Manage and view all your bookings in one place
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={chooseCalender}
                className="group p-2 sm:p-2.5 bg-white hover:bg-[#F5F7FA] border border-[#D8DDE6] rounded-lg transition-all duration-200 shadow-sm hover:border-[#5472D3] flex-shrink-0"
                title="Switch to Calendar View"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#666D80] group-hover:text-[#1A1D25]" />
              </button>

              <button
                onClick={() => setViewModal(true)}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-1 sm:gap-2 transition-all duration-200 shadow-md hover:shadow-lg justify-center text-sm sm:text-base min-w-[80px] sm:min-w-[120px]"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Booking</span>
                <span className="sm:hidden">Add</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-[#F5F7FA] border border-[#D8DDE6] text-[#1A1D25] rounded-lg font-medium flex items-center gap-1 sm:gap-2 transition-all duration-200 shadow-sm hover:border-[#5472D3] disabled:opacity-50 disabled:cursor-not-allowed justify-center text-sm sm:text-base min-w-[80px] sm:min-w-[100px]"
                title="Refresh Data"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#5472D3]" />
                ) : (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#5472D3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
                <span className="sm:hidden">
                  {refreshing ? "..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="p-2">
          <div className="min-h-[600px] rounded-lg overflow-hidden bg-white">
            <BookingsTable
              bookings={classess}
              fetchData={handleRefresh}
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              pagination={pagination}
              fetchBookingsData={fetchBookingsData}
              locations={location}
              classesList={fetchedClassed}
            />
          </div>
        </div>
      </div>

      {/* Add Booking Modal */}
      {viewModal && (
        <AddBooking
          classes={fetchedClassed}
          fetchData={handleRefresh}
          handleModalClose={() => setViewModal(false)}
          users={users}
          locations={location}
          trainers={staff}
        />
      )}
    </>
  );
};

export default BookingsList;
