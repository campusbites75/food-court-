import SettingsModel from "../models/settingsModel.js";

/* ================= GET DELIVERY FEE ================= */
export const getDeliveryFee = async (req, res) => {
  try {
    let settings = await SettingsModel.findOne();

    if (!settings) {
      settings = await SettingsModel.create({ deliveryFee: 10 });
    }

    res.json({
      success: true,
      deliveryFee: settings.deliveryFee,
    });

  } catch (error) {
    console.error("GET DELIVERY FEE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching delivery fee",
    });
  }
};

/* ================= UPDATE DELIVERY FEE ================= */
export const updateDeliveryFee = async (req, res) => {
  try {
    const { deliveryFee } = req.body;

    if (deliveryFee === undefined) {
      return res.json({
        success: false,
        message: "Delivery fee is required",
      });
    }

    let settings = await SettingsModel.findOne();

    if (!settings) {
      settings = await SettingsModel.create({ deliveryFee });
    } else {
      settings.deliveryFee = deliveryFee;
      await settings.save();
    }

    res.json({
      success: true,
      message: "Delivery fee updated",
    });

  } catch (error) {
    console.error("UPDATE DELIVERY FEE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error updating delivery fee",
    });
  }
};
