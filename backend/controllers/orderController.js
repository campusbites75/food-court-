import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import crypto from "crypto";

// ================= 🔥 STOCK UPDATE FUNCTION =================
const updateStock = async (items) => {
  for (const item of items) {
    const qty = Number(item.quantity) || 1;

    const food = await foodModel.findById(item._id);

    if (!food) {
      throw new Error(`${item.name} not found`);
    }

    if (food.quantity < qty) {
      throw new Error(`${item.name} is out of stock`);
    }

    food.quantity = food.quantity - qty;
    await food.save();

    console.log(`✅ Stock updated: ${food.name} → ${food.quantity}`);
  }
};

const frontend_URL = "https://campusbitesfoodcourt.vercel.app";

/* ================= VALIDATE ITEMS ================= */
const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every(
    (item) =>
      item._id &&
      item.name &&
      item.price != null &&
      item.quantity != null &&
      item.productType
  );
};

/* ================= FACULTY VALIDATION ================= */
const validateFacultyAccess = (address) => {
  const SECRET = (process.env.FACULTY_SECRET_CODE || "").trim().toUpperCase();
  if (!address) return false;

  if (address.userType === "faculty") {
    const incoming = (address.facultyCode || "").trim().toUpperCase();
    if (!incoming || incoming !== SECRET) return false;
  }

  return true;
};

/* ================= GENERATE ORDER NUMBER ================= */
const generateOrderNumber = async () => {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const datePrefix = `${month}${day}`;

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayOrders = await orderModel.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const nextNumber = todayOrders.length + 1;
  const orderCount = String(nextNumber).padStart(3, "0");

  return `CB-${datePrefix}-${orderCount}`;
};

/* ================= CREATE ORDER OBJECT ================= */
const createOrderObject = async ({
  userId,
  items,
  amount,
  discount,
  couponCode,
  address,
  deliveryFee,
  paymentMethod = "ONLINE", // ✅ FIXED
}) => {
  const orderNumber = await generateOrderNumber();

  const formattedItems = [];

  for (const item of items) {
    const food = await foodModel.findById(item._id);
    if (!food) continue;

    const quantity = item.quantity || 1;

    formattedItems.push({
      _id: food._id,
      name: food.name,
      price: food.price,
      quantity,
      productType:
        String(food.productType || "").trim().toLowerCase() === "packed"
          ? "Packed"
          : "Unpacked",
    });
  }

  return new orderModel({
    orderNumber,
    userId: userId || null,
    items: formattedItems,
    amount,
    discount: discount || 0,
    couponCode: couponCode || null,
    address,
    deliveryFee: deliveryFee || 0,

    // ✅ CLEAN LOGIC
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "PAID" : "PENDING",
    status: paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
    payment: paymentMethod === "COD",
  });
};

/* ================= CLEAR USER CART ================= */
const clearUserCart = async (userId) => {
  if (userId) {
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
  }
};

/* ================= PLACE ORDER (ONLINE) ================= */
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { items, amount, discount, couponCode, address, deliveryFee } =
      req.body;

    const user = await userModel.findById(userId);

    const updatedAddress = {
      ...address,
      email: user.email,
      phone: user.phone || address?.phone,
    };

    if (!validateItems(items)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart items" });
    }

    if (address && !validateFacultyAccess(address)) {
      return res.status(403).json({
        success: false,
        message: "Invalid faculty verification code",
      });
    }

    const order = await createOrderObject({
      userId,
      items,
      amount,
      discount,
      couponCode,
      address: updatedAddress,
      deliveryFee,
      paymentMethod: "ONLINE", // ✅ FIXED
    });

    await order.save();
    await clearUserCart(userId);

    res.json({ success: true, order });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Order failed",
    });
  }
};

/* ================= PLACE ORDER (COD) ================= */
export const placeOrderCod = async (req, res) => {
  try {
    const userId = req.user.id;

    const { items, amount, discount, couponCode, address, deliveryFee } =
      req.body;

    const user = await userModel.findById(userId);

    const updatedAddress = {
      ...address,
      email: user.email,
      phone: user.phone || address?.phone,
    };

    if (!validateItems(items)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart items" });
    }

    if (!address || address.userType === "student") {
      return res.status(403).json({
        success: false,
        message: "Students cannot use Cash on Delivery",
      });
    }

    if (!validateFacultyAccess(address)) {
      return res.status(403).json({
        success: false,
        message: "Invalid faculty verification code",
      });
    }

    const order = await createOrderObject({
      userId,
      items,
      amount,
      discount,
      couponCode,
      address: updatedAddress,
      deliveryFee,
      paymentMethod: "COD",
    });

    await updateStock(order.items);
    await order.save();
    await clearUserCart(userId);

    res.json({ success: true, order });
  } catch (error) {
    console.error("COD ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "COD order failed",
    });
  }
};

/* ================= USER ORDERS ================= */
export const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await orderModel
      .find({ userId: String(userId) })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders, // ✅ NO FILTERING
    });
  } catch (error) {
    console.error("USER ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
};

/* ================= VERIFY PAYMENT ================= */
export const verifyOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await orderModel.findById(orderId);

      if (!order) {
        return res.json({ success: false, message: "Order not found" });
      }

      await updateStock(order.items);

      order.paymentStatus = "PAID";
      order.status = "CONFIRMED";
      order.payment = true;

      await order.save();

      return res.json({ success: true });
    } else {
      await orderModel.findByIdAndUpdate(orderId, {
        paymentStatus: "FAILED",
        status: "FAILED",
      });

      return res.json({ success: false });
    }
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return res.status(500).json({ success: false });
  }
};
