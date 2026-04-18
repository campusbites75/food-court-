import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Get token from Authorization header
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;

      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // 2️⃣ Fallback (optional)
    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    // 3️⃣ If no token → block request
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, Login Again",
      });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIX: Handle both 'id' and 'userId'
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // 5️⃣ Attach user to request
    req.user = {
      id: String(userId), // ensure consistent type
    };

    console.log("✅ AUTH USER:", req.user); // debug log

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

export default authMiddleware;
