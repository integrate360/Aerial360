import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";
import Booking from "../models/bookingModel.js";
import genrateToken from "../utils/generateToken.js";
// admin login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    // Verify if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error("No admin found with this Email");

    // Compare passwords
    const verifyPassword = await bcrypt.compare(password, admin.password);
    if (!verifyPassword) throw new Error("Wrong Credentials");

    // Generate and send token
    const token = genrateToken(admin._id);
    res.json({
      token,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  // If admins exist, only an existing authenticated admin can create another admin
  const totalAdmins = await Admin.countDocuments();
  if (totalAdmins > 0) {
    if (!req.user || !(await Admin.findById(req.user._id))) {
      res.status(403);
      throw new Error("Unauthorized. Only existing admins can register new admins.");
    }
  }

  // check if admin already exists
  const admin = await Admin.findOne({ email });
  if (admin) {
    res.status(400);
    throw new Error("Admin already exists with this email");
  }

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  // create new admin
  const newAdmin = new Admin({
    name,
    email,
    phone,
    password: hashedPassword,
  });
  await newAdmin.save();
  
  const adminResponse = newAdmin.toObject();
  delete adminResponse.password;

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    admin: adminResponse,
  });
});

const adminDashboard = asyncHandler(async (req, res) => {
  try {
    const getDateRanges = () => {
      const now = new Date();
      
      // Today's date range - extend to cover all timezones
      const startToday = new Date(now);
      startToday.setHours(0, 0, 0, 0);
      
      const endToday = new Date(now);
      endToday.setHours(23, 59, 59, 999);
      
      // Last 31 days (not 30) to ensure we always capture today
      const last31Days = new Date(now);
      last31Days.setDate(last31Days.getDate() - 31);
      last31Days.setHours(0, 0, 0, 0);
      
      // Year range
      const currentYear = now.getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      
      return {
        startToday,
        endToday,
        last31Days,
        startOfYear,
        endOfYear,
        currentYear
      };
    };

    const {
      startToday,
      endToday,
      last31Days,
      startOfYear,
      endOfYear,
      currentYear
    } = getDateRanges();

    // DEBUG: Log date ranges
    console.log('📅 Date Ranges:', {
      startToday: startToday.toISOString(),
      endToday: endToday.toISOString(),
      last31Days: last31Days.toISOString(),
      serverTime: new Date().toISOString()
    });

    // DEBUG: Count payments in different ranges
    const debugCounts = await Payment.aggregate([
      {
        $facet: {
          allPaidPayments: [
            { $match: { paymentStatus: "paid" } },
            { $count: "count" }
          ],
          paymentsLast31Days: [
            { $match: { paymentStatus: "paid", createdAt: { $gte: last31Days } } },
            { $count: "count" }
          ],
          paymentsToday: [
            { $match: { paymentStatus: "paid", createdAt: { $gte: startToday, $lte: endToday } } },
            { $count: "count" }
          ],
          recentPaymentsSample: [
            { $match: { paymentStatus: "paid" } },
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
            { $project: { _id: 1, amount: 1, createdAt: 1 } }
          ]
        }
      }
    ]);
    
    console.log('💳 Payment Counts:', {
      allPaid: debugCounts[0].allPaidPayments[0]?.count || 0,
      last31Days: debugCounts[0].paymentsLast31Days[0]?.count || 0,
      today: debugCounts[0].paymentsToday[0]?.count || 0,
      recentSample: debugCounts[0].recentPaymentsSample
    });

    const activeUsersCount = await Payment.distinct("user", {
      paymentStatus: "paid"
    }).then((users) => users.length);

    const [
      dashboardData,
      growthData,
      topPackagesData,
      revenueAnalyticsData,
      userAnalyticsData
    ] = await Promise.all([
      getDashboardData(startToday, endToday, last31Days, startOfYear, endOfYear),
      getGrowthData("monthly", currentYear),
      getTopPackagesData(),
      getRevenueAnalyticsData(last31Days, endToday),
      getUserAnalyticsData(last31Days, startOfYear, endOfYear)
    ]);

    const conversionRate =
      dashboardData.summary.totalUsers > 0
        ? ((activeUsersCount / dashboardData.summary.totalUsers) * 100).toFixed(2)
        : "0.00";

    const avgRevenuePerUser =
      dashboardData.summary.totalUsers > 0
        ? (dashboardData.summary.totalRevenue / dashboardData.summary.totalUsers).toFixed(2)
        : 0;

    const avgTransactionValue =
      dashboardData.summary.totalPayments > 0
        ? (dashboardData.summary.totalRevenue / dashboardData.summary.totalPayments).toFixed(2)
        : 0;

    const validationIssues = validateDashboardData({
      summary: dashboardData.summary,
      charts: dashboardData.charts,
      topLists: dashboardData.topLists,
      distributions: dashboardData.distributions
    });

    if (validationIssues.length > 0) {
      console.warn("Dashboard data validation issues:", validationIssues);
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        ...dashboardData.summary,
        activeUsers: activeUsersCount,
        conversionRate: `${conversionRate}%`,
        avgRevenuePerUser: parseFloat(avgRevenuePerUser),
        avgTransactionValue: parseFloat(avgTransactionValue)
      },
      charts: {
        monthlyRevenue: dashboardData.charts.monthlyRevenue,
        dailyRevenue: dashboardData.charts.dailyRevenue.slice(-30), // Take last 30 days only
        userGrowth: dashboardData.charts.userGrowth.slice(-30),
        bookingGrowth: dashboardData.charts.bookingGrowth.slice(-30),
        revenueByPackage: dashboardData.charts.revenueByPackage,
        paymentMethods: dashboardData.charts.paymentMethods,
        growthTrends: {
          users: growthData.data.users || [],
          bookings: growthData.data.bookings || [],
          revenue: growthData.data.revenue || []
        },
        revenueAnalytics: {
          byMonth: revenueAnalyticsData.analytics?.revenueByMonth || [],
          byDay: revenueAnalyticsData.analytics?.revenueByDay || [],
          byHour: revenueAnalyticsData.analytics?.revenueByHour || []
        },
        userAnalytics: {
          byMonth: userAnalyticsData.analytics?.usersByMonth || [],
          bySource: userAnalyticsData.analytics?.usersBySource || []
        }
      },
      topLists: {
        topUsers: dashboardData.topLists.topUsers || [],
        recentTransactions: dashboardData.topLists.recentTransactions || [],
        topPackages: topPackagesData.packages || [],
        userActivity: userAnalyticsData.analytics?.userActivity || []
      },
      distributions: {
        bookingStatus: dashboardData.distributions.bookingStatus || [],
        revenueDistribution: revenueAnalyticsData.analytics?.totalRevenue || [],
        userDistribution: userAnalyticsData.analytics?.totalUsers || []
      },
      metadata: {
        period: "last_30_days",
        year: currentYear,
        totalPackages: topPackagesData.totalPackages || 0,
        dataQuality: {
          hasNullPaymentMethods: dashboardData.charts.paymentMethods.some((p) => p._id === null),
          hasNullBookingStatus: dashboardData.distributions.bookingStatus.some((b) => b._id === null),
          validationIssues: validationIssues.length
        }
      }
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

function fillMissingDates(data, startDate, endDate, valueKey = "revenue") {
  const filledData = [];
  const dataMap = new Map(data.map((item) => [item.date || item._id, item]));

  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (currentDate <= end) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    if (dataMap.has(dateStr)) {
      const existingData = dataMap.get(dateStr);
      filledData.push({
        date: dateStr,
        ...existingData
      });
    } else {
      const emptyData = {
        date: dateStr,
        revenue: 0,
        transactions: 0
      };

      if (valueKey === "users") {
        emptyData.users = 0;
        delete emptyData.revenue;
        delete emptyData.transactions;
      } else if (valueKey === "bookings") {
        emptyData.bookings = 0;
        delete emptyData.revenue;
        delete emptyData.transactions;
      }

      filledData.push(emptyData);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`📊 Filled ${valueKey} dates:`, {
    total: filledData.length,
    first: filledData[0]?.date,
    last: filledData[filledData.length - 1]?.date
  });

  return filledData;
}

async function getDashboardData(
  startToday,
  endToday,
  last31Days,
  startOfYear,
  endOfYear
) {
  const [paymentsData, usersData, bookingsData] = await Promise.all([
    Payment.aggregate([
      {
        $facet: {
          totalPayments: [
            { $match: { paymentStatus: "paid" } },
            { $count: "count" }
          ],
          totalRevenue: [
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          todayStats: [
            {
              $match: {
                paymentStatus: "paid",
                createdAt: { $gte: startToday, $lte: endToday }
              }
            },
            {
              $addFields: {
                localDate: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "Asia/Kolkata"
                  }
                }
              }
            },
            {
              $group: {
                _id: "$localDate",
                revenue: { $sum: "$amount" },
                payments: { $sum: 1 },
                samplePayments: { $push: { id: "$_id", amount: "$amount", time: "$createdAt" } }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 1 }
          ],
          monthlyRevenue: [
            {
              $match: {
                paymentStatus: "paid",
                createdAt: { $gte: startOfYear, $lte: endOfYear }
              }
            },
            {
              $group: {
                _id: {
                  month: { $month: "$createdAt" },
                  year: { $year: "$createdAt" }
                },
                total: { $sum: "$amount" },
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ],
          dailyRevenue: [
            {
              $match: {
                paymentStatus: "paid",
                createdAt: { $gte: last31Days, $lte: endToday }
              }
            },
            {
              $addFields: {
                localDate: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "Asia/Kolkata"
                  }
                }
              }
            },
            {
              $group: {
                _id: "$localDate",
                total: { $sum: "$amount" },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          refundStats: [
            { $match: { paymentStatus: "refunded" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                totalAmount: { $sum: "$amount" }
              }
            }
          ],
          paymentMethods: [
            {
              $match: {
                paymentStatus: "paid",
                paymentMethod: { $exists: true, $ne: null }
              }
            },
            {
              $group: {
                _id: "$paymentMethod",
                count: { $sum: 1 },
                total: { $sum: "$amount" }
              }
            },
            { $sort: { total: -1 } }
          ],
          topUsers: [
            { $match: { paymentStatus: "paid" } },
            {
              $group: {
                _id: "$user",
                totalSpent: { $sum: "$amount" },
                paymentCount: { $sum: 1 }
              }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userDetails"
              }
            },
            {
              $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: "$_id",
                name: { $ifNull: ["$userDetails.name", "Unknown User"] },
                email: { $ifNull: ["$userDetails.email", "No Email"] },
                totalSpent: 1,
                paymentCount: 1
              }
            }
          ],
          recentTransactions: [
            { $match: { paymentStatus: "paid" } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userDetails"
              }
            },
            {
              $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                amount: 1,
                paymentMethod: { $ifNull: ["$paymentMethod", "Unknown"] },
                createdAt: 1,
                userName: { $ifNull: ["$userDetails.name", "Unknown User"] },
                userEmail: { $ifNull: ["$userDetails.email", "No Email"] }
              }
            }
          ],
          revenueByPackage: [
            { $match: { paymentStatus: "paid" } },
            {
              $group: {
                _id: "$package",
                revenue: { $sum: "$amount" },
                count: { $sum: 1 }
              }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "packages",
                localField: "_id",
                foreignField: "_id",
                as: "packageDetails"
              }
            },
            {
              $unwind: {
                path: "$packageDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                packageId: "$_id",
                packageName: {
                  $ifNull: ["$packageDetails.name", "Unknown Package"]
                },
                revenue: 1,
                count: 1,
                avgValue: {
                  $cond: [
                    { $eq: ["$count", 0] },
                    0,
                    { $divide: ["$revenue", "$count"] }
                  ]
                }
              }
            },
            { $sort: { revenue: -1 } }
          ]
        }
      }
    ]),

    User.aggregate([
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          newUsersToday: [
            { $match: { createdAt: { $gte: startToday, $lte: endToday } } },
            { $count: "count" }
          ],
          userGrowth: [
            { $match: { createdAt: { $gte: last31Days, $lte: endToday } } },
            {
              $addFields: {
                localDate: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "Asia/Kolkata"
                  }
                }
              }
            },
            {
              $group: {
                _id: "$localDate",
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]),

    Booking.aggregate([
      {
        $facet: {
          totalBookings: [
            { $match: { paymentStatus: "paid" } },
            { $count: "count" }
          ],
          todayBookings: [
            {
              $match: {
                paymentStatus: "paid",
                createdAt: { $gte: startToday, $lte: endToday }
              }
            },
            { $count: "count" }
          ],
          bookingStatus: [
            {
              $match: { status: { $exists: true, $ne: null } }
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],
          bookingGrowth: [
            {
              $match: {
                paymentStatus: "paid",
                createdAt: { $gte: last31Days, $lte: endToday }
              }
            },
            {
              $addFields: {
                localDate: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "Asia/Kolkata"
                  }
                }
              }
            },
            {
              $group: {
                _id: "$localDate",
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ])
  ]);

  const result = paymentsData[0] || {};
  const users = usersData[0] || {};
  const bookings = bookingsData[0] || {};

  const formatMonthlyData = (monthlyData) => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return (monthlyData || []).map((item) => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      revenue: item.total,
      transactions: item.count
    }));
  };

  const todayStats = result.todayStats?.[0] || { revenue: 0, payments: 0, _id: null };
  const totalRevenue = result.totalRevenue?.[0]?.total || 0;

  console.log('📊 Today Stats:', {
    todayDate: todayStats._id,
    todayRevenue: todayStats.revenue,
    todayPayments: todayStats.payments,
    samplePayments: todayStats.samplePayments?.slice(0, 2)
  });

  const todayBookings = bookings.todayBookings?.[0]?.count || 0;
  const todayPayments = todayStats.payments || 0;

  const rawDailyRevenue = (result.dailyRevenue || []).map((item) => ({
    date: item._id,
    revenue: item.total,
    transactions: item.count
  }));

  console.log("💰 Raw Daily Revenue Data:", {
    count: rawDailyRevenue.length,
    first: rawDailyRevenue[0]?.date,
    last: rawDailyRevenue[rawDailyRevenue.length - 1]?.date,
    lastFew: rawDailyRevenue.slice(-3)
  });

  const rawUserGrowth = (users.userGrowth || []).map((item) => ({
    date: item._id,
    users: item.count
  }));

  const rawBookingGrowth = (bookings.bookingGrowth || []).map((item) => ({
    date: item._id,
    bookings: item.count
  }));

  return {
    summary: {
      totalUsers: users.totalUsers?.[0]?.count || 0,
      newUsersToday: users.newUsersToday?.[0]?.count || 0,
      totalBookings: bookings.totalBookings?.[0]?.count || 0,
      todayBookings: todayBookings,
      totalPayments: result.totalPayments?.[0]?.count || 0,
      todayRevenue: todayStats.revenue || 0,
      todayPayments: todayPayments,
      totalRevenue: totalRevenue,
      refunds: result.refundStats?.[0]?.count || 0,
      refundAmount: result.refundStats?.[0]?.totalAmount || 0
    },
    charts: {
      monthlyRevenue: formatMonthlyData(result.monthlyRevenue),
      dailyRevenue: fillMissingDates(rawDailyRevenue, last31Days, endToday, "revenue"),
      userGrowth: fillMissingDates(rawUserGrowth, last31Days, endToday, "users"),
      bookingGrowth: fillMissingDates(rawBookingGrowth, last31Days, endToday, "bookings"),
      revenueByPackage: result.revenueByPackage || [],
      paymentMethods: result.paymentMethods || []
    },
    topLists: {
      topUsers: result.topUsers || [],
      recentTransactions: result.recentTransactions || []
    },
    distributions: {
      bookingStatus: bookings.bookingStatus || []
    }
  };
}


async function getGrowthData(period = "monthly", year = new Date().getFullYear()) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  let groupFormat;
  if (period === "daily") {
    groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  } else if (period === "weekly") {
    groupFormat = { $week: "$createdAt" };
  } else {
    groupFormat = { $month: "$createdAt" };
  }

  const [users, bookings, revenue] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Payment.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: groupFormat, revenue: { $sum: "$amount" } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  return {
    success: true,
    period,
    year,
    data: { users, bookings, revenue }
  };
}

async function getTopPackagesData(limit = 10) {
  const packages = await Payment.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        package: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: "$package",
        revenue: { $sum: "$amount" },
        bookings: { $sum: 1 },
        avgValue: { $avg: "$amount" }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: "packages",
        localField: "_id",
        foreignField: "_id",
        as: "packageDetails"
      }
    },
    { $unwind: { path: "$packageDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        packageName: { $ifNull: ["$packageDetails.name", "Unknown Package"] },
        packageId: "$_id",
        revenue: 1,
        bookings: 1,
        avgValue: { $round: ["$avgValue", 2] }
      }
    }
  ]);

  return {
    success: true,
    totalPackages: packages.length,
    packages
  };
}

async function getRevenueAnalyticsData(startDate, endDate) {
  const filter = {
    paymentStatus: "paid",
    createdAt: { $gte: startDate, $lte: endDate }
  };

  const analytics = await Payment.aggregate([
    { $match: filter },
    {
      $facet: {
        totalRevenue: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
        revenueByMonth: [
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              revenue: { $sum: "$amount" },
              transactions: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ],
        revenueByDay: [
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              revenue: { $sum: "$amount" },
              transactions: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],
        revenueByHour: [
          {
            $group: {
              _id: { $hour: "$createdAt" },
              revenue: { $sum: "$amount" },
              transactions: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  return {
    success: true,
    analytics: analytics[0] || {}
  };
}

async function getUserAnalyticsData(last31Days, startOfYear, endOfYear) {
  const analytics = await User.aggregate([
    {
      $facet: {
        totalUsers: [{ $count: "count" }],
        usersByMonth: [
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ],
        usersBySource: [
          {
            $match: { source: { $exists: true, $ne: null } }
          },
          {
            $group: {
              _id: "$source",
              count: { $sum: 1 }
            }
          }
        ],
        userActivity: [
          {
            $lookup: {
              from: "payments",
              localField: "_id",
              foreignField: "user",
              as: "payments",
              pipeline: [{ $match: { paymentStatus: "paid" } }]
            }
          },
          {
            $project: {
              name: 1,
              email: 1,
              createdAt: 1,
              totalSpent: { $sum: "$payments.amount" },
              paymentCount: { $size: "$payments" },
              lastPayment: { $max: "$payments.createdAt" }
            }
          },
          { $match: { totalSpent: { $gt: 0 } } },
          { $sort: { totalSpent: -1 } },
          { $limit: 20 }
        ],
        recentUsers: [
          { $match: { createdAt: { $gte: last31Days } } },
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $project: {
              name: 1,
              email: 1,
              createdAt: 1,
              avatar: 1
            }
          }
        ]
      }
    }
  ]);

  return {
    success: true,
    analytics: analytics[0] || {}
  };
}

function validateDashboardData(data) {
  const issues = [];

  // Note: todayBookings > 0 with todayRevenue === 0 is valid when users book slots using pre-paid packages

  if (
    data.charts.paymentMethods &&
    data.charts.paymentMethods.some((p) => p._id === null)
  ) {
    issues.push("Some payments missing payment method");
  }

  return issues;
}


export {
  registerAdmin,
  adminLogin,
  adminDashboard,
};
