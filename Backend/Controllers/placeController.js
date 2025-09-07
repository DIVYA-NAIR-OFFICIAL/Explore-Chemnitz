const Place = require('../models/Place');

exports.getAllPlaces = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = new RegExp(`^${req.query.category}$`, 'i');
    }
    const places = await Place.find(filter);
    res.json(places);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get places' });
  }
};
