//
// === Replace the code below with your actual server.js content ===
//
// This is an example to demonstrate the changes. Your existing code
// for middleware, routes, and database connections should stay.
//
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
require('dotenv').config({ path: 'Backend/.env' });

// --- Middleware ---
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => console.error('MongoDB connection error:', err));


// --- Routes ---
// Assuming you have a folder structure like this:
// Backend/routes/auth.js
// Backend/routes/users.js
const authRoutes = require('./Backend/routes/auth');
const userRoutes = require('./Backend/routes/users');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- The section you need to change ---
//
// This is the code you need to remove or comment out.
//
// app.use(express.static(path.join(__dirname, 'public')));
//
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// --- This is the new, correct code for Vercel ---
//
// This is the one line that Vercel needs to run your serverless function.
// It exports the Express app, which Vercel will use to handle requests.
module.exports = app;