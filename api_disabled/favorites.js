// api/favorites.js

const connectDB = require("../Backend/config/db");
const User = require("../Backend/models/User");
const authMiddleware = require("../Backend/middleware/authMiddleware");

module.exports = async (req, res) => {
  await connectDB();

  // Adapt authMiddleware for serverless context
  // This is a simplified adaptation. Your actual authMiddleware might need more work.
  const authResult = await new Promise(resolve => {
    authMiddleware(req, res, () => resolve({ authenticated: true }));
  }).catch(err => resolve({ authenticated: false, error: err }));

  if (!authResult.authenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const userId = req.userId; // Assuming authMiddleware sets req.userId

      const user = await User.findById(userId).populate("favorites");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.status(200).json({ favorites: user.favorites });
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};