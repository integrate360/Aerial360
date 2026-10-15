import mongoose from "mongoose";
const StaffSchema = new mongoose.Schema(
  {
    name: { type: String },
    image: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Staff", StaffSchema);
