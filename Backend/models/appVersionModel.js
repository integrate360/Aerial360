
import mongoose from "mongoose"; 

const platformSchema = new mongoose.Schema(
  {
    latestVersion: {
      type: String,
      required: true,
    },
    buildVersion: {
      type: String,
      required: true,
    },
    minimumVersion: {
      type: String,
      required: true,
    },
    forceUpdate: {
      type: Boolean,
      default: false,
    },
    updateUrl: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const appVersionSchema = new mongoose.Schema(
  {
    ios: platformSchema,
    android: platformSchema,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AppVersion", appVersionSchema);
