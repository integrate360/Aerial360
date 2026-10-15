import UserPackagesM from "../models/userPackageModel.js";
import UserPackage from "../models/userPackageModel.js";
import Payment from "../models/paymentModel.js";
import Booking from "../models/bookingModel.js";
import moment from "moment";
import Class from "../models/classModel.js";
import mongoose from "mongoose";

// Get all bachelorette events
// const getAllPackages = async (req, res) => {
//   try {
//     const bachelorettes = await UserPackagesM.find()
//     .populate("package")
//     .populate("bookings")
//     .populate("user");
//     res.status(200).json({ success: true, data: bachelorettes });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
const getAllPackages = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;

    const limit =
      req.query.all === "true" || req.query.limit === "0"
        ? 0
        : parseInt(req.query.limit, 10) || 10;

    const skip = (page - 1) * (limit > 0 ? limit : 10);

    const search = req.query.search
      ? req.query.search.trim().toLowerCase()
      : "";

    const statusFilter = req.query.status
      ? req.query.status.trim().toLowerCase()
      : "";

    const packageFilter = req.query.packageId
      ? req.query.packageId.trim()
      : "";

    // Only get packages where paymentStatus is "paid"
    const query = {
      paymentStatus: "paid",
    };

    if (
      packageFilter &&
      mongoose.Types.ObjectId.isValid(packageFilter)
    ) {
      query.package = packageFilter;
    }

    const isDefaultQuery =
      !search &&
      (!statusFilter || statusFilter === "all");

    let bachelorettes = [];
    let total = 0;

    // =========================================================
    // DEFAULT QUERY
    // =========================================================
    if (isDefaultQuery) {
      total = await UserPackagesM.countDocuments(query);

      let dbQuery = UserPackagesM.find(query)
        .sort({ createdAt: -1 });

      if (limit > 0) {
        dbQuery = dbQuery
          .skip(skip)
          .limit(limit);
      }

      bachelorettes = await dbQuery
        .populate({
          path: "package",
          select: "name duration price totalSlots",
        })
        .populate({
          path: "bookings",
          select: "dates time location class isBookedByAdmin",
          populate: [
            {
              path: "location",
              select: "name address",
            },
            {
              path: "class",
              select: "name",
            },
          ],
        })
        .populate({
          path: "user",
          select: "name email phone",
        })
        .lean();
    }

    // =========================================================
    // SEARCH / STATUS FILTER QUERY
    // =========================================================
    else {
      bachelorettes = await UserPackagesM.find(query)
        .sort({ createdAt: -1 })
        .populate({
          path: "package",
          select: "name duration price totalSlots",
        })
        .populate({
          path: "bookings",
          select: "dates time location class isBookedByAdmin",
          populate: [
            {
              path: "location",
              select: "name address",
            },
            {
              path: "class",
              select: "name",
            },
          ],
        })
        .populate({
          path: "user",
          select: "name email phone",
        })
        .lean();
    }

    // =========================================================
    // CALCULATE EXPIRY DATE & STATUS
    // =========================================================
    let packagesWithExpiry = bachelorettes.map((pkg) => {
      const packageData = { ...pkg };

      const validBookings = Array.isArray(pkg.bookings)
        ? pkg.bookings.filter(
            (b) => b && typeof b === "object"
          )
        : [];

      // =========================================================
      // IF BOOKINGS EXIST
      // =========================================================
      if (
        validBookings.length > 0 &&
        pkg.package
      ) {
        const allDates = validBookings.flatMap(
          (booking) =>
            booking &&
            booking.dates &&
            Array.isArray(booking.dates)
              ? booking.dates.map(
                  (date) => new Date(date)
                )
              : []
        );

        if (allDates.length > 0) {
          const earliestDate = new Date(
            Math.min(...allDates)
          );

          const validityEndDate =
            pkg.extendedValidityEndDate
              ? new Date(
                  pkg.extendedValidityEndDate
                )
              : new Date(
                  earliestDate.getTime() +
                    (pkg.package.duration || 30) *
                      24 *
                      60 *
                      60 *
                      1000
                );

          const now = new Date();

          let status = "active";

          if (validityEndDate < now) {
            status = "expired";
          }

          if (
            validBookings.length >=
            (pkg.totalSlots || 0)
          ) {
            status = "completed";
          }

          packageData.calculatedValidityStartDate =
            earliestDate;

          packageData.calculatedValidityEndDate =
            validityEndDate;

          packageData.calculatedStatus = status;

          packageData.calculatedDaysRemaining =
            Math.ceil(
              (validityEndDate - now) /
                (1000 * 60 * 60 * 24)
            );

          packageData.calculatedSlotsUsed =
            validBookings.length;
        }
      }

      // =========================================================
      // IF NO BOOKINGS
      // =========================================================
      else if (
        pkg.createdAt &&
        pkg.package
      ) {
        const startDate = new Date(
          pkg.createdAt
        );

        const validityEndDate =
          pkg.extendedValidityEndDate
            ? new Date(
                pkg.extendedValidityEndDate
              )
            : new Date(
                startDate.getTime() +
                  (pkg.package.duration || 30) *
                    24 *
                    60 *
                    60 *
                    1000
              );

        const now = new Date();

        let status = "active";

        if (validityEndDate < now) {
          status = "expired";
        }

        if (
          (pkg.slots || 0) >=
          (pkg.totalSlots || 0)
        ) {
          status = "completed";
        }

        packageData.calculatedValidityStartDate =
          startDate;

        packageData.calculatedValidityEndDate =
          validityEndDate;

        packageData.calculatedStatus = status;

        packageData.calculatedDaysRemaining =
          Math.ceil(
            (validityEndDate - now) /
              (1000 * 60 * 60 * 24)
          );

        packageData.calculatedSlotsUsed =
          pkg.slots || 0;
      }

      return packageData;
    });

    // =========================================================
    // SEARCH FILTER
    // =========================================================
    if (search) {
      packagesWithExpiry =
        packagesWithExpiry.filter((pkg) => {
          const userName =
            pkg.user?.name?.toLowerCase() || "";

          const userEmail =
            pkg.user?.email?.toLowerCase() || "";

          const userPhone =
            pkg.user?.phone?.toLowerCase() || "";

          const pkgName =
            pkg.package?.name?.toLowerCase() || "";

          const idStr = pkg._id
            ? String(pkg._id).toLowerCase()
            : "";

          return (
            userName.includes(search) ||
            userEmail.includes(search) ||
            userPhone.includes(search) ||
            pkgName.includes(search) ||
            idStr.includes(search)
          );
        });
    }

    // =========================================================
    // STATUS FILTER
    // =========================================================
    if (
      statusFilter &&
      statusFilter !== "all"
    ) {
      packagesWithExpiry =
        packagesWithExpiry.filter((pkg) => {
          const currentStatus = (
            pkg.calculatedStatus || "active"
          ).toLowerCase();

          return (
            currentStatus === statusFilter
          );
        });
    }

    // =========================================================
    // PAGINATION
    // =========================================================
    let paginatedData = packagesWithExpiry;

    if (isDefaultQuery) {
      paginatedData = packagesWithExpiry;
    } else {
      total = packagesWithExpiry.length;

      paginatedData =
        limit > 0
          ? packagesWithExpiry.slice(
              skip,
              skip + limit
            )
          : packagesWithExpiry;
    }

    res.status(200).json({
      success: true,

      data: paginatedData,

      pagination: {
        total,
        page,
        limit: limit > 0 ? limit : total,
        totalPages:
          limit > 0
            ? Math.ceil(total / limit) || 1
            : 1,
      },
    });
  } catch (error) {
    console.error(
      "Error in getAllPackages:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a specific bachelorette event by ID
const extendPackageExpiry = async (req, res) => {
  try {
    const { userPackageId } = req.params;
    const { extensionDays, reason } = req.body;
    const extendedBy = req.user;

    if (!extensionDays || extensionDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "Extension days must be a positive number",
      });
    }

    // Find user package
    const userPackage = await UserPackage.findById(userPackageId)
      .populate("package")
      .populate("user");

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: "User package not found",
      });
    }

    if (!userPackage.package) {
      return res.status(400).json({
        success: false,
        message: "Package details not found",
      });
    }

    // Calculate current end date (using your existing logic)
    let currentEndDate;

    // If package already has extended date, use that
    if (userPackage.extendedValidityEndDate) {
      currentEndDate = userPackage.extendedValidityEndDate;
    }
    // Otherwise calculate from package duration (your existing system)
    else {
      currentEndDate = new Date(userPackage.createdAt);
      currentEndDate.setDate(
        currentEndDate.getDate() + userPackage.package.duration,
      );
    }

    // Calculate new end date
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(extensionDays));

    // Initialize extensionHistory array if it doesn't exist
    if (!userPackage.extensionHistory) {
      userPackage.extensionHistory = [];
    }

    // Add to extension history
    userPackage.extensionHistory.push({
      extendedBy,
      previousEndDate: currentEndDate,
      newEndDate: newEndDate,
      reason: reason || "Admin extension",
      daysExtended: parseInt(extensionDays),
      extendedAt: new Date(),
    });

    // Update extended validity date
    userPackage.extendedValidityEndDate = newEndDate;

    await userPackage.save();

    res.status(200).json({
      success: true,
      message: `Package expiry extended by ${extensionDays} days successfully`,
      data: {
        userPackageId: userPackage._id,
        userId: userPackage.user._id,
        userName: userPackage.user.name,
        packageName: userPackage.package.name,
        previousEndDate: currentEndDate,
        newEndDate: newEndDate,
        extendedDays: extensionDays,
      },
    });
  } catch (error) {
    console.error("Error extending package expiry:", error);
    res.status(500).json({
      success: false,
      message: "Error extending package expiry",
      error: error.message,
    });
  }
};

// Get package with calculated expiry (updated version)
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userPackage = await UserPackagesM.findOne({
      _id: id,
      paymentStatus: "paid",
    })
      .populate("package")
      .populate("bookings")
      .populate({
        path: "bookings",
        populate: [{ path: "location" }, { path: "class" }],
      })
      .populate({
        path: "package",
        populate: [
          {
            path: "services",
            populate: [
              { path: "availability.trainers", model: "Staff" },
              { path: "availability.locations", model: "Location" },
            ],
          },
        ],
      })
      .populate("extensionHistory.extendedBy", "name email"); // Populate who extended

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: "Users Package not found",
      });
    }

    // Calculate effective end date (extended date takes precedence)
    const effectiveEndDate =
      userPackage.extendedValidityEndDate || userPackage.validityEndDate;

    const packageData = userPackage.toObject();
    packageData.effectiveEndDate = effectiveEndDate;
    packageData.isExtended = !!userPackage.extendedValidityEndDate;

    res.status(200).json({
      success: true,
      data: packageData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get a specific bachelorette event by ID
const getPackageByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const bachelorette = await UserPackagesM.find({
      user: id,
      paymentStatus: "paid",
    }).populate("package");
    res.status(200).json({ success: true, data: bachelorette });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteUserPackageById = async (req, res) => {
  try {
    const userPackage = await UserPackage.findById(req.params.id);

    if (!userPackage) {
      return res
        .status(404)
        .json({ success: false, message: "UserPackage not found" });
    }

    const { user, package: packageId, bookings } = userPackage;

    // 2. Delete related Payments
    await Payment.deleteMany({ user, package: packageId });

    // 3. Delete related Bookings
    if (bookings && bookings.length > 0) {
      await Booking.deleteMany({ _id: { $in: bookings } });
    }

    // 4. Delete the UserPackage
    await UserPackage.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({ success: true, message: "UserPackage and related data deleted" });
  } catch (error) {
    console.error("Error deleting UserPackage and associated data:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting data", error });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    // 1️⃣ Fetch booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2️⃣ Pick earliest date & earliest time from booking
    const bookingDate = booking.dates[0];
    const bookingTime = booking.time[0];

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({
        message: "Booking date/time not available, cannot validate",
      });
    }

    // Convert to real datetime
    const bookingDateTime = moment(
      `${moment(bookingDate).format("YYYY-MM-DD")} ${bookingTime}`,
      "YYYY-MM-DD HH:mm"
    );

    // 3️⃣ Check if booking is at least 3 hours ahead
    const now = moment();

    if (bookingDateTime.diff(now, "minutes") < 180) {
      return res.status(400).json({
        message:
          "Cannot delete booking within 3 hours of class time. Cancellation window closed.",
      });
    }

    // 4️⃣ Find user package that contains this booking
    const userPackage = await UserPackage.findOne({
      bookings: booking._id,
    });

    if (userPackage) {
      // 5️⃣ Remove booking from package and decrease slot count
      await UserPackage.updateOne(
        { _id: userPackage._id },
        {
          $pull: { bookings: booking._id },
          $inc: { slots: -1 },
        },
      );
    }

    // 6️⃣ Delete booking completely
    await Booking.findByIdAndDelete(bookingId);

    return res.status(200).json({
      message: "Booking cancelled successfully",
      bookingId,
      slotReduced: true,
    });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteBookingAdmin = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userPackage = await UserPackage.findOne({ bookings: booking._id });

    let slotReduced = false;

    if (userPackage) {
      const dec = userPackage.slots > 0 ? -1 : 0;

      if (dec !== 0) {
        await UserPackage.updateOne(
          { _id: userPackage._id },
          {
            $pull: { bookings: booking._id },
            $inc: { slots: dec },
          },
        );
        slotReduced = true;
      } else {
        await UserPackage.updateOne(
          { _id: userPackage._id },
          { $pull: { bookings: booking._id } },
        );
      }
    }

    await Booking.findByIdAndDelete(bookingId);

    return res.status(200).json({
      message: "Booking deleted successfully (admin mode)",
      bookingId,
      slotReduced,
    });
  } catch (error) {
    console.error("Admin Delete Booking Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

function getDayOfWeekLocal(dateStr) {
  const d = new Date(dateStr);
  return d.getDay(); // 0..6
}

function dayBoundsLocal(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const start = new Date(year, month, day, 0, 0, 0, 0);
  const end = new Date(year, month, day + 1, 0, 0, 0, 0);
  return { start, end };
}
async function previewSlot(req, res) {
  try {
    const { classId, date, dates, time, times, locationId, locationIds } =
      req.body || {};

    console.log(req.body);

    if (!classId) {
      return res
        .status(400)
        .json({ message: "Missing required field: classId" });
    }

    // normalize inputs to arrays (support single value or array)
    const requestedDates = Array.isArray(dates) ? dates : date ? [date] : [];
    const requestedTimes = Array.isArray(times) ? times : time ? [time] : [];
    const requestedLocations = Array.isArray(locationIds)
      ? locationIds
      : locationId
        ? [locationId]
        : [];

    if (requestedDates.length === 0) {
      return res
        .status(400)
        .json({ message: "Missing required field: date(s)" });
    }

    if (requestedTimes.length === 0) {
      return res
        .status(400)
        .json({ message: "Missing required field: time(s)" });
    }

    if (requestedLocations.length === 0) {
      return res
        .status(400)
        .json({ message: "Missing required field: locationId(s)" });
    }

    // validate ids
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid classId" });
    }

    for (const loc of requestedLocations) {
      if (!mongoose.Types.ObjectId.isValid(loc)) {
        return res.status(400).json({ message: `Invalid locationId: ${loc}` });
      }
    }

    // 1) Load class doc
    const classDoc = await Class.findById(classId).lean();
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    const availabilityList = Array.isArray(classDoc.availability)
      ? classDoc.availability
      : [];

    const classObjectId = new mongoose.Types.ObjectId(classId);

    // Prepare all slot checks
    const slotChecks = [];

    for (const d of requestedDates) {
      const dayOfWeek = getDayOfWeekLocal(d); // 0..6

      // range for the date to handle any time components
      const startOfDay = moment(d).startOf("day").toDate();
      const endOfDay = moment(d).endOf("day").toDate();

      for (const t of requestedTimes) {
        for (const loc of requestedLocations) {
          // find matching availability entry for this day/time/location
          const matchedAvailability = availabilityList.find((a) => {
            const sameDay = Number(a.day) === Number(dayOfWeek);
            const sameTime = String(a.time) === String(t);
            const hasLocation =
              Array.isArray(a.locations) &&
              a.locations.some((L) => String(L) === String(loc));

            return sameDay && sameTime && hasLocation;
          });

          if (!matchedAvailability) {
            // no availability configured for this slot
            slotChecks.push({
              date: d,
              time: t,
              location: loc,
              bookingFilter: null,
            });
            continue;
          }

          // capacity (null if not set)
          const capacity =
            typeof matchedAvailability.maxPeople === "number" &&
            Number.isFinite(matchedAvailability.maxPeople)
              ? matchedAvailability.maxPeople
              : null;

          // IMPORTANT:
          // Match exactly like Compass query because class/time/dates are arrays
          const bookingFilter = {
            class: classObjectId,
            location: new mongoose.Types.ObjectId(loc),
            time: String(t),
            dates: { $elemMatch: { $gte: startOfDay, $lte: endOfDay } },
            paymentStatus: "paid",
          };

          slotChecks.push({
            date: d,
            time: t,
            location: loc,
            capacity,
            bookingFilter,
          });
        }
      }
    }

    // Count existing bookings in parallel for items that have bookingFilter
    const countPromises = slotChecks.map((s) => {
      if (!s.bookingFilter) return Promise.resolve(null);
      return Booking.countDocuments(s.bookingFilter);
    });

    const counts = await Promise.all(countPromises);

    // Build final slot results
    const slots = slotChecks.map((s, idx) => {
      const existingCount = counts[idx] === null ? 0 : counts[idx];

      if (!s.bookingFilter) {
        return {
          date: s.date,
          time: s.time,
          location: s.location,
          bookingAvailable: false,
          message:
            "No matching availability for the given class/day/time/location",
          capacity: null,
          occupiedSeats: 0,
          remainingSeats: 0,
          selectedClass: {
            _id: classDoc._id,
            name: classDoc.name,
            price: classDoc.price,
            offerPrice: classDoc.offerPrice,
            image: classDoc.image,
          },
        };
      }

      let remainingSeats;
      let isAvailable;

      if (s.capacity === null) {
        remainingSeats = Infinity;
        isAvailable = true;
      } else {
        remainingSeats = s.capacity - existingCount;

        if (remainingSeats <= 0) {
          remainingSeats = 0;
          isAvailable = false;
        } else {
          isAvailable = true;
        }
      }

      return {
        date: s.date,
        time: s.time,
        location: s.location,
        bookingAvailable: isAvailable,
        message: isAvailable
          ? "Booking is available for this slot."
          : "This slot is fully booked. Please try another date or time.",
        capacity: s.capacity,
        occupiedSeats: existingCount,
        remainingSeats,
        selectedClass: {
          _id: classDoc._id,
          name: classDoc.name,
          price: classDoc.price,
          offerPrice: classDoc.offerPrice,
          image: classDoc.image,
        },
      };
    });

    return res.status(200).json({
      slots,
      meta: {
        queryReceivedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("previewSlot error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

export {
  deleteUserPackageById,
  getAllPackages,
  getPackageById,
  getPackageByUserId,
  extendPackageExpiry,
  deleteBooking,
  deleteBookingAdmin,
  previewSlot,
};
