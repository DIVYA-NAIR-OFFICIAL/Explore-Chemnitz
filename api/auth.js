// api/auth.js

// Adjust path to your authController
const authController = require("../Backend/Controllers/authController");
// Adjust path to your DB connection if needed
const connectDB = require("../Backend/config/db");

module.exports = async (req, res) => {
  await connectDB(); // Ensure DB connection

  const path = req.url; // e.g., /api/auth/register or /api/auth/login

  if (req.method === "POST") {
    if (path === "/api/auth/register") {
      return authController.register(req, res);
    } else if (path === "/api/auth/login") {
      return authController.login(req, res);
    } else {
      return res.status(404).json({ message: "Auth API endpoint not found" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};