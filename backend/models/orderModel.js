import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String, default: null },
    items: [
      {
        _id: String,
        name: String,
        price: Number,
        quantity: Number,
        productType: {
          type: String,
          enum: ["Packed", "Unpacked"],
          required: true,
          default: "Unpacked"
        }
      }
    ],
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    address: { type: Object, default: {} },
    deliveryFee: { type: Number, default: 0 },
    
    // 🔥 FIXED: Add proper status fields
    status: { type: String, default: "PENDING", enum: ["PENDING", "PAID", "CONFIRMED", "PREPARED", "DELIVERED", "CANCELLED"] },
    paymentStatus: { type: String, default: "PENDING", enum: ["PENDING", "PAID", "CONFIRMED", "FAILED"] },
    payment: { type: Boolean, default: false }, // Keep for backward compat
    
    paymentMethod: { type: String, default: "ONLINE" },
    
    // 🔥 Razorpay fields
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;