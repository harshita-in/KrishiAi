import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './home.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Services', to: '/services' },
  { label: 'About us', to: '/about-us' },
  { label: 'Profile', to: '/profile' },
];

export default function UnderDevelopment({ title, description }) {
  const navigate = useNavigate();

  return (
    <div className="ud-shell">
      <div className="ud-glow ud-glow-one" />
      <div className="ud-glow ud-glow-two" />

      <header className="ud-nav">
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

        <button className="nav-logout" type="button" onClick={() => navigate('/home')}>
          Back to Home
        </button>
      </header>

      <main className="ud-main">
        <section className="ud-card">
          <span className="ud-badge">Under development</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="ud-loader" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
      </main>
    </div>
  );
}
