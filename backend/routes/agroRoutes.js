const express = require('express');
const router = express.Router();
const {
  diagnoseCropDisease,
  recommendCrops,
  getMandiRates,
  getWeatherAdvisory
} = require('../controllers/agroIntelligenceController');

// All agro-intelligence routes are openly accessible for farmers and wholesalers
router.post('/disease-detect', diagnoseCropDisease);
router.post('/crop-recommend', recommendCrops);
router.get('/mandi-rates', getMandiRates);
router.get('/weather-advisory', getWeatherAdvisory);

module.exports = router;
