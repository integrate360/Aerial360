import express from "express";
const router = express.Router();
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  createRazorpayPayment,
  createPackagePayment,
} from "../controllers/paymentController.js";
import { isAdmin, authMiddleware } from "../middlewares/authMiddleware.js";
import { createPackageOrder, verifyPackagePayment, verifyWebhook, createClassOrder, verifyClassPayment } from "../controllers/bookingPackageController.js";

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

export default router;
