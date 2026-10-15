
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db.js");
const { startAutoReminder } = require("./utils/autoReminderService.js");
const { errorHandler } = require("./middleware/errorHandler");

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
app.use("/api", require("./route/AdminR.js"));
app.use("/api", require("./route/LocationR.js"));
app.use("/api", require("./route/ClassR.js"));
app.use("/api", require("./route/AdvertisementR.js"));
app.use("/api", require("./route/CategoryR.js"));
app.use("/api", require("./route/UserR.js"));
app.use("/api", require("./route/BookingR.js"));
app.use("/api", require("./route/PaymentR.js"));
app.use("/api", require("./route/StaffR.js"));
app.use("/api", require("./route/PackageR.js"));
app.use("/api", require("./route/EnquiryR.js"));
app.use("/api", require("./route/UserPackageR.js"));
app.use("/api", require("./route/bacheloretteR.js"));
app.use("/api", require("./route/appVersionRoutes.js"));

// ✅ Error Handler
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
