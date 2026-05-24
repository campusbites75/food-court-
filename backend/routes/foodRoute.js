import express from "express";
import multer from "multer";
import path from "path";

import {
  addFood,
  listFood,
  removeFood,
  toggleFoodStatus,
  updateQuantity,
  updateImage, // ✅ NEW IMPORT
} from "../controllers/foodController.js";

const foodRouter = express.Router();


// ================================
// 📦 IMAGE STORAGE (MULTER)
// ================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});


// ================================
// 🔒 FILE FILTER (optional safety)
// ================================
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};


// ================================
// 🚀 MULTER CONFIG
// ================================
const upload = multer({
  storage,
  fileFilter,
});


// ================================
// 🛣️ ROUTES
// ================================

// ✅ Get all foods
foodRouter.get("/list", listFood);

// ✅ Add food (with image)
foodRouter.post("/add", upload.single("image"), addFood);

// ✅ Remove food
foodRouter.post("/remove", removeFood);

// ✅ Toggle food status
foodRouter.post("/toggle-status", toggleFoodStatus); // (match frontend)

// ✅ Update quantity
foodRouter.post("/update-quantity", updateQuantity);

// ✅ 🔥 NEW: Update only image
foodRouter.post("/update-image", upload.single("image"), updateImage);


// ================================
export default foodRouter;
