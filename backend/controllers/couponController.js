import couponModel from "../models/couponModel.js";

/* ================= CREATE COUPON ================= */

const createCoupon = async (req, res) => {
  try {
    const { code, discountAmount, minOrderAmount } = req.body;

    const existing = await couponModel.findOne({
      code: code.toUpperCase()
    });

    if (existing) {
      return res.json({
        success: false,
        message: "Coupon already exists"
      });
    }

    const coupon = new couponModel({
      code: code.toUpperCase(),
      discountAmount,
      minOrderAmount
    });

    await coupon.save();

    res.json({
      success: true,
      message: "Coupon created"
    });

  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* ================= LIST COUPONS (ADMIN) ================= */

const listCoupons = async (req, res) => {
  try {
    const coupons = await couponModel
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error("LIST COUPONS ERROR:", error);

    res.status(500).json({
      success: false
    });
  }
};


/* ================= DELETE COUPON ================= */

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.body;

    await couponModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Coupon deleted"
    });

  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);

    res.status(500).json({
      success: false
    });
  }
};


/* ================= APPLY COUPON ================= */

const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.json({
        success: false,
        message: "Coupon code is required"
      });
    }

    const coupon = await couponModel.findOne({
      code: code.toUpperCase(),
      active: true
    });

    if (!coupon) {
      return res.json({
        success: false,
        message: "Invalid coupon"
      });
    }

    /* CHECK MINIMUM ORDER */
    if (subtotal < coupon.minOrderAmount) {
      return res.json({
        success: false,
        message: `Minimum order ₹${coupon.minOrderAmount} required`
      });
    }

    const discount = coupon.discountAmount;

    const finalTotal = Math.max(subtotal - discount, 0);

    // ✅ IMPORTANT: send coupon details for frontend revalidation
    res.json({
      success: true,
      discount,
      finalTotal,
      coupon: {
        code: coupon.code,
        minOrderAmount: coupon.minOrderAmount,
        discountAmount: coupon.discountAmount
      }
    });

  } catch (error) {
    console.error("APPLY COUPON ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export {
  createCoupon,
  listCoupons,
  deleteCoupon,
  applyCoupon
};
