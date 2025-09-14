const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

// --- Import routes ---
const usersRouter = require('./routes/users');
const placesRouter = require('./routes/places');
const authRoutes = require('./routes/auth');
const favoriteRoutes = require('./routes/favoriteRoutes');

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Database Connection ---
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));



// --- API Routes ---
app.use('/api/users', usersRouter);
app.use('/api/places', placesRouter);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);

// --- Vercel Deployment ---
module.exports = app;