import express from "express";
import {
  createEnquiry,
  getEnquiries,
  deleteEnquiry,
  getEnquiryById,
} from "../controllers/enquiryController.js";

const router = express.Router();

// Routes for enquiries
router.post("/enquiry", createEnquiry); 
router.get("/enquiry", getEnquiries); 
router.get("/getEnquiryById/:id", getEnquiryById); 
router.delete("/enquiry/:id", deleteEnquiry); 

export default router;
