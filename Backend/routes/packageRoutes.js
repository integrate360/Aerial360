import express from "express";
const router = express.Router();
import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  getClassPackages,
  getCategoryPackages,
} from "../controllers/packageController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

// Route to create a new package
router.post("/package", authMiddleware, isAdmin, createPackage);

// Route to get all packages
router.get("/package", getPackages);
router.get("/package/class/:id", getClassPackages);
router.get("/package/category/:id", getCategoryPackages);

// Route to get a package by ID
router.get("/package/:id", getPackageById);

// Route to update a package by ID
router.put("/package/:id", authMiddleware, isAdmin, updatePackage);

// Route to delete a package by ID
router.delete("/package/:id", authMiddleware, isAdmin, deletePackage);

export default router;
