import express from "express";
import Order from "../models/orderModel.js";
import PosOrder from "../models/posOrderModel.js";

const router = express.Router();

/* ======================================================
   MONTHLY REPORT
   GET /api/reports/monthly?month=YYYY-MM
====================================================== */
router.get("/monthly", async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ error: "Month is required" });
    }

    const [year, monthIndex] = month.split("-");
    const start = new Date(year, monthIndex - 1, 1);
    const end = new Date(year, monthIndex, 1);

    // ONLINE ORDERS
    const online = await Order.find({
      createdAt: { $gte: start, $lt: end },
    });

    // POS ORDERS
    const pos = await PosOrder.find({
      createdAt: { $gte: start, $lt: end },
    });

    const allOrders = [...online, ...pos];

    // STATUS COUNTS
    const delivered = allOrders.filter(o => o.status === "delivered").length;
    const rejected = allOrders.filter(o => o.status === "rejected").length;

    // REVENUE (ONLY DELIVERED)
    const totalRevenue = allOrders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0);

    // PAYMENT BREAKDOWN
    const paymentBreakdown = {
      cash: pos.filter(o => o.paymentMethod === "cash").length,
      upi: pos.filter(o => o.paymentMethod === "upi").length,
      online: online.filter(o => o.payment === true).length,
    };

    // TOP SELLING ITEMS
    const itemCount = {};
    allOrders.forEach(order => {
      order.items?.forEach(item => {
        itemCount[item.name] =
          (itemCount[item.name] || 0) + item.quantity;
      });
    });

    const topItems = Object.keys(itemCount)
      .map(name => ({ name, count: itemCount[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      mode: "monthly",
      totalOrders: allOrders.length,
      delivered,
      rejected,
      totalRevenue,
      avgOrderValue: Math.round(
        totalRevenue / (delivered || 1)
      ),
      onlineOrders: online.length,
      posOrders: pos.length,
      payment: paymentBreakdown,
      topItems,
      orders: allOrders, // 🔥 IMPORTANT FOR FRONTEND
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ======================================================
   DAILY REPORT
   GET /api/reports/daily?date=YYYY-MM-DD
====================================================== */
router.get("/daily", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    // ONLINE
    const online = await Order.find({
      createdAt: { $gte: start, $lt: end },
    });

    // POS
    const pos = await PosOrder.find({
      createdAt: { $gte: start, $lt: end },
    });

    const allOrders = [...online, ...pos];

    const delivered = allOrders.filter(o => o.status === "delivered").length;
    const rejected = allOrders.filter(o => o.status === "rejected").length;

    const totalRevenue = allOrders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0);

    res.json({
      mode: "daily",
      totalOrders: allOrders.length,
      delivered,
      rejected,
      totalRevenue,
      orders: allOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
