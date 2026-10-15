import express from "express";
import {
  createBachelorette,
  getAllBachelorettes,
  getBacheloretteById,
  updateBachelorette,
  deleteBachelorette,
} from "../controllers/bacheloretteController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new bachelorette event (inquiry submission from app)
router.post("/bachelorette", createBachelorette);

// Get all bachelorette events (admin only)
router.get("/bachelorette", authMiddleware, isAdmin, getAllBachelorettes);

// Get a specific bachelorette event by ID
router.get("/bachelorette/:id", authMiddleware, isAdmin, getBacheloretteById);

// Update a specific bachelorette event
router.put("/bachelorette/:id", authMiddleware, isAdmin, updateBachelorette);

// Delete a specific bachelorette event
router.delete("/bachelorette/:id", authMiddleware, isAdmin, deleteBachelorette);

export default router;
