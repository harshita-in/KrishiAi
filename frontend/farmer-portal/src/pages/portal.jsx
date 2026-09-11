import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../config';
import './portal.css';

const navItems = [
  { label: 'Home (होम)', to: '/home', exact: true },
  { label: 'Marketplace (बाजार / फसल बेचें)', to: '/portal' },
  { label: 'Kisan Chopal (किसान चौपाल)', to: '/chopal' },
  { label: 'Services (सेवाएं व योजनाएं)', to: '/services' },
  { label: 'AI Crop Doctor (फसल डॉक्टर)', to: '/chat' },
  { label: 'Profile (प्रोफाइल)', to: '/profile' },
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
      setErr('Please fill in crop name, quantity, and expected price. (कृपया फसल का नाम, मात्रा और अपेक्षित भाव दर्ज करें।)');
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

      setMsg('🎉 Produce listed successfully on Wholesaler Marketplace! (फसल सफलतापूर्वक थोक बाजार में लिस्ट हो गई!)');
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
    if (!window.confirm('Are you sure you want to remove this listing? (क्या आप इस फसल लिस्टिंग को हटाना चाहते हैं?)')) return;
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
          <span className="brand-kicker">KrishiAI B2B Connect (कृषि एआई सीधा व्यापार)</span>
          <span className="brand-title">Produce Marketplace (फसल बिक्री बाजार)</span>
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
          Logout (लॉगआउट)
        </button>
      </header>

      {/* Main Container */}
      <main className="portal-main">
        <div className="portal-header">
          <span className="portal-kicker">🤝 Direct Farmer & Wholesaler Trade (सीधा किसान-व्यापारी व्यापार)</span>
          <h1>Sell Produce Directly Without Middlemen (बिना बिचौलियों के सीधे फसल बेचें)</h1>
          <p>
            List your harvest, set your price, receive bids directly from verified regional wholesalers,
            and lock deals with zero middleman commissions. (अपनी फसल लिस्ट करें, अपना भाव तय करें, सीधे व्यापारियों से ऑफर पाएं और बिना दलाली 100% मुनाफा कमाएं।)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="portal-tabs-nav">
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('sell')}
          >
            <span>➕ List New Produce (फसल बेचें)</span>
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'myListings' ? 'active' : ''}`}
            onClick={() => setActiveTab('myListings')}
          >
            <span>📦 My Active Listings (मेरी फसलें)</span>
            {myListings.length > 0 && <span className="tab-badge">{myListings.length}</span>}
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <span>💬 Wholesaler Bids & Offers (व्यापारियों के ऑफर)</span>
            {offers.filter(o => o.status === 'pending').length > 0 && (
              <span className="tab-badge" style={{ background: '#d97706', color: '#fff' }}>
                {offers.filter(o => o.status === 'pending').length} New (नए)
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
              Publish Crop for Sale (बिक्री के लिए फसल लिस्ट करें)
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 22 }}>
              Verified wholesalers on the KrishiAI Wholesaler Portal will be able to see and bid on this produce. (कृषि एआई से जुड़े सत्यापित व्यापारी आपकी इस फसल पर सीधे बोली लगा सकेंगे।)
            </p>

            <form onSubmit={handleSellSubmit} className="sell-form-grid">
              <div className="sell-input-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="cropInput">Crop Name (फसल का नाम)</label>
                <input
                  id="cropInput"
                  className="sell-input"
                  placeholder="e.g. Wheat, Soybean, Mustard, Cotton, Chana, Onion, Garlic... (जैसे गेहूं, सोयाबीन, सरसों, चना, प्याज...)"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  list="indianCropsList"
                  required
                />
                <datalist id="indianCropsList">
                  <option value="Wheat (गेहूं)" />
                  <option value="Paddy / Basmati (धान)" />
                  <option value="Paddy / Common (धान मोटा)" />
                  <option value="Maize (मक्का)" />
                  <option value="Bajra (बाजरा)" />
                  <option value="Jowar (ज्वार)" />
                  <option value="Barley (जौ)" />
                  <option value="Ragi (रागी)" />
                  <option value="Chana / Chickpea (चना)" />
                  <option value="Tur / Arhar (तुअर / अरहर)" />
                  <option value="Moong (मूंग)" />
                  <option value="Urad (उड़द)" />
                  <option value="Masoor (मसूर)" />
                  <option value="Soybean (सोयाबीन)" />
                  <option value="Mustard (सरसों / राई)" />
                  <option value="Groundnut (मूंगफली)" />
                  <option value="Sunflower (सूरजमुखी)" />
                  <option value="Sesame / Til (तिल)" />
                  <option value="Cotton (कपास)" />
                  <option value="Sugarcane (गन्ना)" />
                  <option value="Jute (पटसन / जूट)" />
                  <option value="Onion (प्याज)" />
                  <option value="Potato (आलू)" />
                  <option value="Tomato (टमाटर)" />
                  <option value="Garlic (लहसुन)" />
                  <option value="Ginger (अदरक)" />
                  <option value="Green Chilli (हरी मिर्च)" />
                  <option value="Red Chilli (सूखी लाल मिर्च)" />
                  <option value="Turmeric (हल्दी)" />
                  <option value="Cumin / Jeera (जीरा)" />
                  <option value="Coriander (धनिया)" />
                  <option value="Apple (सेब)" />
                  <option value="Mango (आम)" />
                  <option value="Banana (केला)" />
                </datalist>

                {/* Quick-select pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {['Wheat (गेहूं)', 'Paddy / Basmati (धान)', 'Soybean (सोयाबीन)', 'Mustard (सरसों)', 'Cotton (कपास)', 'Chana (चना)', 'Onion (प्याज)', 'Potato (आलू)', 'Garlic (लहसुन)', 'Turmeric (हल्दी)'].map(c => (
                    <button
                      key={c}
                      type="button"
                      style={{
                        padding: '3px 10px',
                        fontSize: '0.74rem',
                        borderRadius: 999,
                        background: cropName === c ? '#047857' : '#f1f5f9',
                        color: cropName === c ? '#ffffff' : '#334155',
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      onClick={() => setCropName(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sell-input-group">
                <label htmlFor="varietyInput">Variety / Grade (किस्म / ग्रेड)</label>
                <input
                  id="varietyInput"
                  className="sell-input"
                  placeholder="e.g. Sharbati, Lokwan, Pusa-1121, Grade A (जैसे शरबती, लोकवान)"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                />
              </div>

              <div className="sell-input-group">
                <label htmlFor="qtyInput">Available Quantity (उपलब्ध मात्रा - क्विंटल)</label>
                <input
                  id="qtyInput"
                  type="number"
                  step="0.5"
                  className="sell-input"
                  placeholder="e.g. 50 (क्विंटल में)"
                  value={quantityQuintals}
                  onChange={(e) => setQuantityQuintals(e.target.value)}
                  required
                />
              </div>

              <div className="sell-input-group">
                <label htmlFor="priceInput">Expected Price (अपेक्षित भाव - ₹ / क्विंटल)</label>
                <input
                  id="priceInput"
                  type="number"
                  className="sell-input"
                  placeholder="e.g. 2600 (प्रति क्विंटल)"
                  value={expectedPricePerQuintal}
                  onChange={(e) => setExpectedPricePerQuintal(e.target.value)}
                  required
                />
              </div>

              <div className="sell-input-group">
                <label htmlFor="harvestInput">Harvest / Dispatch Status (कटाई व प्रेषण स्थिति)</label>
                <select
                  id="harvestInput"
                  className="sell-select"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                >
                  <option value="Ready for Dispatch">Ready for Immediate Dispatch (तुरंत भेजने के लिए तैयार)</option>
                  <option value="Harvesting in 1-2 Weeks">Harvesting in 1-2 Weeks (1-2 सप्ताह में कटाई)</option>
                  <option value="Stored in Farm Godown">Stored in Farm Godown (खेत या गोदाम में भंडारित)</option>
                </select>
              </div>

              <div className="sell-input-group">
                <label htmlFor="distInput">Farm Location / Mandi District (खेत का स्थान / जिला)</label>
                <input
                  id="distInput"
                  className="sell-input"
                  placeholder="e.g. Indore, MP (जैसे इंदौर, म.प्र.)"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>

              <div className="sell-input-group full-width">
                <label htmlFor="descInput">Produce Description & Quality Highlights (फसल विवरण व गुणवत्ता)</label>
                <textarea
                  id="descInput"
                  rows="3"
                  className="sell-textarea"
                  placeholder="e.g. Cleaned grain, moisture < 11%, zero pest damage, organic certified. (जैसे साफ दाना, 11% से कम नमी, बिना कीड़े वाला, जैविक प्रमाण पत्र)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-listing-btn" disabled={submitting}>
                {submitting ? 'Publishing... (लिस्ट हो रहा है...)' : '🚀 Publish Produce to Wholesalers (व्यापारियों को फसल भेजें)'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MY ACTIVE LISTINGS */}
        {activeTab === 'myListings' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading your produce listings... (आपकी फसल लिस्टिंग लोड हो रही है...)</div>
            ) : myListings.length === 0 ? (
              <div className="sell-form-card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🌾</div>
                <h3>No active crop listings yet (अभी कोई फसल लिस्ट नहीं है)</h3>
                <p style={{ color: '#64748b', marginBottom: 18 }}>
                  Post your first crop listing to start receiving purchase offers from regional wholesalers. (अपनी पहली फसल लिस्ट करें ताकि क्षेत्रीय व्यापारी आपको खरीद ऑफर भेज सकें।)
                </p>
                <button type="button" className="portal-tab-btn active" onClick={() => setActiveTab('sell')}>
                  ➕ Post Your First Produce (अपनी फसल लिस्ट करें)
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
                        {item.status === 'available' ? 'Available (उपलब्ध)' : item.status === 'in_deal' ? 'In Deal (सौदा जारी)' : item.status === 'sold' ? 'Sold (बिक चुका)' : item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="listing-info-grid">
                      <div className="listing-info-item">
                        <span>Quantity (मात्रा)</span>
                        <strong>{item.quantityQuintals} Quintals (क्विंटल)</strong>
                      </div>
                      <div className="listing-info-item">
                        <span>Asking Price (मांग भाव)</span>
                        <strong style={{ color: '#047857' }}>₹{item.expectedPricePerQuintal} / Qtl</strong>
                      </div>
                      <div className="listing-info-item">
                        <span>Location (स्थान)</span>
                        <strong>{item.location?.district || 'Local'}</strong>
                      </div>
                      <div className="listing-info-item">
                        <span>Readiness (उपलब्धता)</span>
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
                        💬 {item.pendingOffersCount || 0} Offers received (ऑफर प्राप्त हुए)
                      </span>
                      <button
                        type="button"
                        className="delete-listing-btn"
                        onClick={() => handleDeleteListing(item._id)}
                      >
                        Remove (हटाएं)
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
              <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Checking incoming offers... (आए हुए ऑफर चेक हो रहे हैं...)</div>
            ) : offers.length === 0 ? (
              <div className="sell-form-card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📬</div>
                <h3>No bids received yet (अभी कोई बोली नहीं आई है)</h3>
                <p style={{ color: '#64748b' }}>
                  When wholesalers place offers on your produce, they will show up here for you to accept or decline. (जब व्यापारी आपकी फसल पर बोली लगाएंगे, वे यहां दिखेंगे जिन्हें आप स्वीकार या अस्वीकार कर सकते हैं।)
                </p>
              </div>
            ) : (
              <div className="offers-grid">
                {offers.map((offer) => (
                  <div key={offer._id} className="offer-card">
                    <div>
                      <div className="offer-wholesaler-name">
                        🏢 Wholesaler (व्यापारी): {offer.wholesalerName}
                      </div>
                      <div className="offer-crop-subtitle">
                        Produce (फसल): <strong>{offer.cropName}</strong> • Contact (संपर्क): {offer.wholesalerContact}
                      </div>

                      <div className="offer-deal-stats">
                        <div className="offer-stat-box">
                          <span className="offer-stat-label">Offered Price (व्यापारी का भाव)</span>
                          <span className="offer-stat-value">₹{offer.offeredPricePerQuintal} / Quintal</span>
                        </div>
                        <div className="offer-stat-box">
                          <span className="offer-stat-label">Quantity Demanded (मात्रा)</span>
                          <span className="offer-stat-value">{offer.quantityQuintals} Quintals (क्विंटल)</span>
                        </div>
                        <div className="offer-stat-box">
                          <span className="offer-stat-label">Total Deal Value (कुल सौदा)</span>
                          <span className="offer-stat-value">₹{offer.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {offer.message && (
                        <p style={{ fontSize: '0.88rem', color: '#334155', marginTop: 8 }}>
                          <strong>Wholesaler Note (व्यापारी संदेश):</strong> "{offer.message}"
                        </p>
                      )}

                      {offer.farmerRemark && (
                        <p style={{ fontSize: '0.84rem', color: '#047857', marginTop: 4 }}>
                          <strong>Your response (आपका उत्तर):</strong> {offer.farmerRemark}
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
                            ✓ Accept Deal (सौदा स्वीकार करें)
                          </button>
                          <button
                            type="button"
                            className="reject-bid-btn"
                            onClick={() => handleOfferResponse(offer._id, 'reject')}
                          >
                            ✕ Decline (अस्वीकार करें)
                          </button>
                        </>
                      ) : (
                        <span className={`listing-status-tag status-${offer.status}`}>
                          {offer.status === 'accepted' ? 'ACCEPTED (स्वीकृत)' : offer.status === 'rejected' ? 'REJECTED (अस्वीकृत)' : offer.status.toUpperCase()}
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
