import express from "express";
import SettingsModel from "../models/settingsModel.js";

const router = express.Router();

/* ============================
   GET ALL SETTINGS
============================ */
router.get("/", async (req, res) => {
  try {
    let settings = await SettingsModel.findOne();

    if (!settings) {
      settings = await SettingsModel.create({
        deliveryFee: 10,
        kitchenOpen: true
      });
    }

    return res.status(200).json({
      success: true,
      deliveryFee: settings.deliveryFee,
      kitchenOpen: settings.kitchenOpen
    });

  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings"
    });
  }
});


/* ============================
   UPDATE DELIVERY FEE
============================ */
router.post("/update-delivery-fee", async (req, res) => {
  try {
    const { deliveryFee } = req.body;

    if (deliveryFee === undefined || isNaN(deliveryFee)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery fee"
      });
    }

    let settings = await SettingsModel.findOne();

    if (!settings) {
      settings = await SettingsModel.create({ deliveryFee });
    } else {
      settings.deliveryFee = deliveryFee;
      await settings.save();
    }

    return res.status(200).json({
      success: true,
      deliveryFee: settings.deliveryFee
    });

  } catch (error) {
    console.error("❌ Error updating settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update settings"
    });
  }
});


/* ============================
   SET KITCHEN STATUS (LIVE SYNC 🔥)
============================ */
router.post("/set-kitchen", async (req, res) => {
  try {
    const { kitchenOpen } = req.body;

    if (typeof kitchenOpen !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid kitchen status"
      });
    }

    let settings = await SettingsModel.findOne();

    if (!settings) {
      settings = await SettingsModel.create({
        deliveryFee: 10,
        kitchenOpen
      });
    } else {
      settings.kitchenOpen = kitchenOpen;
      await settings.save();
    }

    // 🔥 SAFE SOCKET EMIT
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit("kitchenStatusUpdated", settings.kitchenOpen);
        console.log("⚡ Kitchen status broadcast:", settings.kitchenOpen);
      }
    } catch (socketError) {
      console.error("⚠️ Socket emit error:", socketError);
    }

    return res.status(200).json({
      success: true,
      kitchenOpen: settings.kitchenOpen
    });

  } catch (error) {
    console.error("❌ Error setting kitchen:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update kitchen status"
    });
  }
});

export default router;
