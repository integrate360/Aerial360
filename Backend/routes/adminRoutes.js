import express from "express";
import { adminLogin, registerAdmin, adminDashboard } from "../controllers/adminController.js";
import { authMiddleware, isAdmin, optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();
// Admin routes
router.post("/admin/login", adminLogin);
router.post("/admin/register", optionalAuth, registerAdmin);
router.get("/admin/dashboard/super", authMiddleware, isAdmin, adminDashboard);

export default router;
