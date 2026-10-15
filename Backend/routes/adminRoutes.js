import express from "express";
import { adminLogin, registerAdmin, adminDashboard } from "../controllers/adminController.js";

const router = express.Router();
// Admin routes
router.post("/admin/login", adminLogin);
router.post("/admin/register", registerAdmin);
router.get("/admin/dashboard/super", adminDashboard);

export default router;
