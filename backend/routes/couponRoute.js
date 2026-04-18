import express from "express";
import {
  createCoupon,
  listCoupons,
  deleteCoupon,
  applyCoupon
} from "../controllers/couponController.js";

const couponRouter = express.Router();

/* CREATE COUPON (ADMIN) */
couponRouter.post("/create", createCoupon);

/* GET ALL COUPONS (ADMIN) */
couponRouter.get("/list", listCoupons);

/* DELETE COUPON (ADMIN) */
couponRouter.post("/delete", deleteCoupon);

/* APPLY COUPON (CUSTOMER) */
couponRouter.post("/apply", applyCoupon);

export default couponRouter;