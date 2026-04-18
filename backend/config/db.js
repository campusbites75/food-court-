import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      console.error("❌ MONGODB_URL is NOT defined in environment variables");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected:", conn.connection.name);

  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1);
  }
};
