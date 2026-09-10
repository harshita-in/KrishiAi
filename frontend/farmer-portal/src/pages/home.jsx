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
  const [locationStatus, setLocationStatus] = useState('');
  const welcomeName = useMemo(() => user?.name || 'Farmer', [user]);

  // Weather and Mandi State
  const [weatherData, setWeatherData] = useState(null);
  const [mandiRates, setMandiRates] = useState([]);

  useEffect(() => {
    // 1. Fetch Mandi Rates
    apiFetch('/api/agro/mandi-rates')
      .then(res => res.json())
      .then(data => {
        if (data.rates) setMandiRates(data.rates.slice(0, 6));
      })
      .catch(err => console.error('Mandi fetch error:', err));

    // 2. Fetch Weather Advisory
    apiFetch('/api/agro/weather-advisory')
      .then(res => res.json())
      .then(data => {
        if (data.advisory) setWeatherData(data.advisory);
      })
      .catch(err => console.error('Weather fetch error:', err));

    // 3. Geolocation registration
    if (storageKeyPrefix !== 'farmer') return;

    const token =
      localStorage.getItem(`${storageKeyPrefix}_token`) ||
      sessionStorage.getItem(`${storageKeyPrefix}_token`);

    if (!token) return;
    if (!navigator.geolocation) return;

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          if (cancelled) return;
          const response = await apiFetch(`/api/${storageKeyPrefix}/location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          });
          if (response.ok && !cancelled) {
            setLocationStatus('📍 Live Farm Coordinates Connected');
          }
        } catch (e) {
          // non-critical
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );

    return () => { cancelled = true; };
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

            {locationStatus && (
              <div className="status-chip" style={{ background: '#dcfce7', color: '#047857' }}>
                {locationStatus}
              </div>
            )}
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
