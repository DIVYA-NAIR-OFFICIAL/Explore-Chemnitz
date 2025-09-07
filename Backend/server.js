const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

// --- Correct relative paths to your route files ---
const usersRouter = require('./routes/users');
const placesRouter = require('./routes/places');
const authRoutes = require('./routes/auth');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/places', placesRouter);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);

// Vercel Deployment
module.exports = app;