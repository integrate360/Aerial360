import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import multer from "multer";
import {
  getAllPackages,
  getPackageById,
  getPackageByUserId,
  deleteUserPackageById,
  extendPackageExpiry, // Add this import
  deleteBooking,
  deleteBookingAdmin,
  previewSlot
} from "../controllers/userPackageController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/user-package", getAllPackages);
router.get("/user-package/:id", authMiddleware, getPackageById);
router.get("/user-package/user/:id/", authMiddleware, getPackageByUserId);
router.post("/preview-booking-class-availbality", previewSlot);
router.delete("/deleteUserPackageById/user/:id/", authMiddleware, isAdmin, deleteUserPackageById);
router.delete("/delete-booking-from-package/:bookingId", authMiddleware, deleteBooking);
router.delete("/delete-booking-from-package-by-admin/:bookingId", authMiddleware, isAdmin, deleteBookingAdmin);
// Add the new route for extending expiry
// Add this ONE new route to your existing user package routes
router.patch(
  "/user-package/:userPackageId/extend-expiry",
  authMiddleware,
  isAdmin,
  extendPackageExpiry
);
export default router;
