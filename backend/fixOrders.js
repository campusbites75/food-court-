import mongoose from "mongoose";
import orderModel from "./models/orderModel.js";
import userModel from "./models/userModel.js";

const MONGO_URL = "mongodb+srv://food_court:FOODCOURT2026@cluster0.mo2fed1.mongodb.net/food_court_db";

const fixOrders = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ DB Connected");

    const orders = await orderModel.find({ userId: null });

    console.log(`🔍 Found ${orders.length} orders to fix`);

    let fixedCount = 0;

    for (const order of orders) {
      const email = order.address?.email;
      const phone = order.address?.phone;
      const name = order.address?.fullName;

      let user = null;

      // 🔥 1. Try EMAIL (BEST)
      if (email) {
        user = await userModel.findOne({ email });
      }

      // 🔥 2. Try PHONE (SECOND BEST)
      if (!user && phone) {
        user = await userModel.findOne({ phone });
      }

      // 🔥 3. Try NAME (LAST FALLBACK)
      if (!user && name) {
        user = await userModel.findOne({
          name: { $regex: new RegExp("^" + name + "$", "i") }
        });
      }

      if (user) {
        await orderModel.updateOne(
          { _id: order._id },
          { $set: { userId: user._id } }
        );

        fixedCount++;

        console.log(`✅ Linked order ${order._id} → ${user.email || user.name}`);
      } else {
        console.log(
          `❌ No user found for order ${order._id} (email: ${email || "N/A"}, phone: ${phone || "N/A"}, name: ${name || "N/A"})`
        );
      }
    }

    console.log(`🎉 DONE: ${fixedCount} orders fixed`);

    process.exit();

  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  }
};

fixOrders();
