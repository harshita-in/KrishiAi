const express = require('express');
const router = express.Router();
const {
  createProduceListing,
  getMyListings,
  deleteProduceListing,
  updateListingStatus,
  getFarmerOffers,
  respondToOffer,
  getAllMarketplaceListings,
  createDealOffer,
  getWholesalerDeals
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authmiddleware');

// --- PUBLIC & SHARED DISCOVERY ---
// GET /api/marketplace/listings
router.get('/listings', getAllMarketplaceListings);

// --- FARMER PROTECTED ROUTES ---
router.post('/farmer/listings', protect('farmer'), createProduceListing);
router.get('/farmer/my-listings', protect('farmer'), getMyListings);
router.delete('/farmer/listings/:id', protect('farmer'), deleteProduceListing);
router.put('/farmer/listings/:id/status', protect('farmer'), updateListingStatus);
router.get('/farmer/offers', protect('farmer'), getFarmerOffers);
router.post('/farmer/offers/:offerId/respond', protect('farmer'), respondToOffer);

// --- WHOLESALER PROTECTED ROUTES ---
router.post('/wholesaler/deals', protect('wholesaler'), createDealOffer);
router.get('/wholesaler/my-deals', protect('wholesaler'), getWholesalerDeals);

module.exports = router;
