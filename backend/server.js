// ================================
// server.js (FINAL STABLE VERSION)
// ================================

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

// =====================================
// FIX __dirname (ES MODULE SUPPORT)
// =====================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================
// LOAD ENV FILE
// =====================================
dotenv.config({ path: path.resolve(__dirname, ".env") });

// =====================================
// IMPORT ROUTES
// =====================================
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import posRoutes from "./routes/posRoutes.js";
import settingsRoute from "./routes/settingsRoute.js";
import reportRoutes from "./routes/reportRoutes.js";
import categoryRouter from "./routes/categoryRoute.js";
import couponRouter from "./routes/couponRoute.js";

// =====================================
// INIT APP
// =====================================
const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// CREATE HTTP SERVER
// =====================================
const server = http.createServer(app);

// =====================================
// SOCKET.IO SETUP
// =====================================
const io = new Server(server, {
  cors: {
    origin: "*", // 🔥 allow all for debugging (safe to restrict later)
    credentials: true,
  },
});

// Make io available globally
app.set("io", io);

// Socket connection
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// =====================================
// CORS
// =====================================
app.use(
  cors({
    origin: "*", // 🔥 important for fixing deploy issues
    credentials: true,
  })
);

// =====================================
// MIDDLEWARE ORDER
// =====================================

// Webhook (must be first)
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// JSON parser
app.use(express.json());

// =====================================
// STATIC FILES
// =====================================
app.use("/images", express.static(path.join(__dirname, "uploads")));

// =====================================
// ROUTES
// =====================================
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter); // 🔥 important
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/settings", settingsRoute);
app.use("/api/reports", reportRoutes);
app.use("/api/categories", categoryRouter);
app.use("/api/coupon", couponRouter);

// =====================================
// TEST ROUTE (DEBUG)
// =====================================
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working ✅" });
});

// =====================================
// DATABASE CONNECTION
// =====================================
connectDB();

// =====================================
// ROOT ROUTE
// =====================================
app.get("/", (req, res) => {
  res.json({
    message: "API Working — Server Online ✔",
    timestamp: new Date().toISOString(),
  });
});

// =====================================
// 404 HANDLER
// =====================================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// =====================================
// START SERVER
// =====================================
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
