// ./routes/categoryRoute.js

import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Category from "../models/Category.js";

const router = express.Router();

// =================================
// MULTER CONFIG (SAVE INSIDE uploads)
// =================================

const uploadPath = path.join("uploads");

// Ensure upload folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// =================================
// GET ALL CATEGORIES
// =================================
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
});

// =================================
// CREATE CATEGORY
// =================================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    const newCategory = new Category({
      name,
      description,
      image: req.file.filename,
    });

    await newCategory.save();

    res.json({
      success: true,
      message: "Category added successfully",
      category: newCategory,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error saving category",
    });
  }
});

// =================================
// UPDATE CATEGORY
// =================================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    if (req.file) {
      // Delete old image
      if (category.image) {
        const oldImagePath = path.join("uploads", category.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      category.image = req.file.filename;
    }

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating category",
    });
  }
});

// =================================
// DELETE CATEGORY
// =================================
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.image) {
      const imagePath = path.join("uploads", category.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
    });
  }
});

export default router;
