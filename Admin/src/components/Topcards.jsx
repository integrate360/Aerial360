import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Package,
  CreditCard,
  ArrowUpRight,
  UserPlus,
  RefreshCw,
  BarChart3,
  PieChart,
  Clock,
  Activity,
} from "lucide-react";
import { getAdminDashBoard } from "../Apis/ApiCalls";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";

const TopCards = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");
  const [activeChart, setActiveChart] = useState("revenue");
  const navigate = useNavigate();
  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashBoard(timeRange);
      if (response.success) {
        setDashboardData(response);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 100;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Stats cards data
  const statsCards = dashboardData
    ? [
        {
          title: "Total Revenue",
          value: formatCurrency(dashboardData.summary.totalRevenue),
          icon: DollarSign,
          color: "from-[#0D47A1] to-[#5472D3]",
          iconColor: "text-[#5472D3]",
          bgColor: "bg-blue-50",
          format: "currency",
        },
        {
          title: "Total Users",
          value: dashboardData.summary.totalUsers.toLocaleString(),
          icon: Users,
          color: "from-[#0D47A1] to-[#5472D3]",
          iconColor: "text-[#5472D3]",
          bgColor: "bg-blue-50",
          format: "number",
        },
        {
          title: "Total Bookings",
          value: dashboardData.summary.totalBookings.toLocaleString(),
          icon: Calendar,
          color: "from-[#0D47A1] to-[#5472D3]",
          iconColor: "text-[#5472D3]",
          bgColor: "bg-blue-50",
          format: "number",
        },
        // {
        //   title: "Today's Revenue",
        //   value: formatCurrency(dashboardData.summary.todayRevenue),
        //   icon: TrendingUp,
        //   color: "from-[#0D47A1] to-[#5472D3]",
        //   iconColor: "text-[#5472D3]",
        //   bgColor: "bg-blue-50",
        //   format: "currency",
        // },
      ]
    : [];

  // Revenue chart data
  const revenueChartData =
    dashboardData?.charts.dailyRevenue.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue: item.revenue,
      transactions: item.transactions,
    })) || [];

  // User growth chart data
  const userGrowthData =
    dashboardData?.charts.userGrowth.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      users: item.users,
    })) || [];

  // Package revenue data for pie chart
  const packageRevenueData =
    dashboardData?.charts.revenueByPackage.slice(0, 5).map((item) => ({
      name: item._id ? `Package ${item.packageName}` : "Other",
      value: item.revenue,
      color: item._id
        ? `#${Math.floor(Math.random() * 16777215).toString(16)}`
        : "#64748b",
    })) || [];

  // Top packages data
  const topPackages = dashboardData?.topLists.topPackages.slice(0, 5) || [];

  // Recent transactions
  const recentTransactions =
    dashboardData?.topLists.recentTransactions.slice(0, 5) || [];

  // Stats Card Component
  const StatCard = ({
    title,
    value,
    change,
    isUp,
    icon: Icon,
    color,
    iconColor,
    bgColor,
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-4 sm:p-6 transition-all duration-300 hover:shadow-md hover:border-[#5472D3]">
      <div className="flex items-start justify-between">
        <div className="w-full">
          <div
            className={`p-2 sm:p-3 ${bgColor} rounded-lg inline-block mb-3 sm:mb-4`}
          >
            <Icon size={20} className={`${iconColor} sm:w-6 sm:h-6`} />
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#666D80] mb-1 truncate">
            {title}
          </p>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1A1D25] mb-2 truncate">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="w-full">
            <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-48 sm:w-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-full sm:w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-28 sm:h-32 bg-gray-100 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="h-64 sm:h-80 bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="h-64 sm:h-80 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1D25] mb-2">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#666D80]">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        {/* <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-[#D8DDE6] rounded-lg bg-white text-[#1A1D25] focus:outline-none focus:ring-2 focus:ring-[#5472D3] focus:border-transparent w-full sm:w-auto text-sm sm:text-base"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">This year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="px-3 sm:px-4 py-2 bg-[#5472D3] text-white rounded-lg hover:bg-[#0D47A1] transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base"
          >
            <RefreshCw size={14} className="sm:w-4 sm:h-4" />
            Refresh
          </button>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="w-full">
              <h3 className="text-base sm:text-lg font-semibold text-[#1A1D25] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#5472D3] sm:w-5 sm:h-5" />

                {activeChart === "users" ? "Users Trend" : "Revenue Trend"}
              </h3>

              <p className="text-xs sm:text-sm text-[#666D80]">
                {activeChart === "users"
                  ? "Daily users over time"
                  : "Daily revenue over time"}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveChart("revenue")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium w-1/2 sm:w-auto ${activeChart === "revenue" ? "bg-[#5472D3] text-white" : "bg-gray-100 text-[#666D80] hover:bg-gray-200"}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveChart("users")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium w-1/2 sm:w-auto ${activeChart === "users" ? "bg-[#5472D3] text-white" : "bg-gray-100 text-[#666D80] hover:bg-gray-200"}`}
              >
                Users
              </button>
            </div>
          </div>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  activeChart === "revenue" ? revenueChartData : userGrowthData
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#666D80"
                  fontSize={10}
                  className="sm:text-xs"
                />
                <YAxis
                  stroke="#666D80"
                  fontSize={10}
                  className="sm:text-xs"
                  tickFormatter={(value) =>
                    activeChart === "revenue" ? `₹${value / 1000}k` : value
                  }
                />
                <Tooltip
                  formatter={(value) =>
                    activeChart === "revenue"
                      ? [`₹${value.toLocaleString()}`, "Revenue"]
                      : [value, "Users"]
                  }
                  labelStyle={{ color: "#666D80", fontSize: "12px" }}
                  contentStyle={{ fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area
                  type="monotone"
                  dataKey={activeChart === "revenue" ? "revenue" : "users"}
                  stroke="#5472D3"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5472D3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#5472D3" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package Revenue Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#1A1D25] flex items-center gap-2">
                <PieChart size={18} className="text-[#5472D3] sm:w-5 sm:h-5" />
                Revenue by Package
              </h3>
              <p className="text-xs sm:text-sm text-[#666D80]">
                Top 5 revenue generating packages
              </p>
            </div>
          </div>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={packageRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) =>
                    `${entry.name}: ₹${(entry.value / 1000).toFixed(0)}k`
                  }
                  outerRadius={60}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="value"
                  labelStyle={{ fontSize: "10px" }}
                >
                  {packageRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                  contentStyle={{ fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Packages */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#1A1D25] flex items-center gap-2">
                <Package size={18} className="text-[#5472D3] sm:w-5 sm:h-5" />
                Top Performing Packages
              </h3>
              <p className="text-xs sm:text-sm text-[#666D80]">
                Highest revenue packages
              </p>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {topPackages.map((pkg, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Package
                      size={16}
                      className="text-[#5472D3] sm:w-5 sm:h-5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base text-[#1A1D25] truncate">
                      {pkg.packageName ||
                        `Package ${pkg._id?.slice(-4) || "N/A"}`}
                    </p>
                    <p className="text-xs sm:text-sm text-[#666D80] truncate">
                      {pkg.bookings} bookings
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-sm sm:text-base text-[#1A1D25] truncate">
                    {formatCurrency(pkg.revenue)}
                  </p>
                  <p className="text-xs sm:text-sm text-[#666D80] truncate">
                    Avg: {formatCurrency(pkg.avgValue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#1A1D25] flex items-center gap-2">
                <Clock size={18} className="text-[#5472D3] sm:w-5 sm:h-5" />
                Recent Transactions
              </h3>
              <p className="text-xs sm:text-sm text-[#666D80]">
                Latest payment activities
              </p>
            </div>
            <button
              onClick={() => navigate("/payments")}
              className="text-xs sm:text-sm text-[#5472D3] hover:text-[#0D47A1] font-medium flex items-center gap-1"
            >
              View All
              <ArrowUpRight size={12} className="sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentTransactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-[#5472D3] sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base text-[#1A1D25] truncate">
                      {transaction.userName}
                    </p>
                    <p className="text-xs sm:text-sm text-[#666D80] truncate">
                      {transaction.userEmail}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-sm sm:text-base text-[#1A1D25] truncate">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs sm:text-sm text-[#666D80] truncate">
                    {new Date(transaction.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopCards;
