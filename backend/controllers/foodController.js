import foodModel from "../models/foodModel.js";
import fs from "fs";

/* ================= ADD FOOD ================= */
const addFood = async (req, res) => {
  try {
    const { name, description, price, category, productType } = req.body;

    if (!req.file) {
      return res.json({
        success: false,
        message: "Image is required",
      });
    }

    if (!productType) {
      return res.json({
        success: false,
        message: "Product type is required",
      });
    }

    const normalizedType =
      String(productType || "").trim().toLowerCase() === "packed"
        ? "Packed"
        : "Unpacked";

    const newFood = new foodModel({
      name,
      description,
      price,
      category,
      productType: normalizedType,
      image: req.file.filename,
      isActive: true,
      quantity: 0, // ✅ default quantity
    });

    await newFood.save();

    res.json({
      success: true,
      message: "Food added successfully",
    });

  } catch (error) {
    console.error("ADD FOOD ERROR:", error);
    res.json({
      success: false,
      message: "Error adding food",
    });
  }
};

/* ================= LIST FOOD ================= */
const listFood = async (req, res) => {
  try {
    const isAdmin = req.query.admin === "true";

    let foods;

    if (isAdmin) {
      foods = await foodModel
        .find({})
        .populate("category")
        .sort({ createdAt: -1 });
    } else {
      foods = await foodModel
        .find({ isActive: true })
        .populate("category")
        .sort({ createdAt: -1 });
    }

    const updatedFoods = foods.map((item) => ({
      ...item._doc,
      image: item.image
        ? `https://food-court-20n0.onrender.com/images/${item.image}`
        : null,
    }));

    res.json({
      success: true,
      data: updatedFoods,
    });

  } catch (error) {
    console.error("LIST FOOD ERROR:", error);
    res.json({
      success: false,
      message: "Error fetching food list",
    });
  }
};

/* ================= REMOVE FOOD ================= */
const removeFood = async (req, res) => {
  try {
    const { id } = req.body;

    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({
        success: false,
        message: "Food not found",
      });
    }

    if (food.image) {
      fs.unlink(`uploads/${food.image}`, (err) => {
        if (err) console.log("Image delete error:", err);
      });
    }

    await foodModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Food removed successfully",
    });

  } catch (error) {
    console.error("REMOVE FOOD ERROR:", error);
    res.json({
      success: false,
      message: "Error removing food",
    });
  }
};

/* ================= UPDATE FOOD ================= */
const updateFood = async (req, res) => {
  try {
    const { id, name, description, price, category, productType } = req.body;

    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({
        success: false,
        message: "Food not found",
      });
    }

    if (req.file) {
      if (food.image) {
        fs.unlink(`uploads/${food.image}`, (err) => {
          if (err) console.log("Image delete error:", err);
        });
      }
      food.image = req.file.filename;
    }

    const normalizedType =
      String(productType || "").trim().toLowerCase() === "packed"
        ? "Packed"
        : "Unpacked";

    food.name = name;
    food.description = description;
    food.price = price;
    food.category = category;
    food.productType = normalizedType;

    await food.save();

    res.json({
      success: true,
      message: "Food updated successfully",
    });

  } catch (error) {
    console.error("UPDATE FOOD ERROR:", error);
    res.json({
      success: false,
      message: "Error updating food",
    });
  }
};

/* ================= UPDATE QUANTITY ================= */
const updateQuantity = async (req, res) => {
  try {
    let { id, quantity } = req.body;

    quantity = Number(quantity);

    // ✅ Proper validation (IMPORTANT FIX)
    if (isNaN(quantity) || quantity < 0) {
      return res.json({
        success: false,
        message: "Invalid quantity",
      });
    }

    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({
        success: false,
        message: "Food not found",
      });
    }

    // ✅ Update quantity
    food.quantity = quantity;

    // 🔥 FIX: Sync status with quantity
    if (quantity === 0) {
      food.isActive = false;
    } else {
      food.isActive = true;
    }

    await food.save();

    res.json({
      success: true,
      message: "Quantity updated successfully",
      quantity: food.quantity,
      isActive: food.isActive,
    });

  } catch (error) {
    console.error("UPDATE QUANTITY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating quantity",
    });
  }
};
/* ================= TOGGLE FOOD STATUS ================= */
const toggleFoodStatus = async (req, res) => {
  try {
    const { id } = req.body;

    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({
        success: false,
        message: "Food not found",
      });
    }

    food.isActive = !food.isActive;
    await food.save();

    res.json({
      success: true,
      message: `Food ${food.isActive ? "resumed" : "paused"} successfully`,
      isActive: food.isActive,
    });

  } catch (error) {
    console.error("TOGGLE STATUS ERROR:", error);
    res.json({
      success: false,
      message: "Error updating food status",
    });
  }
};

export {
  addFood,
  listFood,
  removeFood,
  updateFood,
  toggleFoodStatus,
  updateQuantity, // ✅ NEW EXPORT
};
