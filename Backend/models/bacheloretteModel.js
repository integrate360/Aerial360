import mongoose from "mongoose";

const bacheloretteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    people: { type: Number },
    date: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Bachelorette", bacheloretteSchema);
