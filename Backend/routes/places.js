const express = require('express');
const router = express.Router();
const placeController = require('../Controllers/placeController');

router.get('/', placeController.getAllPlaces);

module.exports = router;
