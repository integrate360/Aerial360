import express from "express";
const router = express.Router();
import {
  all,
  getLocation,
  Create,
  Update,
  Delete,
} from "../controllers/locationController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

// Get all locations
router.get("/allocations", all);
router.get("/locations", all);

// Get a single location by ID
router.get("/locations/:id", getLocation, (req, res) => {
  res.json(res.location);
});

// Create a new location
router.post("/locations", authMiddleware, isAdmin, Create);

// Update a location by ID
router.put("/locations/:id", authMiddleware, isAdmin, getLocation, Update);

// Delete a location by ID
router.delete("/locations/:id", authMiddleware, isAdmin, Delete);

export default router;
