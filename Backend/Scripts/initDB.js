require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');  
const User = require('../models/User');    
const userData = require('./chemnitzCulture.users.json'); 
const placesData = require('./chemnitzCulture.places.json'); 

async function initDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    await Place.deleteMany({});
    await User.deleteMany({});

    const cleanedPlaces = placesData.map(({ _id, ...rest }) => rest);

    const cleanedUsers = userData
      .map(({ _id, favorites, ...rest }) => {
        let fixedFavorites = [];
        if (Array.isArray(favorites)) {
          fixedFavorites = favorites.map(fav => {
            if (typeof fav === 'string') return fav; 
            if (fav && fav.$oid) return fav.$oid;  
            return fav; 
          });
        }
        return { ...rest, favorites: fixedFavorites };
      })
      .filter(user => {
        if (!user.username) {
          console.warn('User missing username, skipping:', user);
          return false;
        }
        return true;
      });

    await Place.insertMany(cleanedPlaces);
    await User.insertMany(cleanedUsers);

    console.log('Places and Users inserted');
    process.exit(0);
  } catch (err) {
    console.error('DB connection or insertion error:', err);
    process.exit(1);
  }
}

initDB();
