import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiUrl } from '../config';
import './home.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Services', to: '/services' },
  { label: 'About us', to: '/about-us' },
  { label: 'Profile', to: '/profile' },
];

const features = [
  { title: 'AI chatbot', description: 'Ask farming questions, get instant guidance, and keep decisions moving.', to: '/chat' },
  { title: 'Crop recommendation', description: 'Discover crops that fit your soil, season, and field conditions.', to: '/recommendation' },
  { title: 'Crop disease detection', description: 'Upload symptoms and get a fast, AI-assisted diagnosis path.', to: '/detection' },
  { title: 'KrishiPortal', description: 'Explore the portal hub for future services, tools, and updates.', to: '/portal' },
];

export default function Home({ portalLabel, storageKeyPrefix }) {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem(`${storageKeyPrefix}_user`) || sessionStorage.getItem(`${storageKeyPrefix}_user`);
  const user = rawUser ? JSON.parse(rawUser) : null;
  const [locationStatus, setLocationStatus] = useState('');
  const apiBase = apiUrl(`/api/${storageKeyPrefix}`);

  const welcomeName = useMemo(() => user?.name || 'Farmer', [user]);

  useEffect(() => {
    if (storageKeyPrefix !== 'farmer') return;

    const token =
      localStorage.getItem(`${storageKeyPrefix}_token`) ||
      sessionStorage.getItem(`${storageKeyPrefix}_token`);

    if (!token) {
      setLocationStatus('Signed in, but location upload is unavailable without a token.');
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by this browser.');
      return;
    }

    let cancelled = false;
    setLocationStatus('Requesting your location permission...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          if (cancelled) return;
          setLocationStatus('Saving your location...');

          const response = await fetch(`${apiBase}/location`, {
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

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to save location');
          }

          if (!cancelled) {
            setLocationStatus('Location saved successfully.');
          }
        } catch (error) {
          if (!cancelled) {
            setLocationStatus(error.message);
          }
        }
      },
      (error) => {
        if (!cancelled) {
          setLocationStatus(error.message || 'Location permission was denied.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      cancelled = true;
    };
  }, [apiBase, storageKeyPrefix]);

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

      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI</span>
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

      <main className="farmer-main">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="hero-badge">Welcome back, {welcomeName}</span>
            <h1>Grow smarter with one place for guidance, insights, and tools.</h1>
            <p>
              This dashboard brings your farmer journey into a single clean workspace. Explore AI help,
              crop planning, disease checks, and the KrishiPortal roadmap from one focused home screen.
            </p>

            {locationStatus && storageKeyPrefix === 'farmer' && (
              <div className="status-chip">{locationStatus}</div>
            )}
          </div>

          <div className="hero-stat-card">
            <span className="stat-label">Portal</span>
            <strong>{portalLabel} access enabled</strong>
            <p>Prepared for future services while keeping today's navigation simple and clear.</p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <span>Dashboard</span>
            <h2>Choose a tool to continue</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <NavLink key={feature.to} to={feature.to} className="feature-card">
                <div className="feature-icon" aria-hidden="true">
                  <span />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-link">Open</span>
              </NavLink>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
