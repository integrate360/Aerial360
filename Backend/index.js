
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import { startAutoReminder } from "./utils/autoReminderService.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import adminRoutes from "./routes/adminRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import advertisementRoutes from "./routes/advertisementRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import userPackageRoutes from "./routes/userPackageRoutes.js";
import bacheloretteRoutes from "./routes/bacheloretteRoutes.js";
import appVersionRoutes from "./routes/appVersionRoutes.js";

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Serve static files
app.use("/public", express.static("public"));

// ✅ Start Auto Reminder Service
startAutoReminder();

// ✅ CORS setup (apply before all routes)
const allowedOrigins = [
  "https://airadmin.airbound.in",
  "https://airbound.in",
  "https://book.airbound.in", // ✅ Add this
  "https://api.airbound.in",
  "https://fitness360demo.netlify.app"
];

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:3000", "http://localhost:5173");
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Fallback manual CORS headers (for extra safety)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Requested-With"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api", adminRoutes);
app.use("/api", locationRoutes);
app.use("/api", classRoutes);
app.use("/api", advertisementRoutes);
app.use("/api", categoryRoutes);
app.use("/api", userRoutes);
app.use("/api", bookingRoutes);
app.use("/api", paymentRoutes);
app.use("/api", staffRoutes);
app.use("/api", packageRoutes);
app.use("/api", enquiryRoutes);
app.use("/api", userPackageRoutes);
app.use("/api", bacheloretteRoutes);
app.use("/api", appVersionRoutes);

// ✅ Error Handler
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 6000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
