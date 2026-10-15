import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var ContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//Export the model
export default mongoose.model("Contact", ContactSchema);
