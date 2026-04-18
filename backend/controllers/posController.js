import orderModel from "../models/orderModel.js";


/* ================= GENERATE ORDER NUMBER ================= */
const generateOrderNumber = async () => {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");

  const datePrefix = `${month}${day}`;

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayOrders = await orderModel.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const nextNumber = todayOrders.length + 1;
  const orderCount = String(nextNumber).padStart(3, "0");

  return `POS-${datePrefix}-${orderCount}`;
};

/* ================= CREATE POS ORDER ================= */
const createPosOrder = async (req, res) => {
   console.log("🔥 POS API HIT");
  console.log("POS ORDER RECEIVED:", JSON.stringify(req.body, null, 2)); 
  try {
    const {
      items,
      customerName,
      customerPhone,
      amount,
      status,
      paymentStatus
    } = req.body;

   if (!items || items.length === 0) {
  return res.status(400).json({
    success: false,
    message: "Cart empty"
  });
}

if (items.some(item => !item.productType)) {
  return res.status(400).json({
    success: false,
    message: "Invalid items (missing product type)"
  });
}

    const orderNumber = await generateOrderNumber();

 const formattedItems = items.map(item => {
  const type = String(item.productType || "")
    .trim()
    .toLowerCase();

  return {
    _id: item._id,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    productType: type === "packed" ? "Packed" : "Unpacked",
  };
});

    const order = new orderModel({
      orderNumber,
      items: formattedItems,
      amount: Number(amount),
      source: "POS",
      paymentMethod: "POS",
      address: {
        fullName: customerName || "Walk-in",
        phone: customerPhone || ""
      },
      status: status || "preparing",
      payment: paymentStatus === "paid"
    });

    await order.save();

    console.log("✅ POS ORDER SAVED:", JSON.stringify(order.items, null, 2));

    res.json({
      success: true,
      orderId: order._id
    });

  } catch (error) {
    console.error("POS ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "POS order failed"
    });
  }
};

/* ================= LIST POS ORDERS ================= */
const listPosOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false
    });
  }
};

/* ================= UPDATE POS STATUS ================= */
const updatePosStatus = async (req, res) => {
  const { orderId, status } = req.body;

  await orderModel.findByIdAndUpdate(orderId, { status });

  res.json({
    success: true
  });
};

export {
  createPosOrder,
  listPosOrders,
  updatePosStatus
};