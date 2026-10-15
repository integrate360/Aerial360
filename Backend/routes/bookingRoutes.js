import express from "express";
const router = express.Router();
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
  getTotalAmount,
  availableSlots,
  reschedule,
  createBookingForAdmin,
  showAvailability,
  sendNotificationToUsers,
  createMultipleBookings,
  createMultipleBookingsAdmin,
  updateBookingPartialAmount,
  updateUserPackagePartialAmount,
  getAllBookingsdates,
  getAllBookingsdatesadmin,
} from "../controllers/bookingController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

// Routes
router.post("/booking/", authMiddleware, createBooking);
router.post("/bookingforadmin/", authMiddleware, isAdmin, createBookingForAdmin);
router.post("/booking/multiple", authMiddleware, createMultipleBookings);
router.post("/booking/multipleAdmin", authMiddleware, isAdmin, createMultipleBookingsAdmin);
router.get("/bookings/", authMiddleware, isAdmin, getAllBookings);
router.get("/getAllBookingsdates", getAllBookingsdates);
router.get("/getAllBookingsdatestest", getAllBookingsdatesadmin);
router.get("/getTotalAmount", authMiddleware, isAdmin, getTotalAmount);
router.get("/booking/:id", authMiddleware, getBookingById);
router.get("/booking/user/:id", authMiddleware, getBookingsByUser);
router.get("/bookings/available-slots", availableSlots);
router.put("/booking/reschedule/:id", authMiddleware, reschedule);
router.post("/booking/availability/", showAvailability);
router.put(
  "/booking/class/reschedule",
  authMiddleware,
  isAdmin,
  sendNotificationToUsers
);
router.put("/booking/:id", authMiddleware, isAdmin, updateBooking);
router.delete("/booking/:id", authMiddleware, isAdmin, deleteBooking);

router.put(
  "/update-partial-payment",
  authMiddleware,
  isAdmin,
  updateBookingPartialAmount
);

router.put(
  "/update-user-package-partial-payment",
  authMiddleware,
  isAdmin,
  updateUserPackagePartialAmount
);

export default router;
