const express = require('express');
const router = express.Router();
const {
  diagnoseCropDisease,
  recommendCrops,
  getMandiRates,
  getWeatherAdvisory,
  getPricePrediction,
  getSatelliteNdviData
} = require('../controllers/agroIntelligenceController');

// All agro-intelligence routes are openly accessible for farmers and wholesalers
router.post('/disease-detect', diagnoseCropDisease);
router.post('/crop-recommend', recommendCrops);
router.get('/mandi-rates', getMandiRates);
router.get('/weather-advisory', getWeatherAdvisory);
router.get('/price-prediction', getPricePrediction);
router.get('/satellite-ndvi', getSatelliteNdviData);

module.exports = router;
