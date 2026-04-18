import express from "express";
import { razorpayInstance } from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import foodModel from "../models/foodModel.js"; // ⭐ ADD THIS

const router = express.Router();

/* ================= CREATE RAZORPAY ORDER ================= */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      id: order.id,
      currency: order.currency,
      amount: order.amount
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed"
    });
  }
});

/* ================= VERIFY PAYMENT ================= */
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      amount
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // ❌ INVALID SIGNATURE
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }

    // 🔥 STEP 1: UPDATE STOCK (IMPORTANT)
    for (const item of items) {
      const food = await foodModel.findById(item._id);

      if (!food) {
        return res.json({
          success: false,
          message: "Food not found"
        });
      }

      if (food.quantity < item.quantity) {
        return res.json({
          success: false,
          message: `${food.name} is out of stock`
        });
      }

      food.quantity -= item.quantity;
      await food.save();
    }

    // 🔥 STEP 2: CREATE ORDER
    const newOrder = await Order.create({
      orderNumber: "CB-" + Math.floor(100000 + Math.random() * 900000),

      items,
      address,
      amount,

      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      status: "CONFIRMED",
      payment: true,

      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });

    console.log("✅ ORDER CREATED:", newOrder._id);

    res.json({
      success: true,
      orderId: newOrder._id
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
});

/* ================= WEBHOOK ================= */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = JSON.parse(req.body);
      console.log("📩 Webhook Event:", event.event);
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("❌ WEBHOOK ERROR:", error);
      res.status(400).send("Error");
    }
  }
);

export default router;
