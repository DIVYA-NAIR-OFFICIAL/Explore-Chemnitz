const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const User = require('../models/User');
const Place = require('../models/Place');
const authenticateJWT = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined. Did you load your .env file?');
}

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Please enter username, email, and password.' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const payload = { userId: newUser._id, username: newUser.username, email: newUser.email };
    console.log('Signing JWT with secret:', JSON.stringify(JWT_SECRET));
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2y' });
    console.log('Issued token:', token);

    res.json({ token, username: newUser.username, email: newUser.email });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Login endpoint

router.post('/login', async (req, res) => {
  console.log('Login request body:', req.body); // ✅ This is the correct place
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    const payload = { userId: user._id, username: user.username, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2y' });
    console.log('Issued token:', token);

    res.json({ token, username: user.username, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error.' });
    console.log('User found:', user);
console.log('Entered password:', password);
console.log('Stored hash:', user.password);
console.log('Password match:', await bcrypt.compare(password, user.password));
  }
});

// PUT /api/users/update-username
router.put('/update-username', authMiddleware, async (req, res) => {
  const userId = req.userId; // ✅ Matches what the middleware sets
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ msg: 'Username is required.' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ username: updatedUser.username });
  } catch (err) {
    console.error('Error updating username:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Add to favorites
router.post('/favorites/:placeId', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const placeId = req.params.placeId;

    if (!user.favorites.includes(placeId)) {
      user.favorites.push(placeId);
      await user.save();
    }

    res.status(200).json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding favorite', error });
  }
});

// Remove from favorites
router.delete('/favorites/:placeId', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const placeId = req.params.placeId;

    user.favorites = user.favorites.filter(id => id.toString() !== placeId);
    await user.save();

    res.status(200).json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing favorite', error });
  }
});

// Get all favorites
router.get('/favorites', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error });
  }
});

// DELETE /api/users/delete-account
router.delete('/delete-account', authenticateJWT, async (req, res) => {
  try {
    const userId = req.userId;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ msg: 'Account deleted successfully.' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
});
module.exports = router;
