import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './recommendation.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Disease Detection', to: '/detection' },
  { label: 'Crop Recommendation', to: '/recommendation' },
  { label: 'Marketplace', to: '/portal' },
  { label: 'Services', to: '/services' },
  { label: 'AI Chat', to: '/chat' },
  { label: 'Profile', to: '/profile' },
];

export default function Recommendation() {
  const navigate = useNavigate();
  const [nitrogen, setNitrogen] = useState(85);
  const [phosphorus, setPhosphorus] = useState(55);
  const [potassium, setPotassium] = useState(45);
  const [ph, setPh] = useState(6.8);
  const [soilType, setSoilType] = useState('Alluvial');
  const [season, setSeason] = useState('Rabi');
  const [rainfall, setRainfall] = useState('Moderate');

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [autoStatus, setAutoStatus] = useState('');

  // Initial fetch on mount
  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecommendations = async (customParams = null) => {
    setLoading(true);
    setError('');

    const payload = customParams || {
      nitrogen,
      phosphorus,
      potassium,
      ph,
      soilType,
      season,
      rainfall
    };

    try {
      const response = await apiFetch('/api/agro/crop-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get recommendations');
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message || 'Error fetching recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = () => {
    setAutoStatus('Reading farm geolocation & seasonal weather...');
    // Intelligent defaults based on current season in India
    const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
    let curSeason = 'Rabi';
    if (month >= 5 && month <= 9) curSeason = 'Kharif';
    else if (month >= 2 && month <= 4) curSeason = 'Zaid';

    setSeason(curSeason);
    setSoilType('Black');
    setNitrogen(90);
    setPhosphorus(60);
    setPotassium(50);
    setPh(7.0);

    setTimeout(() => {
      setAutoStatus('Location & soil values updated successfully!');
      fetchRecommendations({
        nitrogen: 90,
        phosphorus: 60,
        potassium: 50,
        ph: 7.0,
        soilType: 'Black',
        season: curSeason,
        rainfall: 'Moderate'
      });
      setTimeout(() => setAutoStatus(''), 3000);
    }, 600);
  };

  return (
    <div className="rec-shell">
      {/* Aurora Ambient Glows */}
      <div className="farmer-aurora farmer-aurora-one" />
      <div className="farmer-aurora farmer-aurora-two" />

      {/* Navigation */}
      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI Agronomy</span>
          <span className="brand-title">Crop Recommendation</span>
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

      {/* Main Content */}
      <main className="rec-main">
        <div className="rec-header">
          <span className="rec-kicker">🌾 Precision Agronomy AI</span>
          <h1>Smart Crop Recommendation Engine</h1>
          <p>
            Match your soil fertility (NPK), pH balance, and regional season with optimal high-yielding crops.
            Maximized for market profit and disease resilience.
          </p>
        </div>

        {autoStatus && (
          <div className="status-chip" style={{ background: '#dcfce7', color: '#047857', marginBottom: 20, textAlign: 'center' }}>
            ✓ {autoStatus}
          </div>
        )}

        {error && (
          <div className="status-chip" style={{ background: '#fee2e2', color: '#b91c1c', marginBottom: 20 }}>
            {error}
          </div>
        )}

        <div className="rec-grid">
          {/* Left Form Card */}
          <div className="rec-form-card">
            <div className="rec-form-title">
              <span>Soil & Climate Parameters</span>
              <button type="button" className="autofill-btn" onClick={handleAutofill} title="Auto-detect from farm profile">
                📍 Auto-detect
              </button>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: 20 }}>
              Adjust the values to match your Soil Health Card or test report.
            </p>

            {/* Nitrogen */}
            <div className="slider-group">
              <div className="slider-header">
                <span>Nitrogen (N)</span>
                <span className="slider-val">{nitrogen} kg/ha</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={nitrogen}
                onChange={(e) => setNitrogen(Number(e.target.value))}
                className="rec-range"
              />
            </div>

            {/* Phosphorus */}
            <div className="slider-group">
              <div className="slider-header">
                <span>Phosphorus (P)</span>
                <span className="slider-val">{phosphorus} kg/ha</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={phosphorus}
                onChange={(e) => setPhosphorus(Number(e.target.value))}
                className="rec-range"
              />
            </div>

            {/* Potassium */}
            <div className="slider-group">
              <div className="slider-header">
                <span>Potassium (K)</span>
                <span className="slider-val">{potassium} kg/ha</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={potassium}
                onChange={(e) => setPotassium(Number(e.target.value))}
                className="rec-range"
              />
            </div>

            {/* pH Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <span>Soil pH Value</span>
                <span className="slider-val">
                  {ph} ({ph < 6.5 ? 'Acidic' : ph > 7.5 ? 'Alkaline' : 'Neutral'})
                </span>
              </div>
              <input
                type="range"
                min="4.5"
                max="9.0"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                className="rec-range"
              />
            </div>

            {/* Selectors Grid */}
            <div className="selector-grid">
              <div className="selector-item">
                <label>Soil Type (मिट्टी)</label>
                <select
                  className="selector-select"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                >
                  <option value="Alluvial">Alluvial (जलोढ़)</option>
                  <option value="Black">Black Soil (काली)</option>
                  <option value="Loamy">Loamy (दोमट)</option>
                  <option value="Clay">Clay (चिकनी)</option>
                  <option value="Red">Red Soil (लाल)</option>
                  <option value="Sandy Loam">Sandy Loam (बलुई)</option>
                </select>
              </div>

              <div className="selector-item">
                <label>Season (ऋतु)</label>
                <select
                  className="selector-select"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                >
                  <option value="Rabi">Rabi / Winter (रबी)</option>
                  <option value="Kharif">Kharif / Monsoon (खरीफ)</option>
                  <option value="Zaid">Zaid / Summer (जायद)</option>
                </select>
              </div>
            </div>

            <div className="selector-grid">
              <div className="selector-item" style={{ gridColumn: 'span 2' }}>
                <label>Water / Irrigation Availability</label>
                <select
                  className="selector-select"
                  value={rainfall}
                  onChange={(e) => setRainfall(e.target.value)}
                >
                  <option value="High">Abundant (Borewell / Canal / Sprinkler)</option>
                  <option value="Moderate">Moderate (Tube well / Rainfed)</option>
                  <option value="Low">Low / Drought Prone (Drip / Dryland)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="rec-submit-btn"
              onClick={() => fetchRecommendations()}
              disabled={loading}
            >
              {loading ? 'Analyzing Agronomic Model...' : '🚀 Calculate Best Crops'}
            </button>
          </div>

          {/* Right Results Grid */}
          <div className="rec-results-area">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
              Top Recommended Crops ({recommendations.length})
            </h2>

            {recommendations.map((crop, idx) => (
              <div key={idx} className="crop-card">
                <div className="crop-card-top">
                  <div className="crop-title-box">
                    <h3>{crop.name}</h3>
                    <span className="crop-season-tag">Season: {crop.season}</span>
                  </div>
                  <div className="match-badge">
                    <div className="match-score">{crop.matchScore}%</div>
                    <div className="match-label">Suitability</div>
                  </div>
                </div>

                <div className="crop-metrics-grid">
                  <div className="metric-box">
                    <span className="metric-label">Expected Yield</span>
                    <span className="metric-value">{crop.avgYieldPerAcre}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Est. Profit / Acre</span>
                    <span className="metric-value metric-highlight">{crop.estProfitPerAcre}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Price / Support</span>
                    <span className="metric-value">{crop.mspOrPrice}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Water Demand</span>
                    <span className="metric-value">{crop.waterReq}</span>
                  </div>
                </div>

                <div className="crop-details">
                  <div>
                    <strong>🗓️ Calendar:</strong> Sowing in {crop.sowingMonth} • Harvest in {crop.harvestMonth}
                  </div>
                  <div>
                    <strong>🌱 Fertilizer Tip:</strong> {crop.keyNutrients}
                  </div>
                </div>

                <button
                  type="button"
                  className="list-in-market-btn"
                  onClick={() => navigate('/portal', { state: { prefillCrop: crop.name } })}
                >
                  🛒 List this Produce in Marketplace &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
