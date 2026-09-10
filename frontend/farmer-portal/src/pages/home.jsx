import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './home.css';

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

const features = [
  {
    title: 'Crop Disease Detection',
    description: 'Instant leaf scanning for fungal & bacterial diseases, severity scoring, organic desi remedies & chemical dosages.',
    to: '/detection',
    badge: 'AI Vision'
  },
  {
    title: 'Crop Recommendation',
    description: 'Precision agronomic matching using Soil NPK values, pH level, season, yield forecasts & profit per acre.',
    to: '/recommendation',
    badge: 'Precision Agri'
  },
  {
    title: 'Satellite NDVI Farm Mapping',
    description: 'Track vegetation vigor, soil moisture stress, and chlorophyll index from Sentinel-2 satellite orbit.',
    to: '/satellite',
    badge: 'Space GIS'
  },
  {
    title: 'Kisan Chopal Community',
    description: 'Ask farming questions, get verified advice from KVK agronomists, and share organic desi formulations.',
    to: '/chopal',
    badge: 'Kisan Forum'
  },
  {
    title: 'Produce Marketplace',
    description: 'Sell harvested crops directly to verified wholesalers at your price with 0% middleman commission.',
    to: '/portal',
    badge: 'Direct B2B'
  },
  {
    title: 'Voice-Enabled AI Chatbot',
    description: 'Speak in Hindi or English using your microphone, receive instant farming guidance and audio read-aloud.',
    to: '/chat',
    badge: 'Voice + Multimodal'
  },
  {
    title: 'Kisan Bahi-Khata & Schemes',
    description: 'Record seasonal farm expenses, calculate net profit, and explore central agricultural subsidies.',
    to: '/services',
    badge: 'Financial & Welfare'
  },
  {
    title: 'Farmer Profile & Field Setup',
    description: 'Update your registered crops, view saved field coordinates, and manage account credentials.',
    to: '/profile',
    badge: 'My Farm'
  }
];

export default function Home({ portalLabel, storageKeyPrefix }) {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem(`${storageKeyPrefix}_user`) || sessionStorage.getItem(`${storageKeyPrefix}_user`);
  const user = rawUser ? JSON.parse(rawUser) : null;
  const welcomeName = useMemo(() => user?.name || 'Farmer', [user]);

  // Weather and Mandi State
  const [weatherData, setWeatherData] = useState(null);
  const [mandiRates, setMandiRates] = useState([]);

  // Live Farm Location State
  const [farmLocation, setFarmLocation] = useState({
    latitude: null,
    longitude: null,
    placeName: '',
    status: 'detecting', // 'detecting' | 'connected' | 'denied' | 'unsupported'
  });

  // AI Mandi Price Prediction State
  const [selectedCommodity, setSelectedCommodity] = useState('Wheat');
  const [predictionData, setPredictionData] = useState(null);

  // WhatsApp Alert Simulator State
  const [waOpen, setWaOpen] = useState(false);
  const [dealAccepted, setDealAccepted] = useState(false);

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setFarmLocation(prev => ({ ...prev, status: 'unsupported' }));
      return;
    }

    setFarmLocation(prev => ({ ...prev, status: 'detecting' }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let detectedPlace = '';
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const addr = geoData.address || {};
            const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
            const state = addr.state || '';
            detectedPlace = [city, state].filter(Boolean).join(', ');
          }
        } catch (err) {
          // fallback
        }

        if (!detectedPlace) {
          detectedPlace = lat > 24 ? 'Northern Farm Zone, India' : 'Central Agro Zone, India';
        }

        setFarmLocation({
          latitude: lat,
          longitude: lng,
          placeName: detectedPlace,
          status: 'connected'
        });

        // Update weather advisory for this exact location
        apiFetch(`/api/agro/weather-advisory?lat=${lat}&lng=${lng}`)
          .then(res => res.json())
          .then(data => {
            if (data.advisory) setWeatherData(data.advisory);
          })
          .catch(() => {});

        // Save location to backend database
        const token =
          localStorage.getItem(`${storageKeyPrefix}_token`) ||
          sessionStorage.getItem(`${storageKeyPrefix}_token`);

        if (token) {
          apiFetch(`/api/${storageKeyPrefix}/location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ latitude: lat, longitude: lng })
          }).catch(() => {});
        }
      },
      (err) => {
        console.warn('Geolocation access denied or timed out:', err);
        setFarmLocation(prev => {
          if (prev.latitude && prev.longitude) {
            return { ...prev, status: 'connected' };
          }
          return { ...prev, status: 'denied' };
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    // 1. Fetch Mandi Rates
    apiFetch('/api/agro/mandi-rates')
      .then(res => res.json())
      .then(data => {
        if (data.rates) setMandiRates(data.rates.slice(0, 6));
      })
      .catch(err => console.error('Mandi fetch error:', err));

    // 2. Fetch initial Weather Advisory
    apiFetch('/api/agro/weather-advisory')
      .then(res => res.json())
      .then(data => {
        if (data.advisory) setWeatherData(data.advisory);
      })
      .catch(err => console.error('Weather fetch error:', err));

    // 3. Load saved location from DB profile
    const token =
      localStorage.getItem(`${storageKeyPrefix}_token`) ||
      sessionStorage.getItem(`${storageKeyPrefix}_token`);

    if (token) {
      apiFetch(`/api/${storageKeyPrefix}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const loc = data.user?.location;
          if (loc && Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude)) {
            setFarmLocation(prev => ({
              ...prev,
              latitude: loc.latitude,
              longitude: loc.longitude,
              placeName: prev.placeName || 'Saved Farm Coordinates',
              status: 'connected'
            }));
          }
        })
        .catch(() => {});
    }

    // 4. Request live GPS coordinates
    requestLiveLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKeyPrefix]);

  // Fetch AI Price Prediction when selectedCommodity changes
  useEffect(() => {
    apiFetch(`/api/agro/price-prediction?commodity=${selectedCommodity}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setPredictionData(data);
        }
      })
      .catch(err => console.error('Price prediction fetch error:', err));
  }, [selectedCommodity]);

  const logout = () => {
    localStorage.removeItem(`${storageKeyPrefix}_token`);
    localStorage.removeItem(`${storageKeyPrefix}_user`);
    sessionStorage.removeItem(`${storageKeyPrefix}_token`);
    sessionStorage.removeItem(`${storageKeyPrefix}_user`);
    navigate('/');
  };

  return (
    <div className="farmer-shell">
      <div className="farmer-aurora farmer-aurora-one" />
      <div className="farmer-aurora farmer-aurora-two" />

      {/* Navigation */}
      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI Ecosystem</span>
          <span className="brand-title">{portalLabel || 'Farmer'} Portal</span>
        </div>

        <nav className="nav-links" aria-label="Farmer navigation">
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

        <button className="nav-logout" type="button" onClick={logout}>
          Logout
        </button>
      </header>

      {/* Live Mandi Ticker */}
      {mandiRates.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(16, 185, 129, 0.2)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '8px 24px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          fontSize: '0.86rem',
          zIndex: 3,
          position: 'relative'
        }}>
          <span style={{ fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📈</span> LIVE MANDI BHAV:
          </span>
          {mandiRates.map((rate, i) => (
            <span key={i} style={{ color: '#1e293b' }}>
              <strong>{rate.commodity}</strong> ({rate.market}):{' '}
              <strong style={{ color: '#047857' }}>₹{rate.modalPrice}</strong>/qtl{' '}
              <span style={{ color: rate.isPositive ? '#059669' : '#dc2626', fontWeight: 700 }}>
                {rate.changePercent}
              </span>
            </span>
          ))}
        </div>
      )}

      <main className="farmer-main">
        {/* Hero Section */}
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="hero-badge">Welcome back, {welcomeName} 👋</span>
            <h1>Grow smarter with KrishiAI Precision Agricultural Suite</h1>
            <p>
              Diagnose crop diseases instantly with AI vision, match optimal crops to your soil fertility,
              track live mandi rates, and trade directly with regional wholesalers without middlemen.
            </p>

            {/* Live Farm Location Display Card */}
            <div className="location-hero-card">
              <div className="location-left-group">
                <div className="location-pin-circle">📍</div>
                <div className="location-meta">
                  <span className="location-meta-title">Live Farm Location (GPS)</span>
                  <div className="location-meta-address">
                    {farmLocation.status === 'connected' && (
                      farmLocation.placeName || `${farmLocation.latitude?.toFixed(4)}° N, ${farmLocation.longitude?.toFixed(4)}° E`
                    )}
                    {farmLocation.status === 'detecting' && '📡 Detecting farm GPS coordinates...'}
                    {farmLocation.status === 'denied' && '⚠️ Location Permission Needed for Localized Weather'}
                    {farmLocation.status === 'unsupported' && 'Geolocation not supported by this browser'}
                  </div>
                  {farmLocation.status === 'connected' && farmLocation.latitude && (
                    <span className="location-meta-coords">
                      Lat: {farmLocation.latitude.toFixed(4)}° • Lng: {farmLocation.longitude.toFixed(4)}° (GPS Locked)
                    </span>
                  )}
                </div>
              </div>

              <div>
                {farmLocation.status === 'connected' ? (
                  <button
                    type="button"
                    className="location-action-btn"
                    onClick={requestLiveLocation}
                    title="Refresh current GPS coordinates"
                  >
                    🔄 Update GPS
                  </button>
                ) : (
                  <button
                    type="button"
                    className="location-action-btn"
                    style={{ background: '#047857', color: '#ffffff' }}
                    onClick={requestLiveLocation}
                  >
                    📍 Enable Location
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Weather & Farm Advisory Card */}
          <div className="hero-stat-card" style={{ background: 'rgba(255,255,255,0.85)' }}>
            <div>
              <span className="stat-label">🌦️ Smart Agro-Weather</span>
              <strong style={{ display: 'block', marginTop: 4 }}>
                {weatherData ? `${weatherData.currentWeather.tempCelsius}°C • ${weatherData.currentWeather.condition}` : '28°C • Partly Sunny'}
              </strong>
              <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: 4 }}>
                Humidity: {weatherData?.currentWeather.humidityPercent || 62}% • Wind: {weatherData?.currentWeather.windSpeedKmh || 11} km/h
              </div>
            </div>

            {weatherData?.agriAdvisories && (
              <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 14, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#047857', fontWeight: 800 }}>
                  ✓ Advisory: {weatherData.agriAdvisories[0].hindiBadge}
                </span>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {weatherData.agriAdvisories[0].message}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* AI Mandi Price Prediction & Decision Engine */}
        <section className="prediction-section">
          <div className="prediction-card">
            <div className="prediction-header-row">
              <div>
                <span className="hero-badge" style={{ marginBottom: 6 }}>
                  📈 Machine Learning Price Forecast • APMC Mandi Intel
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#064e3b', margin: '4px 0' }}>
                  AI Mandi Price Prediction & "HOLD vs SELL" Advisor
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                  Real-time price trajectory modeling across 14 days based on arrival volumes, export mandates, and seasonality.
                </p>
              </div>

              <div className="commodity-selector">
                {['Wheat', 'Soybean', 'Mustard', 'Cotton', 'Onion', 'Potato', 'Paddy'].map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`commodity-btn ${selectedCommodity === c ? 'active' : ''}`}
                    onClick={() => setSelectedCommodity(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {predictionData && (
              <div className="prediction-body-grid">
                {/* Left Intel Card */}
                <div className="decision-intel-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        AI Model Recommendation
                      </span>
                      <span className={predictionData.recommendation === 'HOLD_PRODUCE' ? 'recommendation-badge-hold' : 'recommendation-badge-sell'}>
                        {predictionData.recommendation === 'HOLD_PRODUCE' ? '📈 HOLD PRODUCE' : '⚡ SELL NOW'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
                          Current APMC Modal Price
                        </span>
                        <strong style={{ fontSize: '1.45rem', color: '#0f172a', display: 'block', marginTop: 2 }}>
                          ₹{predictionData.currentPrice}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>per Quintal (Today)</span>
                      </div>

                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
                          Projected 10-Day Peak
                        </span>
                        <strong style={{ fontSize: '1.45rem', color: '#047857', display: 'block', marginTop: 2 }}>
                          ₹{predictionData.peakPrice}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: predictionData.projectedChange?.startsWith('+') ? '#059669' : '#dc2626', fontWeight: 700 }}>
                          {predictionData.projectedChange} expected
                        </span>
                      </div>
                    </div>

                    <div style={{
                      background: '#ffffff',
                      borderRadius: 16,
                      padding: '14px',
                      border: '1px solid #e2e8f0',
                      marginBottom: 16
                    }}>
                      <strong style={{ fontSize: '0.86rem', color: '#064e3b', display: 'block', marginBottom: 4 }}>
                        {predictionData.recommendationHindi}
                      </strong>
                      <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        {predictionData.reasoning}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => navigate('/portal')}
                      style={{
                        flex: 1,
                        padding: '11px 16px',
                        borderRadius: 999,
                        background: '#047857',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)'
                      }}
                    >
                      List at ₹{predictionData.peakPrice} in Marketplace &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const q = `KrishiAi Price Prediction models ${predictionData.commodity} reaching ₹${predictionData.peakPrice}/qtl with recommendation ${predictionData.recommendation}. What market strategy should I follow?`;
                        navigate('/chat', { state: { prefillQuery: q } });
                      }}
                      style={{
                        padding: '11px 16px',
                        borderRadius: 999,
                        background: '#ffffff',
                        color: '#047857',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        border: '1px solid rgba(4, 120, 87, 0.3)',
                        cursor: 'pointer'
                      }}
                    >
                      Ask AI &rarr;
                    </button>
                  </div>
                </div>

                {/* Right SVG Chart */}
                <div className="prediction-chart-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                      17-Day Price Trajectory (7 Days Past + 10 Days Projected)
                    </span>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.74rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569' }}>
                        <span style={{ width: 14, height: 3, background: '#047857', display: 'inline-block' }} /> Historical
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#047857', fontWeight: 700 }}>
                        <span style={{ width: 14, height: 3, borderTop: '2px dashed #10b981', display: 'inline-block' }} /> Forecast
                      </span>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: 210, position: 'relative' }}>
                    <svg viewBox="0 0 540 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <line x1="30" y1="20" x2="520" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="75" x2="520" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="130" x2="520" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="170" x2="520" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

                      {/* Transition Divider (Today) */}
                      <line x1="225" y1="10" x2="225" y2="170" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="225" y="192" fill="#047857" fontSize="10" fontWeight="800" textAnchor="middle">
                        TODAY
                      </text>

                      {/* Render historical & forecast polylines */}
                      {(() => {
                        const timeline = predictionData.timeline || [];
                        if (timeline.length < 2) return null;
                        const minP = Math.min(...timeline.map(t => t.price)) - 50;
                        const maxP = Math.max(...timeline.map(t => t.price)) + 50;
                        const range = maxP - minP || 1;

                        const getX = (idx) => 40 + (idx * ((500 - 40) / (timeline.length - 1)));
                        const getY = (price) => 170 - (((price - minP) / range) * 140);

                        const histPoints = timeline.slice(0, 7).map((t, i) => `${getX(i)},${getY(t.price)}`).join(' ');
                        const forecastPoints = timeline.slice(6).map((t, i) => `${getX(i + 6)},${getY(t.price)}`).join(' ');

                        return (
                          <g>
                            <polyline
                              fill="none"
                              stroke="#047857"
                              strokeWidth="3.5"
                              points={histPoints}
                            />

                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeDasharray="6 4"
                              points={forecastPoints}
                            />

                            {timeline.map((pt, idx) => {
                              const cx = getX(idx);
                              const cy = getY(pt.price);
                              const isToday = idx === 6;
                              const isPeak = pt.price === predictionData.peakPrice;
                              return (
                                <g key={idx}>
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={isToday || isPeak ? 5.5 : 3.5}
                                    fill={isToday ? '#064e3b' : isPeak ? '#10b981' : '#ffffff'}
                                    stroke={pt.type === 'forecast' ? '#10b981' : '#047857'}
                                    strokeWidth="2"
                                  />
                                  {(isToday || isPeak || idx === 0 || idx === timeline.length - 1) && (
                                    <text
                                      x={cx}
                                      y={cy - 10}
                                      fill="#0f172a"
                                      fontSize="10"
                                      fontWeight="800"
                                      textAnchor="middle"
                                    >
                                      ₹{pt.price}
                                    </text>
                                  )}
                                </g>
                              );
                            })}
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', marginTop: 10 }}>
                    <span>← Past 7 Days (Mandi Arrivals)</span>
                    <span>Next 10 Days (Projected Forecast) →</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Dashboard */}
        <section className="dashboard-section">
          <div className="section-heading">
            <span>Enterprise Suite</span>
            <h2>Integrated Farming & Trade Tools</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <NavLink key={feature.to} to={feature.to} className="feature-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div className="feature-icon" aria-hidden="true">
                    <span />
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#047857'
                  }}>
                    {feature.badge}
                  </span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-link">Open Tool &rarr;</span>
              </NavLink>
            ))}
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Deal Alert Simulator Widget */}
      <button
        type="button"
        className="wa-floating-btn"
        onClick={() => {
          setWaOpen(!waOpen);
          setDealAccepted(false);
        }}
        title="Real-time WhatsApp & SMS Deal Alerts"
      >
        <span style={{ fontSize: '1.2rem' }}>📲</span>
        <span>WhatsApp Deal Alert</span>
        <span className="wa-unread-dot" />
      </button>

      {/* WhatsApp Alert Simulator Modal Drawer */}
      {waOpen && (
        <aside className="wa-simulator-modal" aria-label="WhatsApp Deal Simulator">
          <div className="wa-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#128C7E',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1rem'
              }}>
                🌾
              </div>
              <div>
                <strong style={{ fontSize: '0.92rem', display: 'block' }}>KrishiAI Deals Gateway</strong>
                <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>Online • Verified APMC Simulator</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWaOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div className="wa-modal-body">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.75)',
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: '0.68rem',
                color: '#475569',
                fontWeight: 700
              }}>
                TODAY • 256-BIT ENCRYPTED DEAL DISPATCH
              </span>
            </div>

            <div className="wa-bubble">
              <strong style={{ color: '#075E54', display: 'block', fontSize: '0.9rem', marginBottom: 4 }}>
                🌾 New Wholesaler Direct Offer!
              </strong>
              <p style={{ margin: '0 0 6px', fontSize: '0.84rem' }}>
                Namaste <strong>{welcomeName}</strong> ji! Om Shanti Agro Exports (Indore) has sent an instant spot purchase offer for your harvest:
              </p>
              <div style={{ background: '#f1f5f9', padding: '8px 10px', borderRadius: 8, fontSize: '0.8rem', marginBottom: 6 }}>
                <div>📦 <strong>Commodity:</strong> {selectedCommodity} (Grade A)</div>
                <div>💰 <strong>Offered Rate:</strong> ₹{predictionData ? predictionData.peakPrice - 30 : 2890} / Quintal</div>
                <div>⚖️ <strong>Quantity:</strong> 100 - 250 Quintals</div>
                <div>📍 <strong>Pickup:</strong> Farm Gate within 48 hours</div>
                <div>💳 <strong>Payment:</strong> Instant RTGS/UPI on weighing</div>
              </div>
              <span className="wa-bubble-time">Just now • Delivered ✓✓</span>
            </div>

            {dealAccepted && (
              <div style={{
                background: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: '#14532d',
                marginBottom: 10
              }}>
                ✅ <strong>Deal Confirmed!</strong> Wholesaler Om Shanti Agro Exports has been notified. Contact details shared with logistics partner.
              </div>
            )}
          </div>

          <div className="wa-actions-tray">
            {!dealAccepted ? (
              <>
                <button
                  type="button"
                  onClick={() => setDealAccepted(true)}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  ✅ Accept Deal at ₹{predictionData ? predictionData.peakPrice - 30 : 2890}/qtl
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setWaOpen(false);
                      navigate('/chat', {
                        state: { prefillQuery: `Wholesaler offered ₹${predictionData ? predictionData.peakPrice - 30 : 2890} for my ${selectedCommodity}. Should I counter-offer at ₹${predictionData ? predictionData.peakPrice : 2950}?` }
                      });
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: 10,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: '#334155'
                    }}
                  >
                    💬 Counter / Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWaOpen(false);
                      navigate('/portal');
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: 10,
                      background: '#047857',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🛒 Open Market
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDealAccepted(false);
                  setWaOpen(false);
                }}
                style={{
                  padding: '9px',
                  borderRadius: 10,
                  background: '#075E54',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Close Simulation
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
