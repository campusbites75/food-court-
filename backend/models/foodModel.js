import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    productType: {
      type: String,
      required: true,
      enum: ["Packed", "Unpacked"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ✅ ADD THIS (MAIN FIX)
    quantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const foodModel =
  mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;
