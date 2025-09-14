// api/places.js

const connectDB = require("../Backend/config/db");
const placeController = require("../Backend/Controllers/placeController");

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === "GET") {
    return placeController.getAllPlaces(req, res);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};