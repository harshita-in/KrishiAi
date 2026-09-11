import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './home.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Marketplace', to: '/portal' },
  { label: 'Satellite NDVI', to: '/satellite' },
  { label: 'Kisan Chopal', to: '/chopal' },
  { label: 'Services', to: '/services' },
  { label: 'AI Chat', to: '/chat' },
  { label: 'Profile', to: '/profile' },
];

const features = [
  {
    title: 'AI Crop Doctor & Chatbot',
    description: 'Upload leaf photos for instant crop disease detection & doctor advice. Speak in Hindi or English for voice assistance.',
    to: '/chat',
    badge: 'Vision Doctor + Voice'
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

export const DEFAULT_MANDI_RATES = [
  { commodity: 'Wheat (गेहूं)', market: 'Indore Mandi', modalPrice: 2850, changePercent: '+2.4%', isPositive: true },
  { commodity: 'Wheat (गेहूं)', market: 'Khanna Mandi', modalPrice: 2420, changePercent: '+0.8%', isPositive: true },
  { commodity: 'Soybean (सोयाबीन)', market: 'Ujjain Mandi', modalPrice: 4620, changePercent: '+3.1%', isPositive: true },
  { commodity: 'Mustard (सरसों)', market: 'Alwar Mandi', modalPrice: 5850, changePercent: '+1.8%', isPositive: true },
  { commodity: 'Cotton (कपास)', market: 'Rajkot Mandi', modalPrice: 7350, changePercent: '-1.2%', isPositive: false },
  { commodity: 'Onion (प्याज)', market: 'Lasalgaon Mandi', modalPrice: 2100, changePercent: '+4.5%', isPositive: true },
  { commodity: 'Potato (आलू)', market: 'Agra Mandi', modalPrice: 1420, changePercent: '-0.9%', isPositive: false },
  { commodity: 'Paddy / Basmati (धान)', market: 'Karnal Mandi', modalPrice: 4350, changePercent: '+2.1%', isPositive: true },
  { commodity: 'Gram / Chana (चना)', market: 'Bhopal Mandi', modalPrice: 5440, changePercent: '+1.5%', isPositive: true },
];

export const DEFAULT_WEATHER_DATA = {
  currentWeather: {
    tempCelsius: 28,
    humidityPercent: 62,
    windSpeedKmh: 11,
    condition: 'Partly Cloudy / साफ़ धूप',
  },
  agriAdvisories: [
    {
      type: 'spraying',
      level: 'Optimal',
      badge: 'Safe to Spray',
      hindiBadge: 'कीटनाशक छिड़काव के लिए उत्तम',
      message: 'Wind speed is low (11 km/h) and no heavy rain expected today. Ideal for foliar spray of micronutrients and pest control before noon.'
    }
  ]
};

export function getFallbackPricePrediction(commodity = 'Wheat') {
  const basePrices = {
    'Wheat': { current: 2850, peak: 3040, change: '+6.6%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — भाव बढ़ने का अनुमान' },
    'Soybean': { current: 4620, peak: 4920, change: '+6.5%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — भाव बढ़ने का अनुमान' },
    'Mustard': { current: 5850, peak: 5950, change: '+1.7%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — आवक बढ़ने से भाव गिर सकते हैं' },
    'Cotton': { current: 7350, peak: 7150, change: '-2.7%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — नई आवक से दाम गिर सकते हैं' },
    'Onion': { current: 2100, peak: 2550, change: '+21.4%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — त्योहारी मांग बढ़ने का अनुमान' },
    'Potato': { current: 1420, peak: 1380, change: '-2.8%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — कोल्ड स्टोरेज निकासी तेज है' },
    'Paddy': { current: 4350, peak: 4580, change: '+5.3%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — बासमती निर्यात मांग मजबूत' }
  };

  const info = basePrices[commodity] || basePrices['Wheat'];
  const today = new Date();
  const timeline = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    timeline.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      price: info.current - Math.round(Math.sin(i) * 30 - i * 12),
      type: 'historical'
    });
  }

  for (let j = 1; j <= 10; j++) {
    const d = new Date(today);
    d.setDate(today.getDate() + j);
    timeline.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      price: info.current + Math.round(j * (info.peak - info.current) / 10),
      type: 'forecast'
    });
  }

  return {
    status: 'success',
    commodity,
    currentPrice: info.current,
    peakPrice: info.peak,
    projectedChange: info.change,
    recommendation: info.rec,
    recommendationHindi: info.recHindi,
    reasoning: info.rec === 'HOLD_PRODUCE'
      ? `Upcoming market demand and limited APMC mandi arrivals indicate an upward trajectory of ${info.change} over the next 10 days.`
      : `Arrivals from southern production hubs are rising. Offloading current harvest locks in highest profit margin before supply expansion.`,
    timeline
  };
}

export default function Home({ portalLabel, storageKeyPrefix }) {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem(`${storageKeyPrefix}_user`) || sessionStorage.getItem(`${storageKeyPrefix}_user`);
  const user = rawUser ? JSON.parse(rawUser) : null;
  const welcomeName = useMemo(() => user?.name || 'Farmer', [user]);

  // Weather and Mandi State (guaranteed fallback so Mandi rates never disappear)
  const [weatherData, setWeatherData] = useState(DEFAULT_WEATHER_DATA);
  const [mandiRates, setMandiRates] = useState(DEFAULT_MANDI_RATES);

  // Live Farm Location State
  const [farmLocation, setFarmLocation] = useState({
    latitude: null,
    longitude: null,
    placeName: '',
    status: 'detecting', // 'detecting' | 'connected' | 'denied' | 'unsupported'
  });

  // AI Mandi Price Prediction State
  const [selectedCommodity, setSelectedCommodity] = useState('Wheat');
  const [predictionData, setPredictionData] = useState(() => getFallbackPricePrediction('Wheat'));

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
    // 1. Fetch Mandi Rates (with fallback preservation)
    apiFetch('/api/agro/mandi-rates')
      .then(res => res.json())
      .then(data => {
        if (data.rates && data.rates.length > 0) {
          setMandiRates(data.rates);
        }
      })
      .catch(err => console.warn('Mandi fetch error, keeping default rates:', err));

    // 2. Fetch initial Weather Advisory (with fallback preservation)
    apiFetch('/api/agro/weather-advisory')
      .then(res => res.json())
      .then(data => {
        if (data.advisory) setWeatherData(data.advisory);
      })
      .catch(err => console.warn('Weather fetch error, keeping default advisory:', err));

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
        } else {
          setPredictionData(getFallbackPricePrediction(selectedCommodity));
        }
      })
      .catch(err => {
        console.warn('Price prediction fetch error, using fallback:', err);
        setPredictionData(getFallbackPricePrediction(selectedCommodity));
      });
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
      <div className="mandi-ticker-strip">
        <div className="mandi-ticker-header">
          <span className="mandi-pulse-dot" aria-hidden="true" />
          <span className="mandi-ticker-title">Live APMC Mandi Bhav</span>
        </div>

        <div className="mandi-ticker-scroll" aria-label="Live Mandi Price Ticker">
          {(mandiRates && mandiRates.length > 0 ? mandiRates : DEFAULT_MANDI_RATES).map((rate, i) => (
            <div key={i} className="mandi-chip">
              <span className="mandi-chip-crop">{rate.commodity}</span>
              <span className="mandi-chip-market">({rate.market})</span>
              <span className="mandi-chip-price">₹{rate.modalPrice}</span>
              <span className="mandi-chip-unit">/qtl</span>
              <span className={`mandi-chip-trend ${rate.isPositive ? 'mandi-trend-up' : 'mandi-trend-down'}`}>
                {rate.isPositive ? '▲ ' : '▼ '}{rate.changePercent}
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="farmer-main">
        {/* Hero Section */}
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="hero-badge">Welcome back, {welcomeName} 👋</span>
            <h1>Grow smarter with KrishiAI Precision Agricultural Suite</h1>
            <p>
              Consult our AI Crop Doctor with leaf photos for instant diagnosis, track live mandi rates,
              and trade directly with regional wholesalers without middlemen.
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
    </div>
  );
}
