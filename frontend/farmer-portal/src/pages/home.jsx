import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './home.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Disease Detection', to: '/detection' },
  { label: 'Crop Recommendation', to: '/recommendation' },
  { label: 'Marketplace', to: '/portal' },
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
          <span className="brand-title">Farmer Portal</span>
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
