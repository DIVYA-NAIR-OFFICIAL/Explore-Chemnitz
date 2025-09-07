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
app.use(express.json());   // <--- this is very important!

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

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
