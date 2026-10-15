const Razorpay = require("razorpay");
const crypto = require("crypto");
const AsyncHandler = require("express-async-handler");
const { v4: uuid } = require("uuid");
const ClassM = require("../model/ClassM");
const Payment = require("../model/PaymentM");
const Booking = require("../model/BookingM");
const UserPackagesM = require("../model/UserPackagesM");
const PackageM = require("../model/PackageM");
const User = require("../model/UserM");
const { sendInvoiceToUser } = require("../helper/Invoice");
const { addEventToGoogleCalendar } = require("../utils/googleCalendar");
const moment = require("moment");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const formatTimeForInvoice = (time) => {
  if (!time) return 'N/A';
  if (Array.isArray(time)) {
    return time.join(', ');  // Convert array to comma-separated string
  }
  return String(time);
};
// Dont delete above code yet, we will need it for reference

// const createPackageOrder = AsyncHandler(async (req, res) => {
//   const { packageId, user, amount, bookings } = req.body;

//   if (!user || !amount || !bookings || !Array.isArray(bookings) || bookings.length === 0) {
//     return res.status(400).json({ message: "Package, user, and bookings are required" });
//   }

//   const UniqueId = uuid();

//   // 1️⃣ Validate Package and User
//   const packageExists = await PackageM.findById(packageId);
//   if (!packageExists) return res.status(404).json({ message: "Package not found" });

//   const userExists = await User.findById(user);
//   if (!userExists) return res.status(404).json({ message: "User not found" });

//   // 2️⃣ Calculate remaining slots across all previous UserPackages for this user & package
//   const totalSlots = packageExists.days || 0;
//   const totalBookedAgg = await UserPackagesM.aggregate([
//     { $match: { user: userExists._id, package: packageExists._id } },
//     { $group: { _id: null, bookedSlots: { $sum: "$slots" } } },
//   ]);
//   const alreadyBooked = totalBookedAgg[0]?.bookedSlots || 0;
//   const newToBook = bookings.length;
//   const remaining = totalSlots - alreadyBooked;

//   if (newToBook > remaining) {
//     return res.status(400).json({
//       success: false,
//       message: `You can only book ${remaining} more slot(s) for this package.`,
//     });
//   }

//   // 3️⃣ Create Razorpay Order
//   const options = {
//     amount: Math.round(amount * 100), // in paise
//     currency: "INR",
//     receipt: `pkg_${UniqueId}`,
//   };
//   const order = await razorpay.orders.create(options);

//   // 4️⃣ Create pending Payment
//   const payment = await Payment.create({
//     package: packageId,
//     user,
//     amount,
//     isPackage: true,
//     razorpay_order_id: order.id,
//     paymentStatus: "created",
//   });

//   // 5️⃣ Create Bookings
//   const bookingIds = [];
//   for (const book of bookings) {
//     const newBooking = await Booking.create({
//       ...book,
//       user,
//       class: book?.classId,
//       dates: [book?.date],
//       location: book?.location?._id,
//       time: book?.time,
//       duration: book?.classDuration,
//       package: packageId,
//       uuid: UniqueId,
//       paymentStatus: "created",
//       razorpay_order_id: order.id,
//     });
//     bookingIds.push(newBooking._id);
//   }

//   // 6️⃣ Create a new UserPackage for EVERY purchase
//   await UserPackagesM.create({
//     uuid: UniqueId,
//     bookings: bookingIds,
//     package: packageId,
//     price: amount,
//     slots: bookingIds.length, // booked count for this purchase
//     totalSlots: totalSlots,   // max limit from package
//     user,
//     paymentStatus: "created",
//     razorpay_order_id: order.id,
//   });

//   // 7️⃣ Respond with order details
//   res.status(201).json({
//     success: true,
//     orderId: order.id,
//     amount: order.amount,
//     currency: order.currency,
//     paymentId: payment._id,
//   });
// });

// Dont delete above code yet, we will need it for reference

const createPackageOrder = AsyncHandler(async (req, res) => {
  const { packageId, user, amount, bookings } = req.body;
  console.log("Request Body:", req.body);

  if (
    !user ||
    !amount ||
    !bookings ||
    !Array.isArray(bookings) ||
    bookings.length === 0
  ) {
    console.log("Validation failed: Missing user, amount, or bookings");
    return res
      .status(400)
      .json({ message: "Package, user, and bookings are required" });
  }

  const UniqueId = uuid();
  console.log("Generated UniqueId:", UniqueId);

  // 1️⃣ Validate Package and User
  const packageExists = await PackageM.findById(packageId);
  console.log("Package exists:", packageExists);
  if (!packageExists)
    return res.status(404).json({ message: "Package not found" });

  const userExists = await User.findById(user);
  console.log("User exists:", userExists);
  if (!userExists) return res.status(404).json({ message: "User not found" });

  // 2️⃣ Validate bookings count doesn't exceed package limit
  const totalSlots = packageExists.days || 0;
  const newToBook = bookings.length;

  console.log("Package Total Slots:", totalSlots);
  console.log("Slots to Book in This Purchase:", newToBook);

  if (newToBook > totalSlots) {
    console.log("Booking exceeds package limit");
    return res.status(400).json({
      success: false,
      message: `This package allows maximum ${totalSlots} bookings. You're trying to book ${newToBook}.`,
    });
  }

  // Validate selected dates range does not exceed package duration
  const sortedDates = bookings
    .map((b) => (b.date ? moment(b.date) : null))
    .filter(Boolean)
    .sort((a, b) => a.valueOf() - b.valueOf());

  if (sortedDates.length > 0) {
    const minDate = sortedDates[0];
    const maxDate = sortedDates[sortedDates.length - 1];
    const durationDays = packageExists.duration || 30;
    const expiryLimit = moment(minDate).add(durationDays, "days").endOf("day");

    if (maxDate.isAfter(expiryLimit)) {
      return res.status(400).json({
        success: false,
        message: `Selected class date (${maxDate.format("DD-MM-YYYY")}) exceeds the ${durationDays}-day package validity limit from start date (${minDate.format("DD-MM-YYYY")}).`,
      });
    }
  }

  // 3️⃣ Create Razorpay Order
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `pkg_${UniqueId}`,
  };
  const order = await razorpay.orders.create(options);
  console.log("Razorpay Order Created:", order);

  // 4️⃣ Create pending Payment
  const payment = await Payment.create({
    package: packageId,
    user,
    amount,
    isPackage: true,
    razorpay_order_id: order.id,
    paymentStatus: "created",
  });
  console.log("Payment Created:", payment);

  // 5️⃣ Create Bookings
  const bookingIds = [];
  for (const book of bookings) {
    const newBooking = await Booking.create({
      ...book,
      user,
      class: book?.classId,
      dates: [book?.date],
      location: book?.location?._id,
      time: book?.time,
      duration: book?.classDuration,
      package: packageId,
      uuid: UniqueId,
      paymentStatus: "created",
      razorpay_order_id: order.id,
    });
    console.log("Booking Created:", newBooking);
    bookingIds.push(newBooking._id);
  }
  const earliestDate = bookings
    .map((b) => new Date(b.date))
    .sort((a, b) => a - b)[0];

  const userPackage = await UserPackagesM.create({
    uuid: UniqueId,
    bookings: bookingIds,
    package: packageId,
    price: amount,
    slots: bookingIds.length,
    totalSlots: totalSlots,
    user,
    paymentStatus: "created",
    razorpay_order_id: order.id,
    createdAt: earliestDate,
  });
  console.log("UserPackage Created:", userPackage);

  // 7️⃣ Respond with order details
  console.log("Responding with order details");
  res.status(201).json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    paymentId: payment._id,
  });
});

const verifyPackagePayment = AsyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Missing payment details" });
  }

  // Generate signature to verify
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }

  // ✅ Update Payment, Booking, and UserPackage to 'paid'
  const updatedPayment = await Payment.findOneAndUpdate(
    { razorpay_order_id },
    { razorpay_payment_id, razorpay_signature, paymentStatus: "paid" },
    { new: true }
  );

  await Booking.updateMany(
    { razorpay_order_id },
    { $set: { paymentStatus: "paid", razorpay_payment_id } }
  );
  
  const updatedUserPackage = await UserPackagesM.findOneAndUpdate(
    { razorpay_order_id },
    { $set: { paymentStatus: "paid", razorpay_payment_id } },
    { new: true }
  );

  // Get user and package details for invoice
  const userExists = await User.findById(updatedPayment.user);
  const packageExists = await PackageM.findById(updatedPayment.package);
  
  // Get all bookings for this order with populated location details
  const bookings = await Booking.find({ razorpay_order_id })
    .populate('location', 'name')
    .lean();

  // Send invoice email after successful payment
  try {
    const locationNames = bookings
      .map(booking => booking.location?.name || 'N/A')
      .filter((value, index, self) => self.indexOf(value) === index) // Get unique locations
      .join(', ') || 'N/A';

    // Format booking details for invoice
    const classesForInvoice = bookings.map(booking => ({
      name: booking.className || packageExists.name,
      date: moment(booking.dates[0]).format("MMM DD, YYYY"),
      time: formatTimeForInvoice(booking.time),
      location: booking.location?.name || 'Unknown Location',
      duration: booking.duration || 60
    }));

    const bookingDetails = {
      _id: updatedPayment._id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      className: packageExists.name,
      location: locationNames,
      dates: bookings.map(b => moment(b.dates[0]).format("MMM DD, YYYY")),
      classes: classesForInvoice,
      isPackage: true,
      totalAmount: updatedPayment.amount,
      bookingDate: moment().format("MMM DD, YYYY")
    };

    const userDetails = {
      name: userExists.name,
      email: userExists.email,
      phone: userExists?.phone || "Not provided",
    };

    console.log("Sending invoice email to user:", userDetails);
    await sendInvoiceToUser(userDetails, bookingDetails);
    console.log("Invoice email sent successfully");

    // Add events to Google Calendar for each booking
    for (const booking of bookings) {
      try {
        const eventDetails = {
          title: `Class: ${packageExists.name}`,
          description: `Location: ${booking.location?.name || 'N/A'}`,
          start: moment(booking.dates[0]).toISOString(),
          end: moment(booking.dates[0]).add(1, "hours").toISOString(),
        };

        await addEventToGoogleCalendar(userExists, eventDetails);
        console.log("Calendar event created for:", userExists.email);
      } catch (calendarErr) {
        console.error("Calendar error for booking:", calendarErr.message);
      }
    }
  } catch (emailError) {
    console.error("Failed to send invoice email:", emailError.message);
    // Don't fail the payment verification if email fails
  }

  res
    .status(200)
    .json({ success: true, message: "Payment verified successfully" });
});

const verifyWebhook = AsyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const event = req.body.event;
  //     console.log(event,"webhook event")
  // console.log(req.body.payload.payment.entity,"payment intent")
  // Payment Events
  if (event === "payment.captured") {
    const paymentData = req.body.payload.payment.entity;

    await Payment.findOneAndUpdate(
      { razorpay_order_id: paymentData.order_id },
      { razorpay_payment_id: paymentData.id, paymentStatus: "paid" }
    );

    await Booking.updateMany(
      { razorpay_order_id: paymentData.order_id },
      { razorpay_payment_id: paymentData.id, paymentStatus: "paid" }
    );

    await UserPackagesM.updateMany(
      { razorpay_order_id: paymentData.order_id },
      { razorpay_payment_id: paymentData.id, paymentStatus: "paid" }
    );
  }

  if (event === "refund.created") {
    const paymentData = req.body.payload.payment.entity;

    await Payment.findOneAndUpdate(
      { razorpay_order_id: paymentData.order_id },
      { paymentStatus: "refund_initiated" }
    );

    await Booking.updateMany(
      { razorpay_order_id: paymentData.order_id },
      { $set: { paymentStatus: "refund_initiated" } }
    );

    await UserPackagesM.updateMany(
      { razorpay_order_id: paymentData.order_id },
      { $set: { paymentStatus: "refund_initiated" } }
    );
  }

  if (event === "refund.processed") {
    const paymentData = req.body.payload.payment.entity;

    await Payment.findOneAndUpdate(
      { razorpay_order_id: paymentData.order_id },
      { paymentStatus: "refunded" }
    );

    await Booking.updateMany(
      { razorpay_order_id: paymentData.order_id },
      { $set: { paymentStatus: "refunded" } }
    );

    await UserPackagesM.updateMany(
      { razorpay_order_id: paymentData.order_id },
      { $set: { paymentStatus: "refunded" } }
    );
  }

  if (event === "refund.failed") {
    const paymentData = req.body.payload.payment.entity;

    await Payment.findOneAndUpdate(
      { razorpay_order_id: paymentData.order_id },
      { paymentStatus: "refund_failed" }
    );

    await Booking.updateMany(
      { razorpay_order_id: paymentData.order_id },
      { $set: { paymentStatus: "refund_failed" } }
    );

    await UserPackagesM.updateMany(
      { razorpay_order_id: paymentData.order_id },
      { $set: { paymentStatus: "refund_failed" } }
    );
  }

  // if (event === "payment.failed") {
  //     const paymentData = req.body.payload.payment.entity;

  //     await Payment.findOneAndUpdate(
  //         { razorpay_order_id: paymentData.order_id },
  //         { razorpay_payment_id: paymentData.id, paymentStatus: "failed" }
  //     );

  //     await Booking.updateMany(
  //         { razorpay_order_id: paymentData.order_id },
  //         { $set: { razorpay_payment_id: paymentData.id, paymentStatus: "failed" } }
  //     );

  //     await UserPackagesM.updateMany(
  //         { razorpay_order_id: paymentData.order_id },
  //         { $set: { razorpay_payment_id: paymentData.id, paymentStatus: "failed" } }
  //     );
  // }
  // // Refund Events
  // if (event === "refund.created") {
  //     const refundData = req.body.payload.refund.entity;
  //     const orderId = refundData.payment_id; // Note: refunds have payment_id instead of order_id

  //     await Payment.findOneAndUpdate(
  //         { razorpay_payment_id: orderId },
  //         { paymentStatus: "refund_initiated" }
  //     );

  //     await Booking.updateMany(
  //         { razorpay_payment_id: orderId },
  //         { $set: { paymentStatus: "refund_initiated" } }
  //     );

  //     await UserPackagesM.updateMany(
  //         { razorpay_payment_id: orderId },
  //         { $set: { paymentStatus: "refund_initiated" } }
  //     );
  // }

  // if (event === "refund.processed") {
  //     const refundData = req.body.payload.refund.entity;
  //     const orderId = refundData.payment_id;

  //     await Payment.findOneAndUpdate(
  //         { razorpay_payment_id: orderId },
  //         { paymentStatus: "refunded" }
  //     );

  //     await Booking.updateMany(
  //         { razorpay_payment_id: orderId },
  //         { $set: { paymentStatus: "refunded" } }
  //     );

  //     await UserPackagesM.updateMany(
  //         { razorpay_payment_id: orderId },
  //         { $set: { paymentStatus: "refunded" } }
  //     );
  // }

  // if (event === "refund.failed") {
  //     const refundData = req.body.payload.refund.entity;
  //     const orderId = refundData.payment_id;

  //     await Payment.findOneAndUpdate(
  //         { razorpay_payment_id: orderId },
  //         { paymentStatus: "refund_failed" }
  //     );

  //     await Booking.updateMany(
  //         { razorpay_payment_id: orderId },
  //         { $set: { paymentStatus: "refund_failed" } }
  //     );

  //     await UserPackagesM.updateMany(
  //         { razorpay_payment_id: orderId },
  //         { $set: { paymentStatus: "refund_failed" } }
  //     );
  // }

  // if (event === "refund.speed_changed") {
  //     const refundData = req.body.payload.refund.entity;
  //     const orderId = refundData.payment_id;

  //     // Optional: Update status based on speed change
  //     // await Payment.findOneAndUpdate(
  //     //   { razorpay_payment_id: orderId },
  //     //   { refundSpeed: refundData.speed_processed }
  //     // );
  // }

  res.json({ status: "ok" });
});

const createClassOrder = AsyncHandler(async (req, res) => {
  const {
    class: classId,
    user: userId,
    dates,
    location,
    amount,
    time,
    duration,
    people = 1,
  } = req.body;

  // Validate required fields - NO package-related fields
  if (!classId || !userId || !dates || dates.length === 0 || !amount) {
    return res
      .status(400)
      .json({ message: "Class, user, dates, and amount are required" });
  }

  const UniqueId = uuid();

  // Validate references - ONLY class and user
  const classExists = await ClassM.findById(classId);
  if (!classExists) return res.status(404).json({ message: "Class not found" });

  const userExists = await User.findById(userId);
  if (!userExists) return res.status(404).json({ message: "User not found" });

  // 1️⃣ Create Razorpay Order
  const options = {
    amount: Math.round(amount * 100), // convert to paise
    currency: "INR",
    receipt: `cls_${UniqueId}`,
  };

  const order = await razorpay.orders.create(options);

  // 2️⃣ Save Payment as pending - NO package fields
  const payment = await Payment.create({
    class: classId,
    user: userId,
    amount,
    isPackage: false, // Explicitly false for class
    razorpay_order_id: order.id,
    paymentStatus: "created",
  });

  // 3️⃣ Create pending booking - ONLY class-related fields
  const newBooking = await Booking.create({
    user: userId,
    class: [classId], // Your schema expects array
    dates,
    location,
    time: time || [],
    duration,
    people,
    uuid: UniqueId,
    amount,
    paymentStatus: "created",
    razorpay_order_id: order.id,
  });

  res.status(201).json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    paymentId: payment._id,
    bookingId: newBooking._id,
    type: "class", // Explicitly indicate this is a class booking
  });
});

const verifyClassPayment = AsyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Missing payment details" });
  }

  // Generate signature to verify
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }

  // ✅ Update Payment and Booking to 'paid' - NO package updates
  const updatedPayment = await Payment.findOneAndUpdate(
    { razorpay_order_id },
    {
      razorpay_payment_id,
      razorpay_signature,
      paymentStatus: "paid",
    },
    { new: true }
  );

  const updatedBooking = await Booking.findOneAndUpdate(
    { razorpay_order_id },
    {
      razorpay_payment_id,
      paymentStatus: "paid",
    },
    { new: true }
  ).populate('location', 'name');

  // Get user and class details for invoice
  const userExists = await User.findById(updatedPayment.user);
  const classExists = await ClassM.findById(updatedPayment.class);

  // Send invoice email after successful payment
  try {
    const bookingDetails = {
      _id: updatedPayment._id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      className: classExists.name,
      location: updatedBooking.location?.name || 'N/A',
      dates: updatedBooking.dates.map(d => moment(d).format("MMM DD, YYYY")),
      classes: [{
        name: classExists.name,
        date: moment(updatedBooking.dates[0]).format("MMM DD, YYYY"),
        time: formatTimeForInvoice(updatedBooking.time),
        location: updatedBooking.location?.name || 'Unknown Location',
        duration: updatedBooking.duration || 60
      }],
      isPackage: false,
      totalAmount: updatedPayment.amount,
      bookingDate: moment().format("MMM DD, YYYY"),
      people: updatedBooking.people || 1
    };

    const userDetails = {
      name: userExists.name,
      email: userExists.email,
      phone: userExists?.phone || "Not provided",
    };

    console.log("Sending class invoice email to user:", userDetails);
    await sendInvoiceToUser(userDetails, bookingDetails);
    console.log("Class invoice email sent successfully");

    // Add event to Google Calendar
    try {
      const eventDetails = {
        title: `Class: ${classExists.name}`,
        description: `Location: ${updatedBooking.location?.name || 'N/A'}`,
        start: moment(updatedBooking.dates[0]).toISOString(),
        end: moment(updatedBooking.dates[0]).add(1, "hours").toISOString(),
      };

      await addEventToGoogleCalendar(userExists, eventDetails);
      console.log("Calendar event created for:", userExists.email);
    } catch (calendarErr) {
      console.error("Calendar error:", calendarErr.message);
    }
  } catch (emailError) {
    console.error("Failed to send class invoice email:", emailError.message);
    // Don't fail the payment verification if email fails
  }

  res.status(200).json({
    success: true,
    message: "Class payment verified successfully",
    type: "class",
  });
});

module.exports = {
  createPackageOrder,
  verifyPackagePayment,
  verifyWebhook,
  createClassOrder,
  verifyClassPayment,
};
