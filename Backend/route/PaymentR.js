const express = require("express");
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  createRazorpayPayment,
  createPackagePayment,
} = require("../controller/PaymentC");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const { createPackageOrder, verifyPackagePayment, verifyWebhook,createClassOrder,verifyClassPayment } = require("../controller/bookingPackage");

// Routes
router.post("/payment/", createPayment);
router.post("/payment/package", createPackagePayment);
router.get("/payment/", authMiddleware, isAdmin, getAllPayments);
router.get("/payment/:id", getPaymentById);
router.put("/payment/:id", authMiddleware, isAdmin, updatePayment);
router.post("/payment/create-order", createRazorpayPayment);
router.delete("/payment/:id", authMiddleware, isAdmin, deletePayment);
router.post("/create-class-order", createClassOrder);
router.post("/verify-class-order", verifyClassPayment);

router.post("/create-package-order", createPackageOrder);
router.post("/verify-package-payment", verifyPackagePayment);
router.post("/razorpay-webhook", express.json({ type: "application/json" }), verifyWebhook);

module.exports = router;
