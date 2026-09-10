import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './home.css';

export default function Home({ portalLabel, storageKeyPrefix }) {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem(`${storageKeyPrefix}_user`) || sessionStorage.getItem(`${storageKeyPrefix}_user`);
  const user = rawUser ? JSON.parse(rawUser) : null;
  const token = localStorage.getItem(`${storageKeyPrefix}_token`) || sessionStorage.getItem(`${storageKeyPrefix}_token`);

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'deals' | 'mandi'

  // Listings & Filter state
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Bids / Deals State
  const [myDeals, setMyDeals] = useState([]);

  // Mandi Data
  const [mandiRates, setMandiRates] = useState([]);

  // Bid Modal State
  const [modalListing, setModalListing] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidQuantity, setBidQuantity] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [bidFeedback, setBidFeedback] = useState('');

  // Initial Fetch
  useEffect(() => {
    fetchListings();
    fetchMandiRates();
  }, []);

  useEffect(() => {
    if (activeTab === 'deals') {
      fetchMyDeals();
    }
  }, [activeTab]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/marketplace/listings');
      const data = await res.json();
      if (res.ok) {
        setListings(data.listings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDeals = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/marketplace/wholesaler/my-deals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMyDeals(data.deals || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMandiRates = async () => {
    try {
      const res = await apiFetch('/api/agro/mandi-rates');
      const data = await res.json();
      if (res.ok) {
        setMandiRates(data.rates || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openBidModal = (listing) => {
    setModalListing(listing);
    setBidPrice(listing.expectedPricePerQuintal);
    setBidQuantity(listing.quantityQuintals);
    setBidMessage('');
    setBidFeedback('');
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidPrice || !bidQuantity) return;

    setBiddingLoading(true);
    setBidFeedback('');

    try {
      const res = await apiFetch('/api/marketplace/wholesaler/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId: modalListing._id,
          offeredPricePerQuintal: Number(bidPrice),
          quantityQuintals: Number(bidQuantity),
          message: bidMessage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place bid');

      setBidFeedback('🎉 Purchase bid sent to farmer successfully!');
      setTimeout(() => {
        setModalListing(null);
        setActiveTab('deals');
      }, 1400);
    } catch (err) {
      setBidFeedback(err.message || 'Error sending bid');
    } finally {
      setBiddingLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(`${storageKeyPrefix}_token`);
    localStorage.removeItem(`${storageKeyPrefix}_user`);
    sessionStorage.removeItem(`${storageKeyPrefix}_token`);
    sessionStorage.removeItem(`${storageKeyPrefix}_user`);
    navigate('/');
  };

  // Filter listings
  const filteredListings = listings.filter((item) => {
    const matchesCrop = selectedCrop === 'all' || item.cropName.toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesDistrict = !selectedDistrict || (item.location?.district && item.location.district.toLowerCase().includes(selectedDistrict.toLowerCase()));
    const matchesSearch = !searchQuery ||
      item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCrop && matchesDistrict && matchesSearch;
  });

  // Total available stock calculation
  const totalStockQuintals = listings.reduce((sum, item) => sum + (Number(item.quantityQuintals) || 0), 0);
  const activeBidsCount = myDeals.filter(d => d.status === 'pending').length;

  return (
    <div className="wholesaler-shell">
      {/* Header Navigation */}
      <header className="wholesaler-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI Wholesale B2B</span>
          <span className="brand-title">Procurement Portal</span>
        </div>

        <div className="wholesaler-nav-links">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            🌾 Browse Farm Produce
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
            onClick={() => setActiveTab('deals')}
          >
            💼 My Bids & Deals {activeBidsCount > 0 && `(${activeBidsCount})`}
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'mandi' ? 'active' : ''}`}
            onClick={() => setActiveTab('mandi')}
          >
            📈 APMC Mandi Rates
          </button>
        </div>

        <div className="wholesaler-user-pill">
          <span className="wholesaler-name-tag">🏢 {user?.name || 'Wholesaler'}</span>
          <button className="nav-logout-btn" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Live Mandi Ticker */}
      {mandiRates.length > 0 && (
        <div className="wholesaler-mandi-ticker">
          <span style={{ fontWeight: 800, color: '#047857' }}>📊 LIVE MANDI RATES:</span>
          {mandiRates.map((r, i) => (
            <span key={i} style={{ color: '#1e293b' }}>
              <strong>{r.commodity}</strong>: <strong style={{ color: '#047857' }}>₹{r.modalPrice}</strong>/qtl ({r.changePercent})
            </span>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="wholesaler-main">
        {/* Metric Stats Banner */}
        <div className="stats-banner">
          <div className="stat-box">
            <span className="stat-box-label">Available Farm Produce</span>
            <div className="stat-box-value">{totalStockQuintals.toLocaleString('en-IN')} Qtl</div>
            <div className="stat-box-sub">Across verified farm listings</div>
          </div>
          <div className="stat-box">
            <span className="stat-box-label">My Active Bids</span>
            <div className="stat-box-value">{activeBidsCount}</div>
            <div className="stat-box-sub">Awaiting farmer response</div>
          </div>
          <div className="stat-box">
            <span className="stat-box-label">Accepted Contracts</span>
            <div className="stat-box-value">
              {myDeals.filter(d => d.status === 'accepted').length}
            </div>
            <div className="stat-box-sub" style={{ color: '#047857' }}>Ready for dispatch/logistics</div>
          </div>
        </div>

        {/* TAB 1: BROWSE PRODUCE */}
        {activeTab === 'browse' && (
          <div>
            {/* Filter Bar */}
            <div className="filter-bar">
              <input
                type="text"
                className="filter-input"
                placeholder="🔍 Search crop, variety, or farmer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                className="filter-select"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              >
                <option value="all">All Crops</option>
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Mustard">Mustard (सरसों)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Paddy">Paddy / Rice (धान)</option>
                <option value="Onion">Onion (प्याज)</option>
                <option value="Potato">Potato (आलू)</option>
              </select>

              <input
                type="text"
                className="filter-select"
                style={{ width: 160 }}
                placeholder="District / State"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              />

              <button
                type="button"
                className="nav-logout-btn"
                style={{ background: '#047857', color: '#fff', borderColor: '#047857' }}
                onClick={fetchListings}
              >
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 50 }}>Loading produce listings from farms...</div>
            ) : filteredListings.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 24,
                padding: 50,
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚜</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064e3b', marginBottom: 6 }}>
                  No farm produce matching current filters
                </h3>
                <p style={{ color: '#64748b' }}>
                  Try adjusting your search criteria or switch to All Crops to discover listings from local farmers.
                </p>
              </div>
            ) : (
              <div className="produce-grid">
                {filteredListings.map((listing) => (
                  <div key={listing._id} className="produce-card">
                    <div className="produce-card-header">
                      <div>
                        <h2 className="produce-crop-name">{listing.cropName}</h2>
                        <div className="produce-variety">Variety: {listing.variety}</div>
                      </div>
                      <span className="produce-farmer-badge">
                        ✓ Verified Farmer
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: 10 }}>
                      👨‍🌾 <strong>Farmer:</strong> {listing.farmerName} • 📍 {listing.location?.district || 'Central Mandi Zone'}
                    </div>

                    <div className="produce-details-grid">
                      <div className="produce-metric-item">
                        <span>Quantity Available</span>
                        <strong>{listing.quantityQuintals} Quintals</strong>
                      </div>
                      <div className="produce-metric-item">
                        <span>Farmer Price</span>
                        <strong style={{ color: '#047857' }}>₹{listing.expectedPricePerQuintal} / Qtl</strong>
                      </div>
                      <div className="produce-metric-item">
                        <span>Total Lot Value</span>
                        <strong>₹{(listing.quantityQuintals * listing.expectedPricePerQuintal).toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="produce-metric-item">
                        <span>Dispatch Readiness</span>
                        <strong>{listing.harvestDate}</strong>
                      </div>
                    </div>

                    {listing.description && (
                      <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: 16, lineHeight: 1.5 }}>
                        "{listing.description}"
                      </p>
                    )}

                    <button
                      type="button"
                      className="bid-action-btn"
                      onClick={() => openBidModal(listing)}
                    >
                      🤝 Place Purchase Offer / Bid
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY BIDS & DEALS TRACKER */}
        {activeTab === 'deals' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', marginBottom: 18 }}>
              Procurement Orders & Active Bids ({myDeals.length})
            </h2>

            {myDeals.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 24,
                padding: 40,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📝</div>
                <h3>No bids placed yet</h3>
                <p style={{ color: '#64748b', marginBottom: 16 }}>
                  Browse farm produce and place bids to initiate direct farm procurement deals.
                </p>
                <button
                  type="button"
                  className="bid-action-btn"
                  style={{ width: 'auto', padding: '10px 24px' }}
                  onClick={() => setActiveTab('browse')}
                >
                  🌾 Browse Farm Listings
                </button>
              </div>
            ) : (
              <div className="deals-tracker-list">
                {myDeals.map((deal) => (
                  <div key={deal._id} className="wholesaler-deal-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
                          {deal.cropName} ({deal.quantityQuintals} Quintals)
                        </h3>
                        <span className={`deal-status-pill pill-${deal.status}`}>
                          {deal.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: 12 }}>
                        Farmer: <strong>{deal.farmer?.name || 'Verified Farmer'}</strong> • Contact: {deal.farmer?.email || 'Via Portal'}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                        <div style={{ background: '#f8fafc', padding: '8px 14px', borderRadius: 12 }}>
                          <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
                            Offered Rate
                          </span>
                          <strong style={{ color: '#047857' }}>₹{deal.offeredPricePerQuintal} / Quintal</strong>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '8px 14px', borderRadius: 12 }}>
                          <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
                            Total Contract Value
                          </span>
                          <strong>₹{deal.totalAmount.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                      {deal.farmerRemark && (
                        <p style={{ fontSize: '0.86rem', color: '#047857', marginTop: 10 }}>
                          <strong>Farmer Remark:</strong> {deal.farmerRemark}
                        </p>
                      )}
                    </div>

                    <div>
                      {deal.status === 'accepted' && (
                        <button
                          type="button"
                          className="print-slip-btn"
                          onClick={() => window.print()}
                        >
                          📄 Print Deal Confirmation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APMC MANDI INTELLIGENCE */}
        {activeTab === 'mandi' && (
          <div className="mandi-table-card">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', marginBottom: 6 }}>
              Live APMC Market Rates & Arbitrage Opportunities
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 20 }}>
              Compare mandi prices across major Indian grain hubs to find optimal procurement pricing.
            </p>

            <table className="mandi-table">
              <thead>
                <tr>
                  <th>Commodity</th>
                  <th>Mandi / Market</th>
                  <th>State</th>
                  <th>Variety</th>
                  <th>Modal Price</th>
                  <th>Daily Change</th>
                  <th>Govt MSP</th>
                </tr>
              </thead>
              <tbody>
                {mandiRates.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.commodity}</strong></td>
                    <td>{item.market}</td>
                    <td>{item.state}</td>
                    <td>{item.variety}</td>
                    <td><strong style={{ color: '#047857', fontSize: '1.02rem' }}>₹{item.modalPrice}</strong> / Qtl</td>
                    <td>
                      <span style={{ color: item.isPositive ? '#059669' : '#dc2626', fontWeight: 700 }}>
                        {item.changePercent}
                      </span>
                    </td>
                    <td>{item.msp ? `₹${item.msp}` : 'Market Driven'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* BID / PURCHASE OFFER MODAL */}
      {modalListing && (
        <div className="modal-overlay" onClick={() => setModalListing(null)}>
          <div className="bid-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Submit Purchase Offer</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalListing(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <strong style={{ color: '#064e3b', fontSize: '1.1rem' }}>{modalListing.cropName}</strong>
              <div style={{ fontSize: '0.86rem', color: '#64748b' }}>
                Farmer: {modalListing.farmerName} • Asking: ₹{modalListing.expectedPricePerQuintal}/qtl
              </div>
            </div>

            <form onSubmit={handlePlaceBid}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 4 }}>
                  Your Offered Price (₹ / Quintal)
                </label>
                <input
                  type="number"
                  className="filter-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 4 }}>
                  Demanded Quantity (Quintals)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="filter-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={bidQuantity}
                  onChange={(e) => setBidQuantity(e.target.value)}
                  required
                />
              </div>

              {/* Real-time Total calculation */}
              <div className="deal-calc-box">
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#065f46' }}>
                  Total Contract Amount:
                </span>
                <span className="deal-calc-val">
                  ₹{(Number(bidPrice) * Number(bidQuantity) || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 4 }}>
                  Procurement / Delivery Notes
                </label>
                <textarea
                  rows="2"
                  className="filter-input"
                  style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  placeholder="e.g. Ready for farm gate pickup within 48 hours; prompt bank transfer upon loading."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                />
              </div>

              {bidFeedback && (
                <div style={{
                  padding: 10,
                  borderRadius: 12,
                  marginBottom: 12,
                  background: bidFeedback.includes('successfully') ? '#dcfce7' : '#fee2e2',
                  color: bidFeedback.includes('successfully') ? '#047857' : '#b91c1c',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  {bidFeedback}
                </div>
              )}

              <button
                type="submit"
                className="bid-action-btn"
                disabled={biddingLoading}
              >
                {biddingLoading ? 'Submitting Bid...' : '🚀 Confirm & Send Offer to Farmer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
