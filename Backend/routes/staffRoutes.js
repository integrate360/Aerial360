import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createStaff,
  getAllStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
  getTotalStaffs,
} from "../controllers/staffController.js";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post(
  "/staff/",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  createStaff
);
router.get("/staff/", getAllStaffs);
router.get("/getTotalStaffs", getTotalStaffs);
router.get("/staff/:id", authMiddleware, isAdmin, getStaffById);

router.put(
  "/staff/:id",
  upload.single("image"),
  updateStaff
);
router.delete("/staff/:id", deleteStaff);

export default router;
