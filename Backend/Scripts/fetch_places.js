// Backend/script/fetch_places.js

const mongoose = require('mongoose');
const axios = require('axios');
const Place = require('../models/Place');

mongoose.connect('mongodb+srv://divyapankajakshannair:Ytqm0Ky9NJ2w9M1g@cluster0.d5vhnae.mongodb.net/chemnitzCulture', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fetchPlaces() {
  try {
    const overpassQuery = `
      [out:json][timeout:25];
      area["name"="Chemnitz"]->.searchArea;
      (
        node["tourism"](area.searchArea);
        way["tourism"](area.searchArea);
        relation["tourism"](area.searchArea);
      );
      out center;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      { headers: { 'Content-Type': 'text/plain' } }
    );

    const elements = response.data.elements;

    const places = elements.map((el, index) => ({
      osmId: el.id.toString(),
      name: el.tags?.name || `Unnamed Place ${index}`,
      description: el.tags?.description || el.tags?.tourism || 'Tourist place',
      openingHours: el.tags?.opening_hours || 'Not available',
      tickets: el.tags?.ticket || 'N/A',
      location: {
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
      },
    }));

    const validPlaces = places.filter(p => p.location.lat && p.location.lng);

    for (const place of validPlaces) {
      await Place.updateOne(
        { osmId: place.osmId },
        { $set: place },
        { upsert: true }
      );
    }

    console.log(`✅ ${validPlaces.length} places inserted/updated.`);
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error fetching or saving places:', err.message);
    mongoose.disconnect();
  }
}

fetchPlaces();
