const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const usersRouter = require('./routes/users');
const placesRouter = require('./routes/places');
const authRoutes = require('./routes/auth');
const favoriteRoutes = require('./routes/favoriteRoutes');

require('dotenv').config({ path: './.env' });
console.log('ENV JWT_SECRET:', process.env.JWT_SECRET);

const app = express();

app.use(cors());
app.use(express.json());

// Frontend static files served from root
app.use(express.static(path.join(__dirname, '../Frontend')));

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use('/api/users', usersRouter);
app.use('/api/places', placesRouter);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);

// The second express.static is redundant, Vercel's configuration handles this.
// Remove it to avoid unexpected behavior.
// app.use(express.static(path.join(__dirname, 'public')));

//
// This is the code that must be removed.
// A Vercel serverless function does not listen on a port.
//
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// This is the crucial line for Vercel deployment.
// It exports the Express app, allowing Vercel to use it as a serverless function.
module.exports = app;