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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");
  const [activeChart, setActiveChart] = useState("revenue");

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
          change: calculateGrowth(
            dashboardData.summary.totalRevenue,
            dashboardData.charts.growthTrends.revenue[1]?.revenue || 0,
          ),
          isUp: true,
          icon: DollarSign,
          color: "from-[#0D47A1] to-[#5472D3]",
          iconColor: "text-[#5472D3]",
          bgColor: "bg-blue-50",
          format: "currency",
        },
        {
          title: "Total Users",
          value: dashboardData.summary.totalUsers.toLocaleString(),
          change: calculateGrowth(
            dashboardData.summary.totalUsers,
            dashboardData.charts.growthTrends.users[1]?.count || 0,
          ),
          isUp: true,
          icon: Users,
          color: "from-[#0D47A1] to-[#5472D3]",
          iconColor: "text-[#5472D3]",
          bgColor: "bg-blue-50",
          format: "number",
        },
        {
          title: "Total Bookings",
          value: dashboardData.summary.totalBookings.toLocaleString(),
          change: calculateGrowth(
            dashboardData.summary.totalBookings,
            dashboardData.charts.growthTrends.bookings[1]?.count || 0,
          ),
          isUp: true,
          icon: Calendar,
          color: "from-[#0D47A1] to-[#5472D3]",
          iconColor: "text-[#5472D3]",
          bgColor: "bg-blue-50",
          format: "number",
        },
        {
          title: "Today's Revenue",
          value: formatCurrency(dashboardData.summary.todayRevenue),
          change: calculateGrowth(
            dashboardData.summary.todayRevenue,
            dashboardData.summary.totalRevenue / 30,
          ),
          isUp: dashboardData.summary.todayRevenue > 0,
          icon: TrendingUp,
          color: "from-[#0D47A1] to-[#5472D3]",
          iconColor: "text-[#5472D3]",
          bgColor: "bg-blue-50",
          format: "currency",
        },
        {
          title: "Active Users",
          value: dashboardData.summary.activeUsers.toLocaleString(),
          change: "14.3%",
          isUp: true,
          icon: UserPlus,
          color: "from-[#0D47A1] to-[#5472D3]",
          iconColor: "text-[#5472D3]",
          bgColor: "bg-blue-50",
          format: "number",
        },
        {
          title: "Avg Revenue/User",
          value: formatCurrency(dashboardData.summary.avgRevenuePerUser),
          change: calculateGrowth(
            dashboardData.summary.avgRevenuePerUser,
            8000,
          ),
          isUp: true,
          icon: CreditCard,
          color: "from-[#0D47A1] to-[#5472D3]",
          iconColor: "text-[#5472D3]",
          bgColor: "bg-blue-50",
          format: "currency",
        },
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
      name: item._id ? `Package ${item._id.slice(-4)}` : "Other",
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
    <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-6 transition-all duration-300 hover:shadow-md hover:border-[#5472D3]">
      <div className="flex items-start justify-between">
        <div>
          <div className={`p-3 ${bgColor} rounded-lg inline-block mb-4`}>
            <Icon size={24} className={iconColor} />
          </div>
          <p className="text-sm font-medium text-[#666D80] mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-[#1A1D25] mb-2">{value}</h3>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full ${isUp ? "bg-green-50" : "bg-red-50"}`}
            >
              <TrendingUp
                size={14}
                className={isUp ? "text-green-600" : "text-red-600"}
              />
              <span
                className={`text-xs font-medium ${isUp ? "text-green-700" : "text-red-700"}`}
              >
                {change}% {isUp ? "↑" : "↓"}
              </span>
            </div>
            <span className="text-xs text-[#666D80]">from last period</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D25] mb-2">
            Dashboard Overview
          </h1>
          <p className="text-[#666D80]">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-[#D8DDE6] rounded-lg bg-white text-[#1A1D25] focus:outline-none focus:ring-2 focus:ring-[#5472D3] focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">This year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-[#5472D3] text-white rounded-lg hover:bg-[#0D47A1] transition-colors duration-200 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1D25] flex items-center gap-2">
                <BarChart3 size={20} className="text-[#5472D3]" />
                Revenue Trend
              </h3>
              <p className="text-sm text-[#666D80]">Daily revenue over time</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveChart("revenue")}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${activeChart === "revenue" ? "bg-[#5472D3] text-white" : "bg-gray-100 text-[#666D80] hover:bg-gray-200"}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveChart("users")}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${activeChart === "users" ? "bg-[#5472D3] text-white" : "bg-gray-100 text-[#666D80] hover:bg-gray-200"}`}
              >
                Users
              </button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <AreaChart
                data={
                  activeChart === "revenue" ? revenueChartData : userGrowthData
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666D80" fontSize={12} />
                <YAxis
                  stroke="#666D80"
                  fontSize={12}
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
                  labelStyle={{ color: "#666D80" }}
                />
                <Legend />
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
        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1D25] flex items-center gap-2">
                <PieChart size={20} className="text-[#5472D3]" />
                Revenue by Package
              </h3>
              <p className="text-sm text-[#666D80]">
                Top 5 revenue generating packages
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <RechartsPieChart>
                <Pie
                  data={packageRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) =>
                    `${entry.name}: ₹${(entry.value / 1000).toFixed(0)}k`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
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
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Packages */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1D25] flex items-center gap-2">
                <Package size={20} className="text-[#5472D3]" />
                Top Performing Packages
              </h3>
              <p className="text-sm text-[#666D80]">Highest revenue packages</p>
            </div>
          </div>
          <div className="space-y-4">
            {topPackages.map((pkg, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Package size={20} className="text-[#5472D3]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1D25] truncate max-w-xs">
                      {pkg.packageName ||
                        `Package ${pkg._id?.slice(-4) || "N/A"}`}
                    </p>
                    <p className="text-sm text-[#666D80]">
                      {pkg.bookings} bookings
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1A1D25]">
                    {formatCurrency(pkg.revenue)}
                  </p>
                  <p className="text-sm text-[#666D80]">
                    Avg: {formatCurrency(pkg.avgValue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1D25] flex items-center gap-2">
                <Clock size={20} className="text-[#5472D3]" />
                Recent Transactions
              </h3>
              <p className="text-sm text-[#666D80]">
                Latest payment activities
              </p>
            </div>
            <button className="text-sm text-[#5472D3] hover:text-[#0D47A1] font-medium flex items-center gap-1">
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users size={20} className="text-[#5472D3]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1D25]">
                      {transaction.userName}
                    </p>
                    <p className="text-sm text-[#666D80] truncate max-w-xs">
                      {transaction.userEmail}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1A1D25]">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-[#666D80]">
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

      {/* Performance Metrics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity size={20} className="text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1A1D25]">Conversion Rate</h4>
              <p className="text-2xl font-bold text-[#1A1D25]">
                {dashboardData?.summary.conversionRate}
              </p>
            </div>
          </div>
          <p className="text-sm text-[#666D80]">
            Bookings to revenue conversion
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCard size={20} className="text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1A1D25]">Avg Transaction</h4>
              <p className="text-2xl font-bold text-[#1A1D25]">
                {formatCurrency(
                  dashboardData?.summary.avgTransactionValue || 0,
                )}
              </p>
            </div>
          </div>
          <p className="text-sm text-[#666D80]">Average transaction value</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#D8DDE6] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Users size={20} className="text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1A1D25]">New Users Today</h4>
              <p className="text-2xl font-bold text-[#1A1D25]">
                {dashboardData?.summary.newUsersToday || 0}
              </p>
            </div>
          </div>
          <p className="text-sm text-[#666D80]">User registrations today</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
