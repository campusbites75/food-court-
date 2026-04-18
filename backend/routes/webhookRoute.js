import express from "express";
import { razorpayWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// ⚠️ IMPORTANT: raw body required
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;