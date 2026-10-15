import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//Export the model
export default mongoose.model("Category", CategorySchema);
