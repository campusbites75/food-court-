import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  deliveryFee: {
    type: Number,
    default: 10
  },
  kitchenOpen: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model("Settings", settingsSchema);
