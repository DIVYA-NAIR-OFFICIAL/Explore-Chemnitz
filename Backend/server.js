const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// --- Import routes with the correct relative paths ---
const usersRouter = require('./Backend/routes/users');
const placesRouter = require('./Backend/routes/places');
const authRoutes = require('./Backend/routes/auth');
const favoriteRoutes = require('./Backend/routes/favoriteRoutes');

// Vercel handles environment variables automatically, so you can remove this line.
// require('dotenv').config({ path: './.env' });
console.log('ENV JWT_SECRET:', process.env.JWT_SECRET);

const app = express();

app.use(cors());
app.use(express.json());

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
// This is the one line that Vercel needs to run your serverless function.
module.exports = app;