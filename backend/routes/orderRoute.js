import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  listOrders, placeOrder, placeOrderCod, userOrders,
  verifyOrder, acceptOrder, rejectOrder, kitchenOrders,
  markPrepared, markDelivered, getBillByOrderId,
  getOrderStatus // 🔥 NEW
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/list", listOrders);
router.post("/place", authMiddleware, placeOrder);
router.post("/placecod", authMiddleware, placeOrderCod);
router.get("/userorders", authMiddleware, userOrders);
router.post("/verify", verifyOrder);
router.get("/status/:orderId", getOrderStatus); // 🔥 ADDED
router.get("/bill/:orderId", authMiddleware, getBillByOrderId);

router.post("/accept", acceptOrder);
router.post("/reject", rejectOrder);
router.get("/kitchen", kitchenOrders);
router.post("/prepared", markPrepared);
router.post("/delivered", markDelivered);

export default router;