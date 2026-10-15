import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post("/category/", upload.single("image"), createCategory);  
router.get("/category/", getAllCategories);
router.get("/category/:id", authMiddleware, isAdmin, getCategoryById);
router.put("/category/:id",upload.single("image"), authMiddleware, isAdmin, updateCategory);
router.delete("/category/:id", deleteCategory);

export default router;
