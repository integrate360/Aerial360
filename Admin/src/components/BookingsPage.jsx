import { useEffect, useState } from "react";
import { getBookings } from "../Apis/ApiCalls";
import BookingCalender from "./BookingCalender";
import BookingsList from "./BookingsList";
import {
  Calendar,
  List,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";

const BookingsPage = () => {
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isCalender, setIsCalender] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firstLoading, setFirstLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookingsData = async (overrideParams = {}) => {
    try {
      setError(null);
      const queryParams = {
        page: overrideParams.page !== undefined ? overrideParams.page : page,
        limit: isCalender ? 0 : (overrideParams.limit !== undefined ? overrideParams.limit : limit),
        search: overrideParams.search !== undefined ? overrideParams.search : search,
        ...overrideParams,
      };

      const classRes = await getBookings(queryParams);

      if (classRes?.status !== 200) {
        setError(classRes?.message || "Failed to fetch bookings");
        setClasses([]);
        return;
      }

      setClasses(classRes?.data || []);
      if (classRes?.pagination) {
        setPagination(classRes.pagination);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("An error occurred while fetching bookings");
      setClasses([]);
    } finally {
      setLoading(false);
      setFirstLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookingsData();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, limit, search, isCalender]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchBookingsData();
  };

  if (firstLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg min-h-[700px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#5472D3] animate-spin mx-auto mb-4" />
          <p className="text-[#666D80]">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div>
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#D8DDE6] overflow-hidden">
          {isCalender ? (
            <BookingCalender
              data={classes}
              chooseList={() => setIsCalender(false)}
            />
          ) : (
            <BookingsList
              fetchClasses={handleRefresh}
              classess={classes}
              chooseCalender={() => setIsCalender(true)}
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              pagination={pagination}
              fetchBookingsData={fetchBookingsData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
