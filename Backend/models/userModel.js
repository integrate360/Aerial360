import mongoose from "mongoose";

var UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: { type: String },
    image: { type: String },
    deviceToken: { type: String },
    token: { type: String },
    emergencyPhone: { type: String },
    medicalCondition: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
