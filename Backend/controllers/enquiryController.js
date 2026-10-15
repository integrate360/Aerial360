import Enquiry from "../models/enquiryModel.js";

// Create a new enquiry
export const createEnquiry = async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.status(201).json(enquiry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all enquiries
export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate("user");
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an enquiry
export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    res.status(200).json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id).populate("user");

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.status(200).json(enquiry);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};