import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    people: { type: Number },
    date: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Enquiry", EnquirySchema);
