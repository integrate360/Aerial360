const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
const PaymentSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Payment details
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    isPackage: { type: Boolean, required: true },

    // Razorpay specific fields
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },

    // Payment meta info
    paymentStatus: {
      type: String,
      enum: [
        "created",           // order created but not paid
        "attempted",         // payment initiated but not completed
        "paid",              // successful payment
        "failed",            // failed transaction
        "refund_initiated",  // refund requested/created
        "refunded",          // refund processed successfully
        "refund_failed",     // refund failed
      ],
      default: "created",
    },
    method: { type: String }, // e.g., card, netbanking, wallet, upi
    receipt: { type: String }, // Razorpay receipt reference

    // Verification flag
    verified: { type: Boolean, default: false },

    // Optional: store full response data for reference/debugging
    paymentResponse: { type: Object },
  },
  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("Payment", PaymentSchema);
