import crypto from "crypto";
import orderModel from "../models/orderModel.js";

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const body = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(body.toString());

    // 🎯 PAYMENT SUCCESS EVENT
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const orderId = payment.notes.orderId; // 🔥 from your frontend

      if (orderId) {
        await orderModel.findByIdAndUpdate(orderId, {
          payment: true,
          status: "paid"
        });

        console.log("✅ Payment captured for order:", orderId);
      }
    }

    res.json({ status: "ok" });

  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook error");
  }
};