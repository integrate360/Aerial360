import mongoose from "mongoose";

const UserPackageSchema = new mongoose.Schema(
  {
    bookings: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    ],
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    slots: { type: Number, default: 0 },
    totalSlots: { type: Number, default: 0 },
    price: { type: Number, required: true },
    partialAmount: { type: Number },
    uuid: { type: String, required: true },
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
    validityStartDate: {
      type: Date,
      default: null,
    },
    validityEndDate: {
      type: Date,
      default: null,
    },
    expiryNotificationSent: { type: Boolean, default: false },
    isBookedByAdmin: { type: Boolean, default: false },
    expiryNotificationSentAt: { type: Date },
    // Add these fields for manual extensions
    extendedValidityEndDate: {
      type: Date,
      default: null,
    },
    createdAt: Date,
    extensionHistory: [
      {
        extendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        previousEndDate: Date,
        newEndDate: Date,
        extendedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
  }
  // { timestamps: true }
);

export default mongoose.model("UserPackage", UserPackageSchema);
