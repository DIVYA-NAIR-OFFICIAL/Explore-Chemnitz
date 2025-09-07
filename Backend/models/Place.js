const mongoose = require('mongoose');
const placeSchema = new mongoose.Schema({
  osmId: { type: String, unique: true },
  name: String,
  description: String,
  category: String,
  website: String,
  location: {
    lat: Number,
    lng: Number,
  },
  imageUrl: String,  // Add this field to store the image path or URL
});
module.exports = mongoose.model('Place', placeSchema);
