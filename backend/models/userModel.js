import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  password: { 
    type: String, 
    required: true 
  },

  // ⭐ FIX: make phone optional & NOT unique
  phone: {
    type: String,
    default: null,
    sparse: true, // ✅ allows multiple nulls
  },

  googleId: {
    type: String,
    default: null,
  },

  image: {
    type: String,
    default: "",
  },

  cartData: {
    type: Object,
    default: {},
  }

}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;