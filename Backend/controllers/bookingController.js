import AsyncHandler from "express-async-handler";
import Package from "../models/packageModel.js";
import cron from "node-cron";
import Booking from "../models/bookingModel.js";
import Location from "../models/locationModel.js";
import Class from "../models/classModel.js";
import Staff from "../models/staffModel.js";
import User from "../models/userModel.js";
import moment from "moment";
import PaymentM from "../models/paymentModel.js";
import mongoose from "mongoose";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.Sendgrid_Key);

import admin from "../config/firebaseConfig.js";
import { sendEmailToUser } from "../helpers/emailSender.js";
import UserPackagesM from "../models/userPackageModel.js";
import { sendInvoiceToUser } from "../helpers/invoiceHelper.js";
import ClassM from "../models/classModel.js";
import { sendMultipleBookingsEmail } from "../helpers/remainingBookingEmail.js";
import { parseSlotDateTime } from "../utils/slotDateTime.js";
import { getEffectivePackageExpiry } from "../utils/packageExpiryHelper.js";

// Define the logo URL (use the absolute URL of your logo image)
const logoUrl =
  "https://airboundfitnessnew.s3.ap-south-1.amazonaws.com/airboundfitness/1736425167169-ASS.png";
function convertTo12HourFormat(time) {
  if (Array.isArray(time)) {
    time = time[0];
  }

  if (time instanceof Date) {
    time = `${time.getHours()}:${time.getMinutes()}`;
  }

  if (typeof time !== "string") {
    console.error("Invalid time input:", time);
    return "";
  }

  const [hoursStr, minutesStr] = time.trim().split(":");
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    console.error("Invalid time format:", time);
    return "";
  }

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// In-memory set to prevent sending duplicate reminders for the same booking session
const sentClassReminders = new Set();

// Schedule a task to run every minute to check for upcoming classes
cron.schedule("* * * * *", async () => {
  try {
    const nowIST = moment().utcOffset("+05:30");
    const todayStartUTC = nowIST.clone().startOf("day").utc().toDate();
    const todayEndUTC = nowIST.clone().endOf("day").utc().toDate();

    // Periodically reset reminder cache at midnight to prevent memory growth
    if (nowIST.hours() === 0 && nowIST.minutes() === 0 && sentClassReminders.size > 0) {
      sentClassReminders.clear();
    }

    // Only query bookings that are paid and have sessions scheduled for TODAY
    const bookings = await Booking.find({
      dates: { $gte: todayStartUTC, $lte: todayEndUTC },
      paymentStatus: "paid",
    }).populate("user");

    if (!bookings || bookings.length === 0) {
      return;
    }

    for (const booking of bookings) {
      const user = booking.user;
      if (!user || !user.deviceToken) {
        continue;
      }

      const dates = Array.isArray(booking.dates) ? booking.dates : [booking.dates];
      const times = Array.isArray(booking.time) ? booking.time : [booking.time];

      for (let i = 0; i < dates.length; i++) {
        const slotDate = dates[i];
        if (!slotDate) continue;

        const slotDateIST = moment(slotDate).utcOffset("+05:30");
        // Ensure this session is actually today
        if (slotDateIST.format("YYYY-MM-DD") !== nowIST.format("YYYY-MM-DD")) {
          continue;
        }

        const slotTimeStr = times[i] || times[0] || "";
        if (!slotTimeStr) continue;

        // Parse slot date and time
        const slotDateStr = slotDateIST.format("DD-MM-YYYY");
        let classDateTime = parseSlotDateTime(slotDateStr, slotTimeStr);
        if (!classDateTime || !classDateTime.isValid()) {
          classDateTime = moment(`${slotDateIST.format("YYYY-MM-DD")} ${slotTimeStr}`);
        }

        if (!classDateTime.isValid()) {
          continue;
        }

        const minuteDifference = classDateTime.diff(nowIST, "minutes");
        const reminderKey = `${booking._id}_${slotDateStr}_${slotTimeStr}`;

        // Check if class starts within next 30 minutes and reminder hasn't been sent yet
        if (minuteDifference >= 0 && minuteDifference <= 30 && !sentClassReminders.has(reminderKey)) {
          console.log(`Processing booking ${booking._id}: class starting in ${minuteDifference} mins at ${slotTimeStr}`);

          const message = {
            notification: {
              title: "Upcoming Class Reminder",
              body: `Your class is starting in 30 minutes at ${convertTo12HourFormat(slotTimeStr)}.`,
              imageUrl: logoUrl,
            },
            data: {
              type: "class_reminder",
              bookingId: booking._id.toString(),
              time: slotTimeStr,
            },
            token: user.deviceToken,
          };

          try {
            const response = await admin.messaging().send(message);
            console.log(`Successfully sent reminder to ${user.name || user._id}:`, response);
            sentClassReminders.add(reminderKey);
          } catch (sendError) {
            console.error(`Error sending push notification to user ${user._id}:`, sendError.message);

            // Clean up invalid or mismatched tokens so they don't cause errors repeatedly
            if (
              sendError.code === "messaging/mismatched-credential" ||
              sendError.code === "messaging/invalid-registration-token" ||
              sendError.code === "messaging/registration-token-not-registered"
            ) {
              await User.findByIdAndUpdate(user._id, { $unset: { deviceToken: 1 } });
              console.log(`Removed invalid/mismatched device token for user ${user._id} (${sendError.code})`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in upcoming classes cron:", error);
  }
});

// Get all bookings with server-side pagination, search, and filtering
const getAllBookings = AsyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = req.query.all === "true" || req.query.limit === "0" ? 0 : (parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * (limit > 0 ? limit : 10);
  const search = req.query.search ? req.query.search.trim() : "";
  const location = req.query.location;
  const classId = req.query.classId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const matchStage = { paymentStatus: "paid" };

  if (location && mongoose.Types.ObjectId.isValid(location)) {
    matchStage.location = new mongoose.Types.ObjectId(location);
  }

  if (classId && mongoose.Types.ObjectId.isValid(classId)) {
    matchStage.class = new mongoose.Types.ObjectId(classId);
  }

  if (startDate || endDate) {
    matchStage.dates = {};
    if (startDate) matchStage.dates.$gte = new Date(startDate);
    if (endDate) matchStage.dates.$lte = moment(endDate).endOf("day").toDate();
  }

  let data = [];
  let total = 0;

  if (!search) {
    total = await Booking.countDocuments(matchStage);

    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
    ];

    if (limit > 0) {
      pipeline.push({ $skip: skip }, { $limit: limit });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "class",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "locations",
          localField: "location",
          foreignField: "_id",
          as: "location",
        },
      },
      { $unwind: { path: "$location", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "staffs",
          localField: "trainer",
          foreignField: "_id",
          as: "trainer",
        },
      },
      { $unwind: { path: "$trainer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } }
    );

    data = await Booking.aggregate(pipeline);
  } else {
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "class",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "locations",
          localField: "location",
          foreignField: "_id",
          as: "location",
        },
      },
      { $unwind: { path: "$location", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "staffs",
          localField: "trainer",
          foreignField: "_id",
          as: "trainer",
        },
      },
      { $unwind: { path: "$trainer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
    ];

    const searchRegex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [
          { "user.name": searchRegex },
          { "user.email": searchRegex },
          { "user.phone": searchRegex },
          { "class.name": searchRegex },
          { "location.name": searchRegex },
          { "package.name": searchRegex },
        ],
      },
    });

    const facetDataPipeline = [{ $sort: { createdAt: -1 } }];
    if (limit > 0) {
      facetDataPipeline.push({ $skip: skip }, { $limit: limit });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: facetDataPipeline,
      },
    });

    const results = await Booking.aggregate(pipeline);
    total = results[0]?.metadata[0]?.total || 0;
    data = results[0]?.data || [];
  }

  res.status(200).json({
    success: true,
    message: "Bookings fetched successfully",
    data,
    pagination: {
      total,
      page,
      limit: limit > 0 ? limit : total,
      totalPages: limit > 0 ? (Math.ceil(total / limit) || 1) : 1,
    },
  });
});

const getAllBookingsdates = AsyncHandler(async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: "paid" })
      .populate({
        path: "user",
        select: "name",
        model: "User",
      })
      .populate({
        path: "trainer",
        select: "name",
        model: "Staff",
      })
      .populate({
        path: "package",
        select: "name",
        model: "Package",
      })
      .populate({
        path: "class",
        select: "name",
        model: "Class",
      })
      .populate({
        path: "location",
        select: "name",
        model: "Location",
      })
      .select("dates time");

    const simplifiedBookings = bookings.map((booking) => {
      const user = booking.user?._id ? { name: booking.user.name } : null;
      const trainer = booking.trainer?._id
        ? { name: booking.trainer.name }
        : null;
      const location = booking.location?._id
        ? { name: booking.location.name }
        : null;

      const packageInfo = booking.package?._id
        ? { name: booking.package.name }
        : null;

      // Handle class array properly
      const classInfo =
        booking.class && booking.class.length > 0
          ? { name: booking.class.map((c) => c.name).join(", ") }
          : null;

      // Determine booking type and name
      let bookingType = null;
      let bookingTypeName = null;

      if (packageInfo) {
        bookingType = "package";
        bookingTypeName = classInfo?.name || null;
      } else if (classInfo) {
        bookingType = "class";
        bookingTypeName = classInfo.name;
      }

      // Weekday names
      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      // Format dates to DD-MM-YYYY (DayName)
      const formattedDates = booking.dates.map((date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const dayName = weekdays[d.getDay()];
        return `${day}-${month}-${year} (${dayName})`;
      });

      // Convert times to 12-hour format
      const formattedTimes = Array.isArray(booking.time)
        ? booking.time.map((time) => {
            if (!time) return null;
            const [hours, minutes] = time.split(":");
            const parsedHours = parseInt(hours, 10);
            const ampm = parsedHours >= 12 ? "PM" : "AM";
            const twelveHour = parsedHours % 12 || 12;
            return `${twelveHour}:${minutes} ${ampm}`;
          })
        : [];

      return {
        _id: booking._id,
        user: user?.name || null,
        trainer: trainer?.name || null,
        location: location?.name || null,
        bookingType,
        bookingTypeName,
        dates: formattedDates,
        time: formattedTimes,
      };
    });

    res.status(200).json({
      data: simplifiedBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
});

const getAllBookingsdatesadmin = AsyncHandler(async (req, res) => {
  try {
    const { classId, date, locationId, time } = req.query;

    let query = { paymentStatus: "paid" };

    if (classId) {
      query.class = classId;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: "user",
        select: "name",
        model: "User",
      })
      .populate({
        path: "trainer",
        select: "name",
        model: "Staff",
      })
      .populate({
        path: "package",
        select: "name",
        model: "Package",
      })
      .populate({
        path: "class",
        select: "name availability",
        model: "Class",
      })
      .populate({
        path: "location",
        select: "name",
        model: "Location",
      })
      .select("dates time class location");

    // Update booking counts to include location
    const bookingCounts = {};

    bookings.forEach((booking) => {
      if (
        booking.class &&
        booking.class.length > 0 &&
        booking.dates &&
        booking.time &&
        booking.location
      ) {
        const classId = booking.class[0]._id.toString();
        const className = booking.class[0].name;
        const locationId =
          booking.location._id?.toString() || booking.location.toString();

        booking.dates.forEach((bookingDate) => {
          const dateStr = new Date(bookingDate).toISOString().split("T")[0];
          booking.time.forEach((bookingTime) => {
            // Include location in the key
            const key = `${classId}-${dateStr}-${bookingTime}-${locationId}`;

            if (!bookingCounts[key]) {
              bookingCounts[key] = {
                classId: classId,
                className: className,
                date: dateStr,
                time: bookingTime,
                locationId: locationId,
                locationName: booking.location.name || "Unknown",
                count: 0,
                maxPeople: null,
                availability: null,
              };
            }
            bookingCounts[key].count++;

            // Store maxPeople from the class availability
            if (
              !bookingCounts[key].maxPeople &&
              booking.class[0].availability
            ) {
              const timeSlot = booking.class[0].availability.find(
                (slot) =>
                  slot.time === bookingTime &&
                  slot.locations.some(
                    (loc) => loc._id.toString() === locationId,
                  ),
              );
              if (timeSlot) {
                bookingCounts[key].maxPeople = timeSlot.maxPeople;
                bookingCounts[key].availability = timeSlot;
              } else {
                bookingCounts[key].maxPeople =
                  booking.class[0].availability[0]?.maxPeople || null;
                bookingCounts[key].availability =
                  booking.class[0].availability[0] || null;
              }
            }
          });
        });
      }
    });

    // Apply additional filters
    let filteredBookings = bookings;

    if (date || locationId || time) {
      filteredBookings = bookings.filter((booking) => {
        if (date) {
          const hasMatchingDate =
            booking.dates &&
            booking.dates.some((bookingDate) => {
              const bookingDateStr = new Date(bookingDate)
                .toISOString()
                .split("T")[0];
              return bookingDateStr === date;
            });
          if (!hasMatchingDate) return false;
        }

        if (locationId) {
          const bookingLocationId =
            booking.location?._id?.toString() || booking.location?.toString();
          if (bookingLocationId !== locationId) return false;
        }

        if (time) {
          const hasMatchingTime = booking.time && booking.time.includes(time);
          if (!hasMatchingTime) return false;
        }

        return true;
      });
    }

    const simplifiedBookings = filteredBookings.map((booking) => {
      // ... (keep your existing mapping logic)
      const user = booking.user?._id ? { name: booking.user.name } : null;
      const trainer = booking.trainer?._id
        ? { name: booking.trainer.name }
        : null;
      const location = booking.location?._id
        ? { name: booking.location.name }
        : null;

      const packageInfo = booking.package?._id
        ? { name: booking.package.name }
        : null;

      // Calculate current bookings with location consideration
      let currentBookings = 0;
      let maxPeople = null;
      let availableSpots = null;
      let isFull = false;

      if (
        booking.class &&
        booking.class.length > 0 &&
        booking.dates &&
        booking.time &&
        booking.location
      ) {
        const classData = booking.class[0];
        const classId = classData._id.toString();
        const dateStr = new Date(booking.dates[0]).toISOString().split("T")[0];
        const bookingTime = booking.time[0];
        const bookingLocationId =
          booking.location._id?.toString() || booking.location.toString();

        // Include location in the key
        const key = `${classId}-${dateStr}-${bookingTime}-${bookingLocationId}`;
        const countInfo = bookingCounts[key];

        if (countInfo) {
          currentBookings = countInfo.count;
          maxPeople = countInfo.maxPeople;
          availableSpots = maxPeople ? maxPeople - currentBookings : null;
          isFull = availableSpots !== null && availableSpots <= 0;
        }
      }

      const classInfo =
        booking.class && booking.class.length > 0
          ? {
              name: booking.class.map((c) => c.name).join(", "),
              ids: booking.class.map((c) => c._id.toString()),
              availability: booking.class[0]?.availability || [],
            }
          : null;

      let bookingType = null;
      let bookingTypeName = null;

      if (packageInfo) {
        bookingType = "package";
        bookingTypeName = packageInfo.name;
      } else if (classInfo) {
        bookingType = "class";
        bookingTypeName = classInfo.name;
      }

      // Weekday names and date formatting...
      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const formattedDates = booking.dates.map((date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const dayName = weekdays[d.getDay()];
        return `${day}-${month}-${year} (${dayName})`;
      });

      const formattedTimes = Array.isArray(booking.time)
        ? booking.time.map((time) => {
            if (!time) return null;
            const [hours, minutes] = time.split(":");
            const parsedHours = parseInt(hours, 10);
            const ampm = parsedHours >= 12 ? "PM" : "AM";
            const twelveHour = parsedHours % 12 || 12;
            return `${twelveHour}:${minutes} ${ampm}`;
          })
        : [];

      return {
        _id: booking._id,
        user: user?.name || null,
        trainer: trainer?.name || null,
        location: location?.name || null,
        bookingType,
        bookingTypeName,
        dates: formattedDates,
        time: formattedTimes,
        classIds: classInfo?.ids || [],
        maxPeople: maxPeople,
        currentBookings: currentBookings,
        availableSpots: availableSpots,
        isFull: isFull,
        classAvailability: classInfo?.availability || [],
      };
    });

    // Filter booking summary by location as well
    let filteredBookingSummary = Object.values(bookingCounts);

    if (classId || date || time || locationId) {
      filteredBookingSummary = filteredBookingSummary.filter((item) => {
        if (classId && item.classId !== classId) return false;
        if (date && item.date !== date) return false;
        if (time && item.time !== time) return false;
        if (locationId && item.locationId !== locationId) return false; // Add location filter
        return true;
      });
    }

    const bookingSummary = filteredBookingSummary.map((item) => ({
      classId: item.classId,
      className: item.className,
      date: item.date,
      time: item.time,
      locationId: item.locationId,
      locationName: item.locationName,
      currentBookings: item.count,
      maxPeople: item.maxPeople,
      availableSpots: item.maxPeople ? item.maxPeople - item.count : null,
      isFull: item.maxPeople ? item.maxPeople - item.count <= 0 : false,
    }));

    // Update specific availability to include location
    let specificAvailability = null;
    if (classId && date && time && locationId) {
      const key = `${classId}-${date}-${time}-${locationId}`;
      const countInfo = bookingCounts[key];
      if (countInfo) {
        specificAvailability = {
          classId: countInfo.classId,
          className: countInfo.className,
          date: countInfo.date,
          time: countInfo.time,
          locationId: countInfo.locationId,
          locationName: countInfo.locationName,
          currentBookings: countInfo.count,
          maxPeople: countInfo.maxPeople,
          availableSpots: countInfo.maxPeople
            ? countInfo.maxPeople - countInfo.count
            : null,
          isFull: countInfo.maxPeople
            ? countInfo.maxPeople - countInfo.count <= 0
            : false,
        };
      }
    }

    res.status(200).json({
      success: true,
      message:
        classId || date || locationId || time
          ? `Bookings fetched with filters applied`
          : "All bookings fetched successfully",
      // data: simplifiedBookings,
      bookingSummary: bookingSummary,
      specificAvailability: specificAvailability,
      // total: simplifiedBookings.length,
      // filters: {
      //   classId: classId || 'none',
      //   date: date || 'none',
      //   locationId: locationId || 'none',
      //   time: time || 'none'
      // }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
});

const createBooking = AsyncHandler(async (req, res) => {
  const {
    class: classId,
    user: userId,
    dates,
    location,
    uPackageId,
    paymentStatus = "paid",
  } = req.body;

  // Validate required fields
  if (!classId || !userId || !dates || dates.length === 0) {
    throw new Error("Class, user, and dates are required");
  }

  // Validate references
  const classExists = await Class.findById(classId);
  if (!classExists) throw new Error("Class not found");

  const userExists = await User.findById(userId);
  if (!userExists) throw new Error("User not found");

  if (uPackageId) {
    const userPackage = await UserPackagesM.findById(uPackageId)
      .populate("package")
      .populate("bookings");
    if (!userPackage) throw new Error("User package not found");

    const expiry = getEffectivePackageExpiry(userPackage);
    if (expiry) {
      const now = moment();
      if (now.isAfter(expiry)) {
        throw new Error(`Package expired on ${expiry.format("DD-MM-YYYY")}`);
      }
      if (dates && dates.length > 0) {
        const requestedDate = moment(dates[0]).endOf("day");
        if (requestedDate.isAfter(expiry)) {
          throw new Error(
            `Requested class date (${moment(dates[0]).format("DD-MM-YYYY")}) is outside package validity period (expires ${expiry.format("DD-MM-YYYY")})`
          );
        }
      }
    }

    if (userPackage.slots + 1 > userPackage.totalSlots) {
      throw new Error(`Exceeds package limit of ${userPackage.totalSlots} sessions`);
    }
  }

  // Create a booking
  const newBooking = await Booking.create({
    ...req.body,
    class: classId,
    user: userId,
    dates,
    location,
    paymentStatus: "paid",
    isBookedByAdmin: true,
  });

  const updateUserPackage = await UserPackagesM.findByIdAndUpdate(
    uPackageId,
    {
      $push: { booking: newBooking?._id }, // Add new booking ID to the array
      $inc: { slots: 1 }, // Increment slots by 1
      $set: { paymentStatus: "paid" },
      $set: { isBookedByAdmin: true },
    },
    { new: true }, // Returns the updated document
  );

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: newBooking,
  });
});

// const createBookingForAdmin = AsyncHandler(async (req, res) => {
//   const {
//     packageId,
//     userId,
//     trainerId,
//     times,
//     duration,
//     dates,
//     uuid,
//     locationId,
//     amount,
//     partialAmount,
//     people,
//     userPackageId,
//     serviceIds,
//   } = req.body;

//   if (!userId || !amount) {
//     return res.status(400).json({
//       success: false,
//       message: "User and amount are required"
//     });
//   }

//   if (
//     Array.isArray(times) &&
//     Array.isArray(dates) &&
//     Array.isArray(serviceIds) &&
//     (times.length !== dates.length || times.length !== serviceIds.length)
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: "times, dates, and serviceIds must be arrays of equal length",
//     });
//   }

//   try {
//     // Validate user
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Validate package if provided
//     let packageDetails = null;
//     if (packageId) {
//       packageDetails = await Package.findById(packageId);
//       if (!packageDetails) {
//         return res.status(404).json({
//           success: false,
//           message: "Package not found"
//         });
//       }
//     }

//     // Handle location (accept single ID or array but use first location only)
//     let location = null;
//     if (Array.isArray(locationId) && locationId.length > 0) {
//       location = await Location.findById(locationId[0]);
//     } else {
//       location = await Location.findById(locationId);
//     }

//     if (!location) {
//       return res.status(404).json({
//         success: false,
//         message: "Location not found"
//       });
//     }

//     if (trainerId && !(await Staff.findById(trainerId))) {
//       return res.status(404).json({
//         success: false,
//         message: "Trainer not found"
//       });
//     }

//     // Get service names (for invoice only)
//     let serviceNames = [];
//     if (Array.isArray(serviceIds) && serviceIds.length > 0) {
//       const services = await ClassM.find({ _id: { $in: serviceIds } });
//       serviceNames = services.map((s) => s.name);
//     }

//     // Create bookings array for bulk creation
//     const bookingPromises = dates.map((date, index) =>
//       Booking.create({
//         package: packageId,
//         user: userId,
//         trainer: trainerId,
//         time: times[index],
//         duration,
//         dates: [date],
//         uuid,
//         location: location._id, // Use the single location ID
//         amount: amount / dates.length, // Split amount evenly across sessions
//         people,
//         class: [serviceIds[index]],
//       })
//     );

//     const createdBookings = await Promise.all(bookingPromises);
//     const bookingIds = createdBookings.map(booking => booking._id);

//     // Create payment
//     const newPayment = await PaymentM.create({
//       ...req.body,
//       package: packageId,
//       user: userId,
//       amount,
//       isPackage: !!packageId,
//     });

//     // Handle user package updates
//     let updatedUserPackage = null;

//     if (packageId) {
//       // Check if we're exceeding package limits
//       if (userPackageId) {
//         const userPackage = await UserPackagesM.findById(userPackageId);
//         if (!userPackage) {
//           return res.status(404).json({
//             success: false,
//             message: "User package not found"
//           });
//         }

//         if (userPackage.slots + dates.length > userPackage.totalSlots) {
//           return res.status(400).json({
//             success: false,
//             message: `Exceeds package limit of ${userPackage.totalSlots} sessions`
//           });
//         }

//         updatedUserPackage = await UserPackagesM.findByIdAndUpdate(
//           userPackageId,
//           {
//             $push: { bookings: { $each: bookingIds } },
//             $inc: { slots: dates.length },
//           },
//           { new: true, runValidators: true }
//         );
//       } else {
//         // Create new user package
//         updatedUserPackage = await UserPackagesM.create({
//           user: userId,
//           package: packageId,
//           bookings: bookingIds,
//           slots: dates.length,
//           price: amount,
//           partialAmount,
//           uuid: uuid || new Date().getTime().toString(),
//           totalSlots: packageDetails.days || 0,
//         });
//       }
//     }

//     // Send invoice
//     const bookingDetails = {
//       _id: newPayment._id,
//       className: serviceNames.join(", "),
//       location: location.name,
//       dates: dates?.map((date) => moment(date).format("MMM DD, YYYY")) || [],
//       isPackage: !!packageId,
//       totalAmount: amount,
//     };

//     const userDetails = {
//       name: user.name,
//       email: user.email,
//       phone: user.phone || "",
//     };

//     await sendInvoiceToUser(userDetails, bookingDetails);

//     return res.status(201).json({
//       success: true,
//       message: "Bookings created successfully",
//       data: {
//         bookings: createdBookings,
//         payment: newPayment,
//         updatedPackage: updatedUserPackage,
//       },
//     });
//   } catch (error) {
//     console.error("Error in createBookingForAdmin:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

const createBookingForAdmin = AsyncHandler(async (req, res) => {
  const {
    packageId,
    userId,
    trainerId,
    times,
    duration,
    dates,
    uuid,
    locationId,
    amount,
    partialAmount,
    people,
    userPackageId,
    serviceIds,
    paymentStatus = "paid",
  } = req.body;
  const earliestDate = dates.map((d) => new Date(d)).sort((a, b) => a - b)[0];

  if (!userId || !amount) {
    return res.status(400).json({
      success: false,
      message: "User and amount are required",
    });
  }

  // Validate that all required arrays exist and have the same length
  const requiredArrays = ["dates", "times", "serviceIds", "locationId"];
  for (const field of requiredArrays) {
    if (!req.body[field] || !Array.isArray(req.body[field])) {
      return res.status(400).json({
        success: false,
        message: `${field} must be an array`,
      });
    }
  }

  if (
    dates.length !== times.length ||
    dates.length !== serviceIds.length ||
    dates.length !== locationId.length
  ) {
    return res.status(400).json({
      success: false,
      message: `dates (${dates.length}), times (${times.length}), serviceIds (${serviceIds.length}), and locationId (${locationId.length}) must be arrays of equal length`,
    });
  }

  try {
    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate package if provided
    let packageDetails = null;
    if (packageId) {
      packageDetails = await Package.findById(packageId);
      if (!packageDetails) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }
    }

    // Validate all locations
    const uniqueLocationIds = [...new Set(locationId)];
    const locations = await Location.find({ _id: { $in: uniqueLocationIds } });

    if (locations.length !== uniqueLocationIds.length) {
      const foundIds = locations.map((loc) => loc._id.toString());
      const missingIds = uniqueLocationIds.filter(
        (id) => !foundIds.includes(id),
      );

      return res.status(404).json({
        success: false,
        message: `Some locations not found: ${missingIds.join(", ")}`,
      });
    }

    // Create location map for easy lookup
    const locationMap = {};
    locations.forEach((loc) => {
      locationMap[loc._id.toString()] = loc;
    });

    // Validate all services
    const uniqueServiceIds = [...new Set(serviceIds)];
    const services = await ClassM.find({ _id: { $in: uniqueServiceIds } });

    if (services.length !== uniqueServiceIds.length) {
      const foundIds = services.map((service) => service._id.toString());
      const missingIds = uniqueServiceIds.filter(
        (id) => !foundIds.includes(id),
      );

      return res.status(404).json({
        success: false,
        message: `Some services not found: ${missingIds.join(", ")}`,
      });
    }

    // Create service map for easy lookup
    const serviceMap = {};
    services.forEach((service) => {
      serviceMap[service._id.toString()] = service;
    });

    // Validate trainer if provided
    if (trainerId) {
      const trainer = await Staff.findById(trainerId);
      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: "Trainer not found",
        });
      }
    }

    // Calculate amount per booking
    const amountPerBooking = amount / dates.length;

    // Create bookings one by one to better handle errors
    const createdBookings = [];

    for (let i = 0; i < dates.length; i++) {
      try {
        const location = locationMap[locationId[i]];
        const service = serviceMap[serviceIds[i]];

        if (!location) {
          throw new Error(`Location not found for ID: ${locationId[i]}`);
        }

        if (!service) {
          throw new Error(`Service not found for ID: ${serviceIds[i]}`);
        }

        const bookingData = {
          package: packageId,
          user: userId,
          trainer: trainerId,
          time: times[i],
          duration: duration || 60,
          date: dates[i],
          dates: [dates[i]],
          uuid: uuid || `${userId}-${Date.now()}-${i}`,
          location: location._id,
          amount: amountPerBooking,
          people: people || 1,
          class: [serviceIds[i]],
          status: "confirmed",
          paymentStatus: "paid",
          isBookedByAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log(`Creating booking ${i + 1}/${dates.length}:`, {
          date: dates[i],
          time: times[i],
          location: location.name,
          service: service.name,
        });

        const booking = await Booking.create(bookingData);
        createdBookings.push(booking);
      } catch (bookingError) {
        console.error(`Error creating booking ${i + 1}:`, bookingError);
        // Continue with other bookings but note the error
      }
    }

    if (createdBookings.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to create any bookings",
      });
    }

    const bookingIds = createdBookings.map((booking) => booking._id);

    // Create payment
    const newPayment = await PaymentM.create({
      user: userId,
      package: packageId,
      amount,
      partialAmount: partialAmount || amount,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "admin",
      transactionId: uuid || `admin-${Date.now()}`,
      isPackage: !!packageId,
      bookings: bookingIds,
      createdAt: new Date(),
    });

    // Handle user package updates
    let updatedUserPackage = null;

    if (packageId) {
      if (userPackageId) {
        // Update existing user package
        const userPackage = await UserPackagesM.findById(userPackageId)
          .populate("package")
          .populate("bookings");
        if (!userPackage) {
          console.log("User package not found, creating a new one");
        } else {
          const expiry = getEffectivePackageExpiry(userPackage);
          if (expiry) {
            const now = moment();
            if (now.isAfter(expiry)) {
              return res.status(400).json({
                success: false,
                message: `Package expired on ${expiry.format("DD-MM-YYYY")}. Cannot add new bookings.`,
              });
            }
            if (dates && Array.isArray(dates)) {
              for (const d of dates) {
                if (moment(d).endOf("day").isAfter(expiry)) {
                  return res.status(400).json({
                    success: false,
                    message: `Requested class date (${moment(d).format("DD-MM-YYYY")}) is outside package validity period (expires ${expiry.format("DD-MM-YYYY")}).`,
                  });
                }
              }
            }
          }

          if (userPackage.slots + dates.length > userPackage.totalSlots) {
            return res.status(400).json({
              success: false,
              message: `Exceeds package limit of ${userPackage.totalSlots} sessions`,
            });
          }

          updatedUserPackage = await UserPackagesM.findByIdAndUpdate(
            userPackageId,
            {
              $push: { bookings: { $each: bookingIds } },
              $inc: { slots: dates.length },
              $set: { updatedAt: new Date() },
              $set: { paymentStatus: "paid" },
              $set: { isBookedByAdmin: true },
            },
            { new: true, runValidators: true },
          );
        }
      }

      // If no userPackageId or it wasn't found, create a new user package
      if (!updatedUserPackage) {
        updatedUserPackage = await UserPackagesM.create({
          user: userId,
          package: packageId,
          bookings: bookingIds,
          slots: dates.length,
          price: amount,
          partialAmount: partialAmount || amount,
          uuid: uuid || `pkg-${Date.now()}`,
          totalSlots: packageDetails?.days || dates.length,
          status: "active",
          paymentStatus: "paid",
          isBookedByAdmin: true,
          createdAt: earliestDate,
          updatedAt: new Date(),
        });
      }
    }

    // Prepare detailed booking information for the invoice
    const bookingDetails = {
      paymentId: newPayment._id,
      packageName: packageDetails?.name || "Custom Package",
      classes: createdBookings.map((booking, index) => {
        const location = locationMap[locationId[index]];
        const service = serviceMap[serviceIds[index]];

        return {
          name: service?.name || "Unknown Service",
          date: moment(dates[index]).format("MMM DD, YYYY"),
          time: times[index],
          location: location?.name || "Unknown Location",
          duration: duration || 60,
        };
      }),
      isPackage: !!packageId,
      totalAmount: amount,
      bookingDate: moment().format("MMM DD, YYYY"),
    };

    const userDetails = {
      name: user.name,
      email: user.email,
      phone: user.phone || "Not provided",
    };

    // Send email (don't block response if it fails)
    try {
      await sendInvoiceToUser(userDetails, bookingDetails);
      console.log("Invoice email sent successfully");
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully created ${createdBookings.length} out of ${dates.length} bookings`,
      data: {
        bookings: createdBookings,
        payment: newPayment,
        userPackage: updatedUserPackage,
      },
    });
  } catch (error) {
    console.error("Error in createBookingForAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

const updateUserPackagePartialAmount = AsyncHandler(async (req, res) => {
  const { userPackageId, paymentAmount } = req.body;

  if (!userPackageId || !paymentAmount) {
    return res
      .status(400)
      .json({ message: "User Package ID and payment amount are required" });
  }

  const userPackage = await UserPackagesM.findById(userPackageId);

  if (!userPackage) {
    return res.status(404).json({ message: "User Package not found" });
  }

  // Ensure partialAmount exists (initialize to 0 if undefined)
  let currentPartial = userPackage.partialAmount || 0;

  // Calculate the remaining balance using price field
  const remaining = userPackage.price - currentPartial;

  // Prevent overpayment
  if (paymentAmount > remaining) {
    return res.status(400).json({
      message: `Payment exceeds remaining balance. Remaining: ₹${remaining}`,
    });
  }

  // Calculate new partial amount
  const updatedPartial = currentPartial + paymentAmount;

  // Update user package
  userPackage.partialAmount = updatedPartial;
  await userPackage.save();

  return res.status(200).json({
    message: "Partial payment updated successfully",
    userPackage,
  });
});

const updateBookingPartialAmount = AsyncHandler(async (req, res) => {
  const { bookingId, paymentAmount } = req.body;

  if (!bookingId || !paymentAmount) {
    return res
      .status(400)
      .json({ message: "Booking ID and payment amount are required" });
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  // Ensure partialAmount exists (fallback to total amount if needed)
  let currentPartial = booking.partialAmount ?? booking.amount;

  // Calculate the remaining balance
  const remaining = booking.amount - currentPartial;

  // Prevent overpayment
  if (paymentAmount > remaining) {
    return res.status(400).json({
      message: `Payment exceeds remaining balance. Remaining: ₹${remaining}`,
    });
  }

  // Calculate new partial amount
  const updatedPartial = currentPartial + paymentAmount;

  // Update booking
  booking.partialAmount = updatedPartial;
  await booking.save();

  return res.status(200).json({
    message: "Partial payment updated successfully",
    booking,
  });
});

const createMultipleBookings = AsyncHandler(async (req, res) => {
  const { bookings, uPackageId, paymentStatus = "paid" } = req.body;
  console.log("Data received from frontend: ", req.body);

  console.log(bookings, "airbound app", uPackageId);
  if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid bookings array",
    });
  }

  try {
    // Fetch the user package to get the correct package definition ID and UUID as fallback
    const userPackage = await UserPackagesM.findById(uPackageId)
      .populate('package')
      .populate('bookings');

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: "User package not found",
      });
    }

    // ✅ Check package expiry date
    const expiry = getEffectivePackageExpiry(userPackage);
    if (expiry) {
      const now = moment();
      if (now.isAfter(expiry)) {
        return res.status(400).json({
          success: false,
          message: `Your package expired on ${expiry.format("DD-MM-YYYY")}. You cannot book new sessions on an expired package.`,
        });
      }

      for (const book of bookings) {
        const rawDate = book.date || (Array.isArray(book.dates) ? book.dates[0] : null);
        if (rawDate) {
          const requestedDate = moment(rawDate).endOf("day");
          if (requestedDate.isAfter(expiry)) {
            return res.status(400).json({
              success: false,
              message: `Requested class date (${moment(rawDate).format("DD-MM-YYYY")}) is outside your package validity period (expires ${expiry.format("DD-MM-YYYY")}).`,
            });
          }
        }
      }
    }

    if (userPackage.slots + bookings.length > userPackage.totalSlots) {
      return res.status(400).json({
        success: false,
        message: `Exceeds package limit of ${userPackage.totalSlots} sessions. Remaining slots: ${userPackage.totalSlots - userPackage.slots}`,
      });
    }

    // Use Promise.all to create bookings in parallel
    const bookingPromises = bookings.map(book => {
      // Data integrity: Aggressively ensure we use the correct package definition ID and UUID from the UserPackage
      const packageToUse =
        userPackage?.package?._id ||
        (book.package && mongoose.Types.ObjectId.isValid(book.package)
          ? book.package
          : null);

      const uuidToUse =
        userPackage?.uuid || (book.uuid !== 'undefined' ? book.uuid : null);

      return Booking.create({
        user: book.user,
        dates: book.dates,
        location: book?.location?._id,
        time: book.time,
        duration: book.duration,
        trainer: book.trainer,
        amount: book.amount,
        people: book.people,
        paymentStatus: 'paid',
        class: book.classId,
        package: packageToUse,
        uuid: uuidToUse,
      });
    });

    const createdBookings = await Promise.all(bookingPromises);

    // Get all booking IDs
    const bookingIds = createdBookings.map((booking) => booking._id);

    // Update user package once with all booking IDs
    const updateUserPackage = await UserPackagesM.findByIdAndUpdate(
      uPackageId,
      {
        $push: { bookings: { $each: bookingIds } },
        $inc: { slots: bookings.length },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updateUserPackage) {
      // If package update fails, delete the created bookings
      await Booking.deleteMany({ _id: { $in: bookingIds } });
      return res.status(404).json({
        success: false,
        message: "User package not found",
      });
    }
    try {
      // Get user details (assuming you have access to user ID from the first booking)
      const userId = bookings[0]?.user;
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          // Send email with booking confirmations
          await sendMultipleBookingsEmail(user, bookings);
        }
      }
    } catch (emailError) {
      console.error("Error sending booking confirmation email:", emailError);
      // Don't fail the entire request if email fails
    }

    return res.status(201).json({
      success: true,
      message: "Bookings created successfully",
      data: {
        bookings: createdBookings,
        updatedPackage: updateUserPackage,
      },
    });
  } catch (error) {
    // If any operation fails, ensure we clean up any created bookings
    if (error.bookingIds) {
      await Booking.deleteMany({ _id: { $in: error.bookingIds } });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating bookings",
      error: error.message,
    });
  }
});

const createMultipleBookingsAdmin = AsyncHandler(async (req, res) => {
  const { bookings, uPackageId, paymentStatus = "paid" } = req.body;

  if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid bookings array",
    });
  }

  try {
    console.log(
      "Received bookings payload:",
      JSON.stringify(req.body, null, 2),
    );

    const userPackage = await UserPackagesM.findById(uPackageId)
      .populate('package')
      .populate('bookings');
    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: "User package not found",
      });
    }

    // ✅ Check package expiry date
    const expiry = getEffectivePackageExpiry(userPackage);
    if (expiry) {
      const now = moment();
      if (now.isAfter(expiry)) {
        return res.status(400).json({
          success: false,
          message: `User's package expired on ${expiry.format("DD-MM-YYYY")}. Cannot add new bookings.`,
        });
      }

      for (const book of bookings) {
        const rawDate = book.date || (Array.isArray(book.dates) ? book.dates[0] : null);
        if (rawDate) {
          const requestedDate = moment(rawDate).endOf("day");
          if (requestedDate.isAfter(expiry)) {
            return res.status(400).json({
              success: false,
              message: `Requested class date (${moment(rawDate).format("DD-MM-YYYY")}) is outside package validity period (expires ${expiry.format("DD-MM-YYYY")}).`,
            });
          }
        }
      }
    }

    if (userPackage.slots + bookings.length > userPackage.totalSlots) {
      return res.status(400).json({
        success: false,
        message: `Exceeds package limit of ${userPackage.totalSlots} sessions. Remaining slots: ${userPackage.totalSlots - userPackage.slots}`,
      });
    }

    // Use Promise.all to create bookings in parallel
    const bookingPromises = bookings.map((book) => {
      const bookingData = {
        user: book.user,
        dates: book.dates,
        location: book.location,
        time: book.time,
        duration: book.duration,
        amount: book.amount,
        people: book.people,
        class: book.classId,
        paymentStatus: "paid",
        package: book.package,
        uuid: book.uuid,
        isBookedByAdmin: true,
      };

      // Only add trainer if it's a valid ObjectId, otherwise omit it
      if (book.trainer && book.trainer !== "" && book.trainer !== null) {
        bookingData.trainer = book.trainer;
      }

      console.log("Creating booking with data:", bookingData); // Add this debug log
      return Booking.create(bookingData);
    });

    const createdBookings = await Promise.all(bookingPromises);

    // Get all booking IDs
    const bookingIds = createdBookings.map((booking) => booking._id);
    console.log("Created booking IDs:", bookingIds);

    // Update user package - INCREMENT slots (used slots) instead of decrementing remainingSlots
    const updateUserPackage = await UserPackagesM.findByIdAndUpdate(
      uPackageId,
      {
        $push: { bookings: { $each: bookingIds } },
        $inc: { slots: bookings.length }, // INCREMENT slots (used slots)
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updateUserPackage) {
      // If package update fails, delete the created bookings
      await Booking.deleteMany({ _id: { $in: bookingIds } });
      return res.status(404).json({
        success: false,
        message: "User package not found",
      });
    }

    console.log("Updated user package:", updateUserPackage);

    return res.status(201).json({
      success: true,
      message: "Bookings created successfully",
      data: {
        bookings: createdBookings,
        updatedPackage: updateUserPackage,
      },
    });
  } catch (error) {
    console.error("Error creating bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating bookings",
      error: error.message,
    });
  }
});

const getTotalAmount = AsyncHandler(async (req, res) => {
  try {
    // Fetch all bookings
    const bookings = await PaymentM.find({ paymentStatus: "paid" });

    // If bookings are empty
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found",
        data: 0,
      });
    }

    // Calculate total amount by summing up the 'amount' field
    const totalAmount = bookings.reduce(
      (sum, booking) => sum + (booking?.amount || 0),
      0,
    );

    // Respond with total amount
    res.status(200).json({
      success: true,
      message: "Total amount fetched successfully",
      data: totalAmount,
    });
  } catch (error) {
    // Catch any errors and send the error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get a booking by ID
const getBookingById = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide an ID");

  const booking = await Booking.findOne({
    _id: id,
    paymentStatus: "paid",
  }).populate("class user", "name title");

  if (!booking) throw new Error("Booking not found with this ID");

  res.status(200).json({
    success: true,
    message: "Booking fetched successfully",
    data: booking,
  });
});

// Update a booking by ID
const updateBooking = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide an ID");

  const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("class user", "name title");

  if (!updatedBooking) throw new Error("Booking not found with this ID");

  res.status(200).json({
    success: true,
    message: "Booking updated successfully",
    data: updatedBooking,
  });
});

const sendNotificationToUsers = AsyncHandler(async (req, res) => {
  const { ids, dates, users, class: classBody } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(300).json({ message: "Please provide an array of IDs." });
  }

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return res
      .status(300)
      .json({ message: "Please provide new dates for rescheduling." });
  }

  if (!users || !Array.isArray(users) || users.length === 0) {
    return res
      .status(300)
      .json({ message: "Please provide an array of users." });
  }

  await Booking.updateMany({ _id: { $in: ids } }, { $set: { dates } });

  const sendEmailsPromises = users.map((u) =>
    sendRescheduleEmailToUser(u, dates, classBody),
  );

  await Promise.all(sendEmailsPromises);

  res.status(200).json({
    success: true,
    message:
      "Bookings updated and emails sent to all users about the new dates.",
  });
});

const deleteBooking = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Booking ID" });
  }

  const booking = await Booking.findByIdAndDelete(id);

  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  }

  res.status(200).json({
    success: true,
    message:
      "Booking deleted successfully and reference removed from UserPackage",
    data: booking,
  });
});

const getBookingsByUser = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide an ID");

  try {
    const bookings = await Booking.find({ user: id, paymentStatus: "paid" })
      .populate("trainer")
      .populate("class")
      .populate("package")
      .populate("location")
      .populate("user");

    // Fix for missing package names: Multi-stage recovery logic
    const recoveredBookings = await Promise.all(
      bookings.map(async (booking) => {
        let bookingObj = booking.toObject();

        // Recovery logic: If package population failed
        if (!bookingObj.package) {
          // Stage 1: Check if the package field itself contains a UserPackage ID (the root cause)
          const rawBooking = await Booking.findById(bookingObj._id).select(
            "package",
          );
          if (rawBooking && rawBooking.package) {
            const userPack = await UserPackagesM.findById(
              rawBooking.package,
            ).populate("package");
            if (userPack && userPack.package) {
              bookingObj.package = userPack.package;
            }
          }

          // Stage 2: If still null, try reverse lookup in UserPackages bookings array
          if (!bookingObj.package) {
            const recoveredUserPackage = await UserPackagesM.findOne({
              bookings: bookingObj._id,
            }).populate("package");

            if (recoveredUserPackage && recoveredUserPackage.package) {
              bookingObj.package = recoveredUserPackage.package;
            }
          }

          if (bookingObj.package) {
            console.log(
              `Recovered package name for booking ${bookingObj._id}: ${bookingObj.package.name}`,
            );
          }
        }
        return bookingObj;
      }),
    );

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: recoveredBookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(300).json({ message: "something went wrong" });
  }
});

// const getAllLastBookingDates = AsyncHandler(async (req, res) => {
//   try {
//     // Fetch all bookings with populated fields
//     const bookings = await Booking.find()
//       .populate("trainer")
//       .populate("class")
//       .populate("user");

//     if (!bookings.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No bookings found",
//       });
//     }
//     const userBookingDates = {};

//     bookings.forEach((booking) => {
//       const userId = booking.user._id.toString();
//       const mostRecentDate = new Date(Math.max(...booking.dates.map(date => new Date(date))));
//       if (!userBookingDates[userId] || mostRecentDate > userBookingDates[userId].date) {
//         userBookingDates[userId] = {
//           date: mostRecentDate,
//           email: booking.user.email,
//         };
//       }
//     });
//     const result = Object.keys(userBookingDates).map((userId) => ({
//       userId,
//       email: userBookingDates[userId].email,
//       lastBookingDate: userBookingDates[userId].date,
//     }));

//     res.status(200).json({
//       success: true,
//       message: "Last booking dates for all users fetched successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching last booking dates for all users",
//     });
//   }
// });

// Function to fetch last booking dates and send emails
const sendExpiringBookingEmails = async () => {
  try {
    console.log("Running Cron Job: Checking expiring bookings...");

    const bookings = await Booking.find()
      .populate("trainer")
      .populate("class")
      .populate("user");

    if (!bookings.length) {
      console.log("No bookings found");
      return;
    }

    const userBookingDates = {};

    bookings.forEach((booking) => {
      const userId = booking.user._id.toString();

      const mostRecentDate = new Date(
        Math.max(...booking.dates.map((date) => new Date(date))),
      );

      if (
        !userBookingDates[userId] ||
        mostRecentDate > userBookingDates[userId].date
      ) {
        userBookingDates[userId] = {
          date: mostRecentDate,
          email: booking.user.email,
          name: booking.user.name,
          className: booking.class.name,
          trainerName: booking.trainer.name,
        };
      }
    });

    const today = new Date();
    const expiringSoonUsers = Object.values(userBookingDates).filter((user) => {
      const expiryDate = new Date(user.date);
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysLeft === 4;
    });

    if (expiringSoonUsers.length === 0) {
      console.log("No bookings expiring in 4 days");
      return;
    }

    const emailsSent = await Promise.all(
      expiringSoonUsers.map(async (user) => {
        const msg = {
          to: user.email,
          from: "airboundfitness@gmail.com",
          subject: "Your Class is Expiring Soon - Please Renew!",
          text: `Hello ${user.name},\n\nYour class (${user.className}) with trainer ${user.trainerName} is expiring soon.\nPlease renew before your session ends!\n\nThank you!`,
          html: `<p>Hello <strong>${user.name}</strong>,</p>
                <p>Your class <strong>${user.className}</strong> with trainer <strong>${user.trainerName}</strong> is expiring in <strong>4 days</strong>.</p>
                <p>Please renew before your session ends!</p>
                <p>Thank you!</p>`,
        };

        return sgMail.send(msg);
      }),
    );

    console.log(`Emails sent to ${emailsSent.length} users.`);
  } catch (error) {
    console.error("Error sending booking expiry emails:", error);
  }
};

// Schedule the cron job to run every day at 8 AM
cron.schedule(
  "0 8 * * *",
  async () => {
    await sendExpiringBookingEmails();
  },
  {
    timezone: "Asia/Kolkata",
  },
);

console.log("Cron job scheduled to run every day at 8 AM...");

const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// GET /api/bookings/available-slots
const availableSlots = AsyncHandler(async (req, res) => {
  try {
    const {
      bookingId, // Current booking ID for rescheduling
      startDate, // Starting date to check availability
      endDate, // Ending date to check availability
    } = req.query;

    // Get current booking details
    const booking = await Booking.findById(bookingId)
      .populate("class")
      .populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ✅ Check package expiry
    const userPackage = await UserPackagesM.findOne({ bookings: bookingId })
      .populate('package')
      .populate('bookings');
    let effectiveExpiry = null;
    if (userPackage) {
      const expiryMoment = getEffectivePackageExpiry(userPackage);
      if (expiryMoment) {
        effectiveExpiry = expiryMoment.toDate();
        const now = moment();

        if (now.isAfter(expiryMoment)) {
          return res.status(400).json({
            success: false,
            message:
              "Your package has expired. You cannot reschedule this booking.",
          });
        }
      }
    }

    // Get all dates between start and end
    const datesToCheck = getDatesBetween(
      new Date(startDate),
      new Date(endDate),
    );

    // Get all bookings for this class in the date range
    const existingBookings = await Booking.find({
      class: booking.class._id,
      dates: {
        $elemMatch: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
      time: booking.time,
    });

    // Calculate available slots
    const availableSlots = datesToCheck.map((date) => {
      // Check if it's an available weekday
      const isAvailableDay = booking.class.availability.includes(date.getDay());

      // Count bookings for this date
      const bookingsOnDate = existingBookings.filter(
        (b) => b.dates[0].toDateString() === date.toDateString(),
      ).length;

      // Check if slot is at least 3 hours away
      const slotDateTime = new Date(date);
      const bookingTime = Array.isArray(booking.time) ? booking.time[0] : booking.time;
      const [hours, minutes] = bookingTime.split(":");
      slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

      const threeHoursFromNow = new Date();
      threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);

      // Calculate if slot is available
      const isAvailable =
        isAvailableDay &&
        bookingsOnDate < booking.class.maxPeople &&
        slotDateTime > threeHoursFromNow &&
        (!effectiveExpiry || slotDateTime <= moment(effectiveExpiry).endOf("day"));

      return {
        date: date.toISOString(),
        available: isAvailable,
        remainingSlots: booking.class.maxPeople - bookingsOnDate,
      };
    });

    res.json({
      bookingDetails: {
        packageDuration: booking.pacakge.duration,
        time: booking.time,
        originalDate: booking.dates[0],
      },
      availableSlots,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Error fetching available slots" });
  }
});

// const reschedule = AsyncHandler(async (req, res) => {
//   try {
//     const { newDate, date } = req.body;
//     const { id } = req.params;

//     const booking = await Booking.aggregate([
//       {
//         $match: { _id: new mongoose.Types.ObjectId(id) },
//       },
//       {
//         $lookup: {
//           from: "classes",
//           localField: "class",
//           foreignField: "_id",
//           as: "classDetails",
//         },
//       },
//       {
//         $unwind: "$classDetails",
//       },
//     ]);

//     if (!booking || booking.length === 0) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const bookingData = booking[0];
//     const formattedDate = new Date(date).toISOString();

//     // Ensure the date exists in the booking
//     const index = bookingData.dates.findIndex(
//       (d) => new Date(d).toISOString() === formattedDate
//     );

//     if (index === -1) {
//       return res
//         .status(400)
//         .json({ message: "Original date not found in booking" });
//     }

//     // Update the date
//     bookingData.dates.splice(index, 1, new Date(newDate));
//     await Booking.findByIdAndUpdate(
//       id,
//       { ...req.body, dates: bookingData.dates },
//       { new: true }
//     );

//     const user = await User.findById(bookingData.user).select("name email");
//     if (user && user.email) {
//       const emailContent = `
//         <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
//           <div style="background-color: #4a148cff; color: white; padding: 20px; text-align: center; font-size: 24px;">
//             <strong>Booking Rescheduled Successfully</strong>
//           </div>
//           <p style="font-size: 16px; color: #555; text-align: center; margin-top: 20px;">
//             Hello ${user.name},
//           </p>
//           <p style="font-size: 16px; color: #555; text-align: center;">
//             Your booking for the class <strong>${
//               bookingData.classDetails.name
//             }</strong> has been successfully rescheduled.
//           </p>
//           <p style="font-size: 16px; color: #555; text-align: center;">
//             <strong>New Date:</strong> ${new Date(newDate).toDateString()}
//           </p>
//           <p style="font-size: 16px; color: #555; text-align: center; margin-top: 20px;">
//             Thank you for choosing our services!
//           </p>
//         </div>
//       `;

//       try {
//         const response = await sgMail.send({
//           to: user.email,
//           from: "airboundfitness@gmail.com",
//           subject: "Booking Rescheduled Successfully",
//           html: emailContent,
//         });

//         console.log("Email sent successfully:", response);
//       } catch (emailError) {
//         console.error(
//           "Failed to send email:",
//           emailError.response?.body || emailError.message
//         );

//         if (emailError.response?.body?.errors) {
//           emailError.response.body.errors.forEach((error) => {
//             console.error("Email error detail:", error);
//           });
//         }
//       }
//     }

//     res.json({
//       message: "Booking rescheduled successfully",
//       booking: bookingData,
//     });
//   } catch (error) {
//     console.error("Error in reschedule function:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// });

const reschedule = AsyncHandler(async (req, res) => {
  try {
    const { newDate, date, time } = req.body;
    const { id } = req.params;

    // ✅ Check package expiry
    const userPackage = await UserPackagesM.findOne({ bookings: id })
      .populate('package')
      .populate('bookings');
    if (userPackage) {
      const expiry = getEffectivePackageExpiry(userPackage);
      if (expiry) {
        const now = moment();

        // Check if package is already expired
        if (now.isAfter(expiry)) {
          return res.status(400).json({
            success: false,
            message:
              "Your package has expired. You cannot reschedule this booking.",
          });
        }

        // Check if the new requested date is within validity
        const requestedDate = moment(newDate).endOf("day");
        if (requestedDate.isAfter(expiry)) {
          return res.status(400).json({
            success: false,
            message: `The requested reschedule date (${moment(newDate).format("DD-MM-YYYY")}) is outside your package validity period (expires ${expiry.format("DD-MM-YYYY")}).`,
          });
        }
      }
    }

    console.log("Reschedule request body:", req.body);
    const booking = await Booking.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "classes",
          localField: "class",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      { $unwind: "$classDetails" },
      {
        $lookup: {
          from: "locations",
          localField: "location",
          foreignField: "_id",
          as: "locationDetails",
        },
      },
    ]);

    if (!booking || booking.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bookingData = booking[0];
    const formattedDate = new Date(date).toISOString();

    const index = bookingData.dates.findIndex(
      (d) => new Date(d).toISOString() === formattedDate,
    );

    if (index === -1) {
      return res
        .status(400)
        .json({ message: "Original date not found in booking" });
    }

    if (!newDate || !time) {
      return res.status(400).json({ message: "New date and time are required for rescheduling" });
    }

    const isUserAdmin = req.user && req.user.constructor.modelName === "Admin";

    if (!isUserAdmin) {
      // Check if the original booking is less than 3 hours away
      const originalDate = bookingData.dates[index];
      const originalTime = bookingData.time[index] || bookingData.time[0];
      if (!originalTime) {
        return res.status(400).json({ message: "Original time not found in booking" });
      }

      const originalDateTime = moment(
        `${moment(originalDate).format("YYYY-MM-DD")} ${originalTime}`,
        "YYYY-MM-DD HH:mm"
      );

      const now = moment();
      if (originalDateTime.diff(now, "minutes") < 180) {
        return res.status(400).json({
          message: "Cannot reschedule booking within 3 hours of class time. Reschedule window closed."
        });
      }

      const newDateTime = moment(
        `${moment(newDate).format("YYYY-MM-DD")} ${time}`,
        "YYYY-MM-DD HH:mm"
      );

      if (newDateTime.diff(now, "minutes") < 180) {
        return res.status(400).json({
          message: "The new rescheduled class must be at least 3 hours in the future from now."
        });
      }
    }

    // Update the date
    bookingData.dates.splice(index, 1, new Date(newDate));
    await Booking.findByIdAndUpdate(
      id,
      { ...req.body, dates: bookingData.dates },
      { new: true },
    );

    // Get user info
    const user = await User.findById(bookingData.user).select(
      "name email phone deviceToken",
    );

    let locationName = "TBD";
    if (bookingData.locationDetails && bookingData.locationDetails.length > 0) {
      locationName = bookingData.locationDetails[0].name;
    }

    // ✅ Create proper DateTime with req.body.time
    const [hours, minutes] = time.split(":").map(Number);
    const dateWithTime = new Date(newDate);
    dateWithTime.setHours(hours, minutes, 0, 0);

    // ✅ Send reschedule email (with proper date & time)
    if (user && user.email) {
      try {
        await sendEmailToUser(
          {
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          [dateWithTime], // Use combined date+time
          {
            name: bookingData.classDetails.name,
            location: locationName,
          },
        );
        console.log("Reschedule email sent successfully");
      } catch (emailError) {
        console.error("Failed to send reschedule email:", emailError.message);
      }
    }

    // ✅ Push notification (using same corrected time)
    if (user && user.deviceToken) {
      const formattedDate = dateWithTime.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const formattedTime = dateWithTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const message = {
        notification: {
          title: "Booking Rescheduled",
          body: `Your class "${bookingData.classDetails.name}" has been rescheduled to ${formattedDate} at ${formattedTime} at ${locationName}.`,
        },
        token: user.deviceToken,
      };

      try {
        const response = await admin.messaging().send(message);
        console.log("Push notification sent:", response);
      } catch (fcmError) {
        console.error("Failed to send push notification:", fcmError.message);
        if (
          fcmError.code === "messaging/mismatched-credential" ||
          fcmError.code === "messaging/invalid-registration-token" ||
          fcmError.code === "messaging/registration-token-not-registered"
        ) {
          await User.findByIdAndUpdate(user._id, { $unset: { deviceToken: 1 } });
        }
      }
    }

    res.json({
      message: "Booking rescheduled successfully",
      booking: bookingData,
    });
  } catch (error) {
    console.error("Error in reschedule function:", error.message);
    res.status(500).json({ message: error.message });
  }
});

const showAvailability = async (req, res) => {
  try {
    const { classId, date } = req.body;
    const IST_OFFSET_MINUTES = 330; // Asia/Kolkata (UTC+5:30)

    // Validate input
    if (!classId || !date) {
      return res
        .status(400)
        .json({ message: "classId and date are required." });
    }

    const requestedDate = moment(date, "DD-MM-YYYY", true).utcOffset(
      IST_OFFSET_MINUTES,
      true,
    );
    if (!requestedDate.isValid()) {
      return res
        .status(400)
        .json({ message: 'Invalid date format. Use "DD-MM-YYYY".' });
    }

    // Fetch class details
    const classes = await Class.findById(classId)
      .populate({
        path: "availability",
        populate: [
          { path: "trainers", model: "Staff" },
          { path: "locations", model: "Location" },
        ],
      })
      .lean();
    if (!classes) {
      return res.status(404).json({ message: "Class not found." });
    }

    // Get current time in IST
    const currentTime = moment().utcOffset(IST_OFFSET_MINUTES); // UTC+5:30 for IST

    // Get availability slots for the given day
    const availabilityList = Array.isArray(classes.availability)
      ? classes.availability
      : [];

    const day = requestedDate.day(); // JS-style: Sunday=0 ... Saturday=6
    const acceptableDays = new Set([
      day, // Sunday=0 mapping
      (day + 6) % 7, // Monday=0 mapping (Mon=0..Sun=6)
      day === 0 ? 7 : day, // Sunday=7 mapping (Mon=1..Sun=7)
    ]);

    const todayInIst = requestedDate.isSame(currentTime, "day");
    const minHoursAheadRaw = req.body?.minHoursAhead;
    const minHoursAhead =
      typeof minHoursAheadRaw === "number" && Number.isFinite(minHoursAheadRaw)
        ? Math.max(0, minHoursAheadRaw)
        : 0;

    const daySlots = availabilityList.filter((slot) => {
      if (!slot) return false;
      if (!acceptableDays.has(Number(slot.day))) return false;

      // If it's not today (in IST), include all slots for that weekday.
      if (!todayInIst) return true;
      if (minHoursAhead === 0) return true;

      // For today, optionally include slots that are at least N hours ahead (in IST).
      const slotTime = parseSlotDateTime(date, slot.time, IST_OFFSET_MINUTES);
      if (!slotTime.isValid()) {
        console.warn("Invalid slot time format:", {
          classId,
          date,
          slotTime: slot.time,
        });
        // Fall back to including the slot rather than hiding all availability.
        return true;
      }

      const hoursDifference = slotTime.diff(currentTime, "hours", true);
      return hoursDifference >= minHoursAhead;
    });

    // Fetch bookings for the class on the given date
    const bookings = await Booking.find({ class: classId });
    const formattedBookings = bookings.filter((booking) =>
      booking.dates.some((dbDate) => {
        const adjustedDate = moment(dbDate).utcOffset(330).format("DD-MM-YYYY"); // Adjusting to IST
        return adjustedDate === date;
      }),
    );

    // Update the slots with the current number of people booked
    const updatedSlots = daySlots?.map((slot) => {
      let count = 0;
      const slotBookings = formattedBookings?.filter((booking) => {
        count += booking?.people;
        return booking.time === slot?.time;
      });
      return {
        day: slot?.day,
        time: slot?.time,
        duration: slot?.duration,
        maxPeople: slot?.maxPeople,
        locations: slot?.locations,
        trainers: slot?.trainers,
        _id: slot?.trainers,
        people: count,
      };
    });

    res.status(200).json({
      available: updatedSlots.length > 0,
      slots: updatedSlots,
    });
  } catch (error) {
    console.error("Error showing availability:", error);
    res.status(500).json({ message: "An error occurred." });
  }
};

export {
  sendNotificationToUsers,
  createBookingForAdmin,
  getAllBookingsdatesadmin,
  updateBookingPartialAmount,
  getTotalAmount,
  createBooking,
  getAllBookings,
  getBookingById,
  getAllBookingsdates,
  createMultipleBookings,
  createMultipleBookingsAdmin,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
  reschedule,
  availableSlots,
  showAvailability,
  updateUserPackagePartialAmount,
};
