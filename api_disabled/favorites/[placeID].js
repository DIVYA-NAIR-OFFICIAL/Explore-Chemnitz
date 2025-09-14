// api/favorites/[placeId].js

const connectDB = require("../Backend/config/db");
const User = require("../Backend/models/User");
const Place = require("../Backend/models/Place");
const authMiddleware = require("../Backend/middleware/authMiddleware");

module.exports = async (req, res) => {
  await connectDB();

  // Adapt authMiddleware
  const authResult = await new Promise(resolve => {
    authMiddleware(req, res, () => resolve({ authenticated: true }));
  }).catch(err => resolve({ authenticated: false, error: err }));

  if (!authResult.authenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { placeId } = req.query; // Vercel captures dynamic segments in req.query

  if (!placeId || typeof placeId !== "string" || placeId.trim() === "") {
    return res.status(400).json({ message: "Invalid place ID" });
  }

  const place = await Place.findOne({ osmId: placeId });
  if (!place) {
    return res.status(404).json({ message: "Place not found" });
  }

  const user = await User.findById(req.userId); // Assuming authMiddleware sets req.userId
  if (!user) return res.status(404).json({ message: "User not found" });

  switch (req.method) {
    case "POST": // For toggling favorite
      const index = user.favorites.findIndex(favId => favId.toString() === place._id.toString());

      if (index === -1) {
        user.favorites.push(place._id);
      } else {
        user.favorites.splice(index, 1);
      }
      await user.save();
      return res.status(200).json({ favorites: user.favorites });

    case "DELETE": // For removing favorite
      user.favorites = user.favorites.filter(
        favId => favId.toString() !== place._id.toString()
      );
      await user.save();
      return res.status(200).json({ favorites: user.favorites });

    default:
      res.status(405).json({ message: "Method Not Allowed" });
  }
};