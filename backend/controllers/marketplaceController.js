const ProduceListing = require('../models/produceListing');
const DealOffer = require('../models/dealOffer');
const Farmer = require('../models/farmer');
const Wholesaler = require('../models/wholesaler');

// ====================================================
// FARMER ACTIONS
// ====================================================

// 1. Create a new produce listing
exports.createProduceListing = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const {
      cropName,
      variety,
      quantityQuintals,
      expectedPricePerQuintal,
      harvestDate,
      district,
      state,
      description,
      imageUrl
    } = req.body;

    if (!cropName || !quantityQuintals || !expectedPricePerQuintal) {
      return res.status(400).json({ error: 'Crop name, quantity, and expected price are required' });
    }

    const listing = new ProduceListing({
      farmer: farmerId,
      farmerName: farmer.name,
      farmerContact: farmer.email,
      cropName: cropName.trim(),
      variety: variety || 'Standard',
      quantityQuintals: Number(quantityQuintals),
      expectedPricePerQuintal: Number(expectedPricePerQuintal),
      harvestDate: harvestDate || 'Ready now',
      location: {
        district: district || 'Local Mandi',
        state: state || 'India',
        latitude: farmer.location?.latitude,
        longitude: farmer.location?.longitude
      },
      description: description || '',
      imageUrl: imageUrl || '',
      status: 'active'
    });

    await listing.save();
    res.status(201).json({ message: 'Produce listed successfully', listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get listings posted by the logged-in farmer
exports.getMyListings = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const listings = await ProduceListing.find({ farmer: farmerId }).sort({ createdAt: -1 });

    // Attach count of pending offers for each listing
    const listingsWithOfferCount = await Promise.all(
      listings.map(async (item) => {
        const offerCount = await DealOffer.countDocuments({ listing: item._id, status: 'pending' });
        return {
          ...item.toObject(),
          pendingOffersCount: offerCount
        };
      })
    );

    res.json({ listings: listingsWithOfferCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Delete or cancel a listing
exports.deleteProduceListing = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const listing = await ProduceListing.findOneAndDelete({ _id: id, farmer: farmerId });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    // Cancel any pending offers for this listing
    await DealOffer.updateMany({ listing: id, status: 'pending' }, { status: 'rejected', farmerRemark: 'Listing was removed by farmer' });

    res.json({ message: 'Listing removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Update status (e.g. sold)
exports.updateListingStatus = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const listing = await ProduceListing.findOneAndUpdate(
      { _id: id, farmer: farmerId },
      { status },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    res.json({ message: 'Status updated', listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Get all offers received by the farmer
exports.getFarmerOffers = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const offers = await DealOffer.find({ farmer: farmerId })
      .populate('listing', 'cropName variety quantityQuintals expectedPricePerQuintal imageUrl')
      .sort({ createdAt: -1 });

    res.json({ offers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Farmer responds to offer (accept / reject)
exports.respondToOffer = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { offerId } = req.params;
    const { action, remark } = req.body; // action: 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be accept or reject' });
    }

    const offer = await DealOffer.findOne({ _id: offerId, farmer: farmerId });
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found or unauthorized' });
    }

    offer.status = action === 'accept' ? 'accepted' : 'rejected';
    offer.farmerRemark = remark || (action === 'accept' ? 'Offer accepted. Please proceed with payment/dispatch coordination.' : 'Offer declined.');
    await offer.save();

    if (action === 'accept') {
      await ProduceListing.findByIdAndUpdate(offer.listing, { status: 'under_negotiation' });
    }

    res.json({ message: `Offer ${offer.status} successfully`, offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ====================================================
// WHOLESALER & PUBLIC ACTIONS
// ====================================================

// 7. Browse all active produce listings with search and filter
exports.getAllMarketplaceListings = async (req, res) => {
  try {
    const { crop, search, district, maxPrice, sort } = req.query;

    const query = { status: { $in: ['active', 'under_negotiation'] } };

    if (crop && crop !== 'all') {
      query.cropName = new RegExp(`^${crop}$`, 'i');
    }

    if (district) {
      query['location.district'] = new RegExp(district, 'i');
    }

    if (maxPrice) {
      query.expectedPricePerQuintal = { $lte: Number(maxPrice) };
    }

    if (search) {
      query.$or = [
        { cropName: new RegExp(search, 'i') },
        { variety: new RegExp(search, 'i') },
        { farmerName: new RegExp(search, 'i') },
        { 'location.district': new RegExp(search, 'i') }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { expectedPricePerQuintal: 1 };
    if (sort === 'price_desc') sortOptions = { expectedPricePerQuintal: -1 };
    if (sort === 'qty_desc') sortOptions = { quantityQuintals: -1 };

    const listings = await ProduceListing.find(query).sort(sortOptions);
    res.json({ listings, count: listings.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 8. Wholesaler places an offer/bid on a listing
exports.createDealOffer = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const wholesaler = await Wholesaler.findById(wholesalerId);
    if (!wholesaler) {
      return res.status(404).json({ error: 'Wholesaler profile not found' });
    }

    const { listingId, offeredPricePerQuintal, quantityQuintals, message } = req.body;

    const listing = await ProduceListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Produce listing not found' });
    }

    const qty = Number(quantityQuintals) || listing.quantityQuintals;
    const price = Number(offeredPricePerQuintal);

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid offered price per quintal is required' });
    }

    const totalAmount = Math.round(price * qty);

    const offer = new DealOffer({
      listing: listing._id,
      farmer: listing.farmer,
      wholesaler: wholesalerId,
      wholesalerName: wholesaler.name,
      wholesalerContact: wholesaler.email,
      cropName: listing.cropName,
      offeredPricePerQuintal: price,
      quantityQuintals: qty,
      totalAmount,
      message: message || 'Interested in direct procurement of this produce.',
      status: 'pending'
    });

    await offer.save();

    res.status(201).json({ message: 'Offer submitted to farmer successfully!', offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 9. Wholesaler gets all their sent bids and active deals
exports.getWholesalerDeals = async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const deals = await DealOffer.find({ wholesaler: wholesalerId })
      .populate('listing', 'cropName variety expectedPricePerQuintal location imageUrl status')
      .populate('farmer', 'name email location')
      .sort({ createdAt: -1 });

    res.json({ deals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
