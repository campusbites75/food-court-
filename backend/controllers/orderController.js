import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import crypto from "crypto";

// ================= STOCK UPDATE =================
const updateStock = async (items) => {
  for (const item of items) {
    const qty = Number(item.quantity) || 1;

    const food = await foodModel.findById(item._id);
    if (!food) throw new Error(`${item.name} not found`);

    if (food.quantity < qty) {
      throw new Error(`${item.name} is out of stock`);
    }

    food.quantity -= qty;
    await food.save();
  }
};

// ================= VALIDATE ITEMS =================
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

// ================= FACULTY VALIDATION =================
const validateFacultyAccess = (address) => {
  const SECRET = (process.env.FACULTY_SECRET_CODE || "").trim().toUpperCase();
  if (!address) return false;

  if (address.userType === "faculty") {
    const incoming = (address.facultyCode || "").trim().toUpperCase();
    if (!incoming || incoming !== SECRET) return false;
  }

  return true;
};

// ================= GENERATE ORDER NUMBER =================
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
  return `CB-${datePrefix}-${String(nextNumber).padStart(3, "0")}`;
};

// ================= CREATE ORDER =================
const createOrderObject = async ({
  userId,
  items,
  amount,
  discount,
  couponCode,
  address,
  deliveryFee,
  paymentMethod = "ONLINE",
}) => {
  const orderNumber = await generateOrderNumber();

  const formattedItems = [];

  for (const item of items) {
    const food = await foodModel.findById(item._id);
    if (!food) continue;

    formattedItems.push({
      _id: food._id,
      name: food.name,
      price: food.price,
      quantity: item.quantity || 1,
      productType:
        String(food.productType).toLowerCase() === "packed"
          ? "Packed"
          : "Unpacked",
    });
  }

  return new orderModel({
    orderNumber,
    userId,
    items: formattedItems,
    amount,
    discount: discount || 0,
    couponCode: couponCode || null,
    address,
    deliveryFee: deliveryFee || 0,
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "PAID" : "PENDING",
    status: paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
    payment: paymentMethod === "COD",
  });
};

// ================= CLEAR CART =================
const clearUserCart = async (userId) => {
  if (userId) {
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
  }
};

// ================= PLACE ORDER =================
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
      return res.status(400).json({ success: false, message: "Invalid items" });
    }

    if (!validateFacultyAccess(address)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid faculty code" });
    }

    const order = await createOrderObject({
      userId,
      items,
      amount,
      discount,
      couponCode,
      address: updatedAddress,
      deliveryFee,
      paymentMethod: "ONLINE",
    });

    await order.save();
    await clearUserCart(userId);

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= COD ORDER =================
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
      return res.status(400).json({ success: false });
    }

    if (!validateFacultyAccess(address)) {
      return res.status(403).json({ success: false });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= USER ORDERS =================
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user.id });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ================= VERIFY PAYMENT =================
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
    res.status(500).json({ success: false });
  }
};

// ================= ADMIN FUNCTIONS =================

// ACCEPT ORDER
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false });

    order.status = "ACCEPTED";
    await order.save();

    res.json({ success: true, message: "Order accepted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REJECT ORDER
export const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false });

    order.status = "REJECTED";
    await order.save();

    res.json({ success: true, message: "Order rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ALL ORDERS FOR ADMIN/KITCHEN
export const kitchenOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ================= MARK ORDER PREPARED =================
export const markPrepared = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    order.status = "PREPARED";
    await order.save();

    res.json({ success: true, message: "Order marked as prepared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= MARK ORDER DELIVERED =================
export const markDelivered = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    order.status = "DELIVERED";
    await order.save();

    res.json({ success: true, message: "Order delivered" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET BILL =================
export const getBillByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ================= GET ORDER STATUS =================
export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      status: order.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
