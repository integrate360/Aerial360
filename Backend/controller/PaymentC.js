const AsyncHandler = require("express-async-handler");
const { addEventToGoogleCalendar } = require("../utils/googleCalendar");
const Payment = require("../model/PaymentM");
const Booking = require("../model/BookingM");
const Class = require("../model/ClassM");
const User = require("../model/UserM");
const { v4: uuid } = require("uuid");
const Razorpay = require("razorpay");
const moment = require("moment");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const { sendInvoiceToUser } = require("../helper/Invoice");
const PackageM = require("../model/PackageM");
const UserPackagesM = require("../model/UserPackagesM");

const createPayment = AsyncHandler(async (req, res) => {
  const { user, class: classId, amount, bookings } = req.body;

  // Validate required fields
  if (!user || !amount || !bookings) {
    return res
      .status(400)
      .json({ message: "Booking, user, and amount are required" });
  }

  // Validate references
  const classExists = await Class.findById(classId);
  if (!classExists) {
    return res.status(404).json({ message: "Class not found" });
  }

  const userExists = await User.findById(user);
  if (!userExists) {
    return res.status(404).json({ message: "User not found" });
  }

  // Create a payment
  const newPayment = await Payment.create({
    ...req.body,
    class: classId,
    user,
    amount,
  });

  // Create bookings and use aggregation to populate location
  try {
    const bookingPromises = bookings?.map(async (book) => {
      if (!book.dates || !book.time || !book.class) {
        throw new Error("Invalid booking data");
      }
      const newBooking = new Booking({ ...book });
      await newBooking.save();
      return newBooking;
    });

    const createdBookings = await Promise.all(bookingPromises);

    // Aggregation to populate location and other details in one query
    const populatedBookings = await Booking.aggregate([
      {
        $match: { _id: { $in: createdBookings.map((b) => b._id) } },
      },
      {
        $lookup: {
          from: "locations", // Lookup the locations collection
          localField: "location", // Join with the location field
          foreignField: "_id", // Match by _id in the Location collection
          as: "locationDetails", // Store matched locations in locationDetails
        },
      },
      {
        $unwind: {
          path: "$locationDetails",
          preserveNullAndEmptyArrays: true, // Allows empty location fields if not matched
        },
      },
      {
        $project: {
          _id: 1,
          className: 1,
          locationName: { $ifNull: ["$locationDetails.name", "N/A"] }, // If location is not found, set to "N/A"
          dates: 1,
          totalAmount: amount,
        },
      },
    ]);

    // Send invoice email to the user
    try {
      const locationNames =
        populatedBookings.map((booking) => booking.locationName).join(", ") ||
        "N/A"; // Join location names if multiple locations

      const bookingDetails = {
        _id: newPayment._id,
        className: classExists.name,
        location: locationNames, // Locations are now correctly populated and joined
        dates:
          populatedBookings[0]?.dates?.map((e) =>
            moment(e).format("MMM DD, YYYY")
          ) || [], // Assuming dates are in bookings
        isPackge: false,
        totalAmount: amount,
      };

      const userDetails = {
        name: userExists.name,
        email: userExists.email,
        phone: userExists?.phone,
      };

      console.log("Sending invoice email to user:", userDetails);
      await sendInvoiceToUser(userDetails, bookingDetails);
      console.log("Invoice email sent successfully");
    } catch (emailError) {
      console.error("Failed to send invoice email:", emailError.message);
    }
    for (const booking of createdBookings) {
      try {
        const eventDetails = {
          title: `Class: ${classExists.name}`,
          description: `Location: ${booking.locationName}`,
          start: moment(booking.dates[0]).toISOString(),
          end: moment(booking.dates[0]).add(1, "hours").toISOString(), // assuming 1-hour class
        };

        await addEventToGoogleCalendar(userExists, eventDetails);
        console.log("Calendar event created for:", userExists.email);
      } catch (calendarErr) {
        console.error("Calendar error:", calendarErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Payment and bookings created successfully",
      data: {
        payment: newPayment,
        bookings: createdBookings,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error creating bookings: ${error.message}` });
  }
});

const createPackagePayment = AsyncHandler(async (req, res) => {
  const { package, user, amount, bookings } = req.body;

  console.log("Booking From frontend : ", req.body);


  if (!user || !amount || !bookings) {
    return res
      .status(400)
      .json({ message: "Booking, user, and amount are required" });
  }

  const UniqueId = uuid();

  const classExists = await PackageM.findById(package);
  if (!classExists) {
    return res.status(404).json({ message: "Package not found" });
  }

  const userExists = await User.findById(user);
  if (!userExists) {
    return res.status(404).json({ message: "User not found" });
  }

  const newPayment = await Payment.create({
    ...req.body,
    package,
    user,
    amount,
  });

  try {
    let bookingIds = [];
    const bookingPromises = bookings?.map(async (book) => {
      const newBooking = new Booking({
        ...book,
        user,
        class: book?.classId,
        dates: [book?.date],
        location: book?.location?._id,
        time: book?.time,
        duration: book?.classDuration,
        package,
        uuid: UniqueId,
      });
      await newBooking.save();
      bookingIds.push(newBooking?._id);
      return newBooking;
    });

    const createdBookings = await Promise.all(bookingPromises);

    // Aggregate populated bookings (with location)
    const populatedBookings = await Booking.aggregate([
      {
        $match: { _id: { $in: createdBookings.map((b) => b._id) } },
      },
      {
        $lookup: {
          from: "locations",
          localField: "location",
          foreignField: "_id",
          as: "locationDetails",
        },
      },
      {
        $unwind: {
          path: "$locationDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          className: 1,
          locationName: { $ifNull: ["$locationDetails.name", "N/A"] },
          dates: 1,
          time: 1,
          duration: 1,
          totalAmount: amount,
        },
      },
    ]);

    // Create User Package History
    try {
      const userPackage = new UserPackagesM({
        uuid: UniqueId,
        bookings: bookingIds,
        package,
        price: amount,
        slots: bookingIds?.length,
        totalSlots: classExists?.days,
        user,
      });
      await userPackage.save();
    } catch (error) {
      console.log("Error Creating User Package" + error);
      return res.status(300).json({ message: error.message });
    }

    // Send invoice email to user
    try {
      const locationNames =
        populatedBookings.map((b) => b.locationName).join(", ") || "N/A";

      const bookingDetails = {
        _id: newPayment._id,
        className: classExists.name,
        location: locationNames,
        dates:
          populatedBookings[0]?.dates?.map((d) =>
            moment(d).format("MMM DD, YYYY")
          ) || [],
        totalAmount: amount,
        isPackge: true,
      };

      const userDetails = {
        name: userExists.name,
        email: userExists.email,
        phone: userExists?.phone,
      };

      console.log("Sending invoice email to user:", userDetails);
      await sendInvoiceToUser(userDetails, bookingDetails);
      console.log("Invoice email sent successfully");
    } catch (emailError) {
      console.error("Failed to send invoice email:", emailError.message);
    }

    // Send admin email notification
    try {
      const adminBookingDetails = {
        paymentId: newPayment._id,
        packageName: classExists.name,
        classes: bookings.map((booking, index) => {
          const populatedBooking = populatedBookings.find(pb =>
            pb.dates.some(date =>
              moment(date).format("YYYY-MM-DD") === moment(booking.date).format("YYYY-MM-DD")
            )
          );

          return {
            name: booking.className || 'Unknown Service',
            date: moment(booking.date).format("MMM DD, YYYY"),
            time: booking.time,
            location: booking.location?.name || 'Unknown Location',
            duration: booking.duration || booking.classDuration || 60
          };
        }),
        isPackage: true,
        totalAmount: amount,
        bookingDate: moment().format("MMM DD, YYYY")
      };

      const adminUserDetails = {
        name: userExists.name,
        email: userExists.email,
        phone: userExists.phone || "Not provided",
      };

      console.log("Sending admin notification email");
      await sendInvoiceToUser(adminUserDetails, adminBookingDetails);
      console.log("Admin notification email sent successfully");
    } catch (adminEmailError) {
      console.error("Failed to send admin email:", adminEmailError.message);
    }

    // Add to Google Calendar
    for (const booking of createdBookings) {
      try {
        // const location = await Location.findById(booking.location);
        const eventDetails = {
          title: `Class: ${classExists.name}`,
          // description: `Location: ${location?.name || "N/A"}`,
          start: moment(booking.dates[0]).toISOString(),
          end: moment(booking.dates[0]).add(1, "hours").toISOString(),
        };

        await addEventToGoogleCalendar(userExists, eventDetails);
        console.log("Calendar event created for:", userExists.email);
      } catch (calendarErr) {
        console.error("Calendar error:", calendarErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Package payment and bookings created successfully",
      data: {
        payment: newPayment,
        bookings: createdBookings,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error creating bookings: ${error.message}` });
  }
});

const getDateRange = (filter) => {
  const now = moment();
  let startDate = null;
  let endDate = null;

  switch (filter) {
    case "weekly":
      startDate = now.clone().startOf("isoWeek"); // Using isoWeek for Monday start
      endDate = now.clone().endOf("isoWeek");
      break;

    case "lastWeek":
      startDate = now.clone().subtract(1, "week").startOf("isoWeek");
      endDate = now.clone().subtract(1, "week").endOf("isoWeek");
      break;

    case "monthly":
      startDate = now.clone().startOf("month");
      endDate = now.clone().endOf("month");
      break;

    case "lastMonth":
      startDate = now.clone().subtract(1, "month").startOf("month");
      endDate = now.clone().subtract(1, "month").endOf("month");
      break;

    case "yearly":
      startDate = now.clone().startOf("year");
      endDate = now.clone().endOf("year");
      break;

    case "lastYear":
      startDate = now.clone().subtract(1, "year").startOf("year");
      endDate = now.clone().subtract(1, "year").endOf("year");
      break;

    case "all":
    default:
      // Return null for no date filtering
      return null;
  }

  return startDate && endDate
    ? { $gte: startDate.toDate(), $lte: endDate.toDate() }
    : null;
};

const getAllPayments = AsyncHandler(async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const filter = req.query.filter || "all";
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const dateFilter = getDateRange(filter);

    // Base Match Query
    const matchQuery = {
      paymentStatus: "paid",
    };

    if (dateFilter) {
      matchQuery.createdAt = dateFilter;
    }

    // 🔎 Search Filter
    const searchRegex = search
      ? { $regex: search, $options: "i" }
      : null;

    // ================= AGGREGATION FOR PAYMENTS LIST =================
    const paymentsPipeline = [
      { $match: matchQuery },

      // Join user data
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Join package data (if needed)
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: {
          path: "$package",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Join class data (if needed)
      {
        $lookup: {
          from: "classes",
          localField: "class",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $unwind: {
          path: "$class",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Search by user name or email
      ...(search
        ? [
          {
            $match: {
              $or: [
                { "user.name": searchRegex },
                { "user.email": searchRegex },
              ],
            },
          },
        ]
        : []),

      // Sort Latest First
      { $sort: { createdAt: -1 } },

      // Pagination
      { $skip: skip },
      { $limit: limit },
    ];

    const payments = await Payment.aggregate(paymentsPipeline);

    // ================= TOTAL COUNT =================
    const countPipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      ...(search
        ? [
          {
            $match: {
              $or: [
                { "user.name": searchRegex },
                { "user.email": searchRegex },
              ],
            },
          },
        ]
        : []),

      { $count: "total" },
    ];

    const totalResult = await Payment.aggregate(countPipeline);
    const totalPayments = totalResult[0]?.total || 0;

    // ================= ALL TIME REVENUE =================
    const allTimeRevenue = await Payment.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // ================= FILTERED REVENUE =================
    // This should match the current filter (date range + search)
    const filteredRevenuePipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      ...(search
        ? [
          {
            $match: {
              $or: [
                { "user.name": searchRegex },
                { "user.email": searchRegex },
              ],
            },
          },
        ]
        : []),

      { $group: { _id: null, total: { $sum: "$amount" } } },
    ];

    const filteredResult = await Payment.aggregate(filteredRevenuePipeline);
    const filteredRevenue = filteredResult[0]?.total || 0;

    // ================= RESPONSE =================
    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      pagination: {
        page,
        limit,
        totalPayments,
        totalPages: Math.ceil(totalPayments / limit),
      },
      revenue: {
        allTime: allTimeRevenue[0]?.total || 0,
        filtered: filteredRevenue, // This is the revenue for the current filter
      },
      payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
});





const getPaymentById = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new Error("Please provide an ID");
  }

  const payment = await Payment.findOne({ _id: id, paymentStatus: "paid" })
    .populate("class")
    .populate({
      path: "package",
      populate: {
        path: "services",
      },
    })
    .populate("user");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found with this ID");
  }

  res.status(200).json({
    success: true,
    message: "Payment fetched successfully",
    data: payment,
  });
});

// Update a payment by ID
const updatePayment = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide an ID");

  const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("class booking user", "title name amount");

  if (!updatedPayment) throw new Error("Payment not found with this ID");

  res.status(200).json({
    success: true,
    message: "Payment updated successfully",
    data: updatedPayment,
  });
});

const deletePayment = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide an ID");

  const deletedPayment = await Payment.findByIdAndDelete(id);

  if (!deletedPayment) throw new Error("Payment not found with this ID");

  res.status(200).json({
    success: true,
    message: "Payment deleted successfully",
    data: deletedPayment,
  });
});

const createRazorpayPayment = AsyncHandler(async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount, // Amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_${Math.random() * 1000}`,
    });

    res.status(200).json({ orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});
module.exports = {
  createPayment,
  createRazorpayPayment,
  getAllPayments,
  getPaymentById,
  createPackagePayment,
  updatePayment,
  deletePayment,
};
