import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  deliveryFee: { 
    type: Number, 
    default: 10 
  },

  // ✅ NEW FIELD
  kitchenOpen: { 
    type: Boolean, 
    default: true 
  }
});

const SettingsModel = mongoose.models.settings || mongoose.model("settings", settingsSchema);

export default SettingsModel;