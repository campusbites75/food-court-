import { OAuth2Client } from "google-auth-library";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔐 JWT generator
const createToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const googleLoginUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token missing",
      });
    }

    // ✅ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google token",
      });
    }

    const { email, name, picture, sub } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    // ✅ Find existing user
    let user = await userModel.findOne({ email });

    // ✅ Create OR update user
    if (!user) {
      user = await userModel.create({
        name,
        email,
        password: "google-auth",
        picture: picture, // 🔥 FIXED FIELD
        googleId: sub,
      });
    } else {
      // 🔥 UPDATE OLD USERS (VERY IMPORTANT)
      if (!user.picture) {
        user.picture = picture;
        await user.save();
      }
    }

    const authToken = createToken(user._id);

    res.status(200).json({
      success: true,
      token: authToken,
      user,
    });

  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Google Login Failed",
      error: error.message,
    });
  }
};

export default googleLoginUser;