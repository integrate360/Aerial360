import mongoose from "mongoose";
import UserPackagesM from "./userPackageModel.js";

// Declare the Schema of the Mongo model
const BookingSchema = new mongoose.Schema(
  {
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    time: [{ type: String }],
    duration: { type: Number },
    dates: [{ type: Date }],
    uuid: { type: String },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    amount: { type: Number },
    partialAmount: { type: Number },
    people: { type: Number, default: 1 },
    class: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    isBookedByAdmin: { type: Boolean, default: false },
    // ✅ Minimal necessary payment fields
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    paymentStatus: {
      type: String,
      enum: [
        "created", // order created but not paid
        "attempted", // payment initiated but not completed
        "paid", // successful payment
        "failed", // failed transaction
        "refund_initiated", // refund requested/created
        "refunded", // refund processed successfully
        "refund_failed", // refund failed
      ],
      default: "created",
    },
  },
  { timestamps: true }
);
BookingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await UserPackagesM.updateMany(
      { bookings: doc._id },
      {
        $pull: { bookings: doc._id },
        $inc: { slots: -1 },
      }
    );
  }
});
// Export the model
export default mongoose.model("Booking", BookingSchema);
