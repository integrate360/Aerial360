import express from "express";
import {
  updateClass,
  deleteClass,
  getClassById,
  createClass,
  getClasses,
  getTotalClasses,
  getAdminClasses,
} from "../controllers/classController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/class",
  authMiddleware,
  isAdmin,
  upload.array("images"),
  createClass
);

router.put(
  "/class/:id",
  authMiddleware,
  isAdmin,
  upload.array("images"),
  updateClass
);

router.get("/classes", getClasses);
router.get("/getAdminClasses", getAdminClasses);
router.get("/class/:id", getClassById);
router.delete("/class/:id", deleteClass);
router.get("/totalClasses", getTotalClasses);

export default router;
