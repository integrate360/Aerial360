const express = require("express");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();
const multer = require("multer");
const {
  getAllPackages,
  getPackageById,
  getPackageByUserId,
  deleteUserPackageById,
  extendPackageExpiry, // Add this import
  deleteBooking,
  deleteBookingAdmin,
  previewSlot
} = require("../controller/UserPackageC");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/user-package", getAllPackages);
router.get("/user-package/:id", getPackageById);
router.get("/user-package/user/:id/", getPackageByUserId);
router.post("/preview-booking-class-availbality", previewSlot);
router.delete("/deleteUserPackageById/user/:id/", deleteUserPackageById);
router.delete("/delete-booking-from-package/:bookingId", deleteBooking);
router.delete("/delete-booking-from-package-by-admin/:bookingId", deleteBookingAdmin);
// Add the new route for extending expiry
// Add this ONE new route to your existing user package routes
router.patch(
  "/user-package/:userPackageId/extend-expiry",
  authMiddleware,
  isAdmin,
  extendPackageExpiry
);
module.exports = router;
