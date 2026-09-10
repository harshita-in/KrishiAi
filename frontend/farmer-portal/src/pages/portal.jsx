import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../config';
import './portal.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Disease Detection', to: '/detection' },
  { label: 'Crop Recommendation', to: '/recommendation' },
  { label: 'Marketplace', to: '/portal' },
  { label: 'Satellite NDVI', to: '/satellite' },
  { label: 'Kisan Chopal', to: '/chopal' },
  { label: 'Services', to: '/services' },
  { label: 'AI Chat', to: '/chat' },
  { label: 'Profile', to: '/profile' },
];

export default function Portal() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('farmer_token') || sessionStorage.getItem('farmer_token');

  const [activeTab, setActiveTab] = useState('sell'); // 'sell' | 'myListings' | 'offers'

  // Sell Form State
  const [cropName, setCropName] = useState(location.state?.prefillCrop || 'Wheat (गेहूं)');
  const [variety, setVariety] = useState('Sharbati / Lokwan');
  const [quantityQuintals, setQuantityQuintals] = useState('');
  const [expectedPricePerQuintal, setExpectedPricePerQuintal] = useState('');
  const [harvestDate, setHarvestDate] = useState('Ready for Dispatch');
  const [district, setDistrict] = useState('Indore');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Data lists
  const [myListings, setMyListings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (activeTab === 'myListings') fetchMyListings();
    if (activeTab === 'offers') fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchMyListings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/marketplace/farmer/my-listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMyListings(data.listings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/marketplace/farmer/offers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOffers(data.offers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    if (!cropName || !quantityQuintals || !expectedPricePerQuintal) {
      setErr('Please fill in crop name, quantity, and expected price.');
      return;
    }

    setSubmitting(true);
    setErr('');
    setMsg('');

    try {
      const res = await apiFetch('/api/marketplace/farmer/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName,
          variety,
          quantityQuintals,
          expectedPricePerQuintal,
          harvestDate,
          district,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to list produce');

      setMsg('🎉 Produce listed successfully on Wholesaler Marketplace!');
      setQuantityQuintals('');
      setExpectedPricePerQuintal('');
      setDescription('');
      setTimeout(() => {
        setMsg('');
        setActiveTab('myListings');
      }, 1500);
    } catch (error) {
      setErr(error.message || 'Error listing produce');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      const res = await apiFetch(`/api/marketplace/farmer/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMyListings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOfferResponse = async (offerId, action) => {
    try {
      const res = await apiFetch(`/api/marketplace/farmer/offers/${offerId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchOffers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="portal-shell">
      {/* Aurora Glows */}
      <div className="farmer-aurora farmer-aurora-one" />
      <div className="farmer-aurora farmer-aurora-two" />

      {/* Navigation */}
      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI B2B Connect</span>
          <span className="brand-title">Produce Marketplace</span>
        </div>

        <nav className="nav-links" aria-label="Farmer Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => (isActive ? 'nav-pill nav-pill-active' : 'nav-pill')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="nav-logout"
          type="button"
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/');
          }}
        >
          Logout
        </button>
      </header>

      {/* Main Container */}
      <main className="portal-main">
        <div className="portal-header">
          <span className="portal-kicker">🤝 Direct Farmer & Wholesaler Trade</span>
          <h1>Sell Produce Directly Without Middlemen</h1>
          <p>
            List your harvest, set your price, receive bids directly from verified regional wholesalers,
            and lock deals with zero middleman commissions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="portal-tabs-nav">
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('sell')}
          >
            <span>➕ List New Produce</span>
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'myListings' ? 'active' : ''}`}
            onClick={() => setActiveTab('myListings')}
          >
            <span>📦 My Active Listings</span>
            {myListings.length > 0 && <span className="tab-badge">{myListings.length}</span>}
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <span>💬 Wholesaler Bids & Offers</span>
            {offers.filter(o => o.status === 'pending').length > 0 && (
              <span className="tab-badge" style={{ background: '#d97706', color: '#fff' }}>
                {offers.filter(o => o.status === 'pending').length} New
              </span>
            )}
          </button>
        </div>

        {msg && (
          <div className="status-chip" style={{ background: '#dcfce7', color: '#047857', marginBottom: 20, textAlign: 'center' }}>
            {msg}
          </div>
        )}
        {err && (
          <div className="status-chip" style={{ background: '#fee2e2', color: '#b91c1c', marginBottom: 20, textAlign: 'center' }}>
            {err}
          </div>
        )}

        {/* TAB 1: SELL PRODUCE */}
        {activeTab === 'sell' && (
          <div className="sell-form-card">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', marginBottom: 6 }}>
              Publish Crop for Sale
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 22 }}>
              Verified wholesalers on the KrishiAI Wholesaler Portal will be able to see and bid on this produce.
            </p>

            <form onSubmit={handleSellSubmit} className="sell-form-grid">
              <div className="sell-input-group">
                <label htmlFor="cropInput">Crop Name</label>
                <input
                  id="cropInput"
                  className="sell-input"
                  placeholder="e.g. Wheat, Soybean, Mustard, Potato"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                />
              </div>

              <div className="sell-input-group">
                <label htmlFor="varietyInput">Variety / Grade</label>
                <input
                  id="varietyInput"
                  className="sell-input"
                  placeholder="e.g. Sharbati, Lokwan, Pusa-1121, Grade A"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                />
              </div>

              <div className="sell-input-group">
                <label htmlFor="qtyInput">Available Quantity (Quintals)</label>
                <input
                  id="qtyInput"
                  type="number"
                  step="0.5"
                  className="sell-input"
                  placeholder="e.g. 50"
                  value={quantityQuintals}
                  onChange={(e) => setQuantityQuintals(e.target.value)}
                  required
                />
              </div>

              <div className="sell-input-group">
                <label htmlFor="priceInput">Expected Price (₹ / Quintal)</label>
                <input
                  id="priceInput"
                  type="number"
                  className="sell-input"
                  placeholder="e.g. 2600"
                  value={expectedPricePerQuintal}
                  onChange={(e) => setExpectedPricePerQuintal(e.target.value)}
                  required
                />
              </div>

              <div className="sell-input-group">
                <label htmlFor="harvestInput">Harvest / Dispatch Status</label>
                <select
                  id="harvestInput"
                  className="sell-select"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                >
                  <option value="Ready for Dispatch">Ready for Immediate Dispatch</option>
                  <option value="Harvesting in 1-2 Weeks">Harvesting in 1-2 Weeks</option>
                  <option value="Stored in Farm Godown">Stored in Farm Godown</option>
                </select>
              </div>

              <div className="sell-input-group">
                <label htmlFor="distInput">Farm Location / Mandi District</label>
                <input
                  id="distInput"
                  className="sell-input"
                  placeholder="e.g. Indore, MP"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>

              <div className="sell-input-group full-width">
                <label htmlFor="descInput">Produce Description & Quality Highlights</label>
                <textarea
                  id="descInput"
                  rows="3"
                  className="sell-textarea"
                  placeholder="e.g. Cleaned grain, moisture < 11%, zero pest damage, organic certified."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-listing-btn" disabled={submitting}>
                {submitting ? 'Publishing...' : '🚀 Publish Produce to Wholesalers'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MY ACTIVE LISTINGS */}
        {activeTab === 'myListings' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>Loading your produce listings...</div>
            ) : myListings.length === 0 ? (
              <div className="sell-form-card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🌾</div>
                <h3>No active crop listings yet</h3>
                <p style={{ color: '#64748b', marginBottom: 18 }}>
                  Post your first crop listing to start receiving purchase offers from regional wholesalers.
                </p>
                <button type="button" className="portal-tab-btn active" onClick={() => setActiveTab('sell')}>
                  ➕ Post Your First Produce
                </button>
              </div>
            ) : (
              <div className="listings-grid">
                {myListings.map((item) => (
                  <div key={item._id} className="listing-card">
                    <div className="listing-card-header">
                      <div>
                        <div className="listing-crop-title">{item.cropName}</div>
                        <div className="listing-variety">{item.variety}</div>
                      </div>
                      <span className={`listing-status-tag status-${item.status}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="listing-info-grid">
                      <div className="listing-info-item">
                        <span>Quantity</span>
                        <strong>{item.quantityQuintals} Quintals</strong>
                      </div>
                      <div className="listing-info-item">
                        <span>Asking Price</span>
                        <strong style={{ color: '#047857' }}>₹{item.expectedPricePerQuintal} / Qtl</strong>
                      </div>
                      <div className="listing-info-item">
                        <span>Location</span>
                        <strong>{item.location?.district || 'Local'}</strong>
                      </div>
                      <div className="listing-info-item">
                        <span>Readiness</span>
                        <strong>{item.harvestDate}</strong>
                      </div>
                    </div>

                    {item.description && (
                      <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: 12 }}>
                        {item.description}
                      </p>
                    )}

                    <div className="listing-footer">
                      <span className="pending-bids-badge">
                        💬 {item.pendingOffersCount || 0} Offers received
                      </span>
                      <button
                        type="button"
                        className="delete-listing-btn"
                        onClick={() => handleDeleteListing(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WHOLESALER OFFERS */}
        {activeTab === 'offers' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>Checking incoming offers...</div>
            ) : offers.length === 0 ? (
              <div className="sell-form-card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📬</div>
                <h3>No bids received yet</h3>
                <p style={{ color: '#64748b' }}>
                  When wholesalers place offers on your produce, they will show up here for you to accept or decline.
                </p>
              </div>
            ) : (
              <div className="offers-grid">
                {offers.map((offer) => (
                  <div key={offer._id} className="offer-card">
                    <div>
                      <div className="offer-wholesaler-name">
                        🏢 Wholesaler: {offer.wholesalerName}
                      </div>
                      <div className="offer-crop-subtitle">
                        Produce: <strong>{offer.cropName}</strong> • Contact: {offer.wholesalerContact}
                      </div>

                      <div className="offer-deal-stats">
                        <div className="offer-stat-box">
                          <span className="offer-stat-label">Offered Price</span>
                          <span className="offer-stat-value">₹{offer.offeredPricePerQuintal} / Quintal</span>
                        </div>
                        <div className="offer-stat-box">
                          <span className="offer-stat-label">Quantity Demanded</span>
                          <span className="offer-stat-value">{offer.quantityQuintals} Quintals</span>
                        </div>
                        <div className="offer-stat-box">
                          <span className="offer-stat-label">Total Deal Value</span>
                          <span className="offer-stat-value">₹{offer.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {offer.message && (
                        <p style={{ fontSize: '0.88rem', color: '#334155', marginTop: 8 }}>
                          <strong>Wholesaler Note:</strong> "{offer.message}"
                        </p>
                      )}

                      {offer.farmerRemark && (
                        <p style={{ fontSize: '0.84rem', color: '#047857', marginTop: 4 }}>
                          <strong>Your response:</strong> {offer.farmerRemark}
                        </p>
                      )}
                    </div>

                    <div className="offer-actions">
                      {offer.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            className="accept-bid-btn"
                            onClick={() => handleOfferResponse(offer._id, 'accept')}
                          >
                            ✓ Accept Deal
                          </button>
                          <button
                            type="button"
                            className="reject-bid-btn"
                            onClick={() => handleOfferResponse(offer._id, 'reject')}
                          >
                            ✕ Decline
                          </button>
                        </>
                      ) : (
                        <span className={`listing-status-tag status-${offer.status}`}>
                          {offer.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
