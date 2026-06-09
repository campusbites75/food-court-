import express from "express";
import authMiddleware from "../middleware/auth.js";
import Order from "../models/orderModel.js"; // make sure this import exists
import {
  listOrders, placeOrder, placeOrderCod, userOrders,
  verifyOrder, acceptOrder, rejectOrder, kitchenOrders,
  markPrepared, markDelivered, getBillByOrderId,
  getOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/list", listOrders);
router.post("/place", authMiddleware, placeOrder);
router.post("/placecod", authMiddleware, placeOrderCod);
router.get("/userorders", authMiddleware, userOrders);
router.post("/verify", verifyOrder);
router.get("/status/:orderId", getOrderStatus);
router.get("/bill/:orderId", authMiddleware, getBillByOrderId);

router.post("/accept", acceptOrder);
router.post("/reject", rejectOrder);
router.get("/kitchen", kitchenOrders);
router.post("/prepared", markPrepared);
router.post("/delivered", markDelivered);

// Generic status update (accept/reject by order _id)
router.patch("/:id", async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
