import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ================= CREATE RAZORPAY ORDER ================= */
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "order_rcptid_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("RAZORPAY ORDER ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ================= 🔥 VERIFY PAYMENT & UPDATE STOCK ================= */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // ✅ Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed"
      });
    }

    // ✅ Get order from DB
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found"
      });
    }

    // 🔥 UPDATE STOCK HERE (IMPORTANT)
    for (const item of order.items) {
      const food = await foodModel.findById(item._id);

      if (!food) continue;

      if (food.quantity < item.quantity) {
        return res.json({
          success: false,
          message: `${food.name} is out of stock`
        });
      }

      food.quantity -= item.quantity;
      await food.save();
    }

    // ✅ Mark order as PAID
    order.paymentStatus = "PAID";
    order.status = "CONFIRMED";
    order.payment = true;

    await order.save();

    res.json({
      success: true,
      message: "Payment verified & stock updated"
    });

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export { createRazorpayOrder, verifyPayment };
