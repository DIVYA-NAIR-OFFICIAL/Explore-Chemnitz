const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Place = require('../models/Place'); // make sure you import Place model
const authMiddleware = require('../middleware/authMiddleware');

// Get all favorites
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // from middleware

    const user = await User.findById(userId).populate('favorites');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle favorite place (add or remove)
router.post('/toggle/:placeId', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // from middleware
    const placeOsmId = req.params.placeId;

    if (!placeOsmId || typeof placeOsmId !== 'string' || placeOsmId.trim() === '') {
      return res.status(400).json({ message: 'Invalid place ID' });
    }

    const place = await Place.findOne({ osmId: placeOsmId });
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Use place._id (ObjectId) in favorites array
    const index = user.favorites.findIndex(favId => favId.toString() === place._id.toString());

    if (index === -1) {
      user.favorites.push(place._id);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    return res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:placeId', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const placeOsmId = req.params.placeId;

    if (!placeOsmId || typeof placeOsmId !== 'string' || placeOsmId.trim() === '') {
      return res.status(400).json({ message: 'Invalid place ID' });
    }

    const place = await Place.findOne({ osmId: placeOsmId });
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove place._id from favorites
    user.favorites = user.favorites.filter(
      favId => favId.toString() !== place._id.toString()
    );

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;
