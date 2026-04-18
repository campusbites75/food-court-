import userModel from "../models/userModel.js";

// =================================
// ADD TO CART
// =================================
const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Guest mode → frontend handles cart
    if (!userId) {
      return res.json({
        success: true,
        message: "Guest cart handled on frontend",
      });
    }

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let cartData = userData.cartData || {};

    cartData[itemId] = (cartData[itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({
      success: true,
      message: "Added To Cart",
      cartData,
    });

  } catch (error) {
    console.log("AddToCart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =================================
// REMOVE FROM CART
// =================================
const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId) {
      return res.json({
        success: true,
        message: "Guest cart handled on frontend",
      });
    }

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let cartData = userData.cartData || {};

    if (cartData[itemId] > 1) {
      cartData[itemId] -= 1;
    } else {
      delete cartData[itemId];
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({
      success: true,
      message: "Removed From Cart",
      cartData,
    });

  } catch (error) {
    console.log("RemoveFromCart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =================================
// GET CART
// =================================
const getCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({
        success: true,
        cartData: {},
      });
    }

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.json({
        success: true,
        cartData: {},
      });
    }

    res.json({
      success: true,
      cartData: userData.cartData || {},
    });

  } catch (error) {
    console.log("GetCart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =================================
// MERGE GUEST CART INTO DB
// =================================
const mergeCart = async (req, res) => {
  try {
    const { userId, guestCart } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let dbCart = userData.cartData || {};

    if (guestCart && typeof guestCart === "object") {
      for (const itemId in guestCart) {
        dbCart[itemId] = (dbCart[itemId] || 0) + guestCart[itemId];
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData: dbCart });

    res.json({
      success: true,
      message: "Cart merged successfully",
      cartData: dbCart,
    });

  } catch (error) {
    console.log("MergeCart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export { addToCart, removeFromCart, getCart, mergeCart };
