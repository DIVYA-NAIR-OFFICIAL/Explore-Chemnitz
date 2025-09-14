// api/users.js

const connectDB = require("../Backend/config/db");
const userController = require("../Backend/Controllers/userController");
const authMiddleware = require("../Backend/middleware/authMiddleware");

module.exports = async (req, res) => {
  await connectDB();

  // Adapt authMiddleware if needed for user-specific routes
  const authResult = await new Promise(resolve => {
    authMiddleware(req, res, () => resolve({ authenticated: true }));
  }).catch(err => resolve({ authenticated: false, error: err }));

  if (!authResult.authenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // You will need to add logic here to differentiate between different user routes
  // For example, if you have a GET /users/profile, you'd handle it here.
  // If you have a dynamic route like /users/:id, you'd need api/users/[id].js

  switch (req.method) {
    case "GET":
      // Example: If your original route was router.get('/profile', ...)
      // You might need to check req.url or handle specific sub-paths.
      // For a simple GET /api/users (e.g., getAllUsers), you can call:
      // return userController.getAllUsers(req, res);
      return userController.getUserProfile(req, res); // Assuming this handles /api/users
    case "PUT":
      // Example: If your original route was router.put('/profile', ...)
      return userController.updateUserProfile(req, res);
    // ... add cases for other methods as per your Backend/routes/users.js
    default:
      res.status(405).json({ message: "Method Not Allowed" });
  }
};