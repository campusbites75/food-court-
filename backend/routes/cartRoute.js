import express from 'express';
import { 
  addToCart, 
  getCart, 
  removeFromCart, 
  mergeCart 
} from '../controllers/cartController.js';

const cartRouter = express.Router();

// ===============================
// CART ROUTES
// ===============================

cartRouter.post("/get", getCart);
cartRouter.post("/add", addToCart);
cartRouter.post("/remove", removeFromCart);

// 🔥 NEW - MERGE GUEST CART AFTER LOGIN
cartRouter.post("/merge", mergeCart);

export default cartRouter;
