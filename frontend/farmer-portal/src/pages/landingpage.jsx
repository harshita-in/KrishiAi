import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landingpage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="ambient-blob blob-one"></div>
      <div className="ambient-blob blob-two"></div>

      <header className="landing-header">
        <div className="logo-area">
          <span className="logo-main">
            Krishi<span className="logo-sub">AI</span>
          </span>
        </div>
      </header>

      <section className="hero-section">
        <span className="badge-tag animate-fade-in">
          Honoring 'Krishi' - Empowering the Hands That Feed Us
        </span>

        <h1 className="hero-title">Cultivate abundance with intelligent farming.</h1>

        <p className="hero-subtitle">
          Bridging ancient agricultural wisdom with modern predictability. Protect your yields, understand your soil health, and ensure a prosperous harvest season after season.
        </p>

        <div className="cta-wrapper" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/auth', { state: { role: 'farmer' } })}
            className="cta-button"
            title="Access Farmer Dashboard"
          >
            🌾 किसान पोर्टल (Farmer)
            <svg className="cta-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/auth', { state: { role: 'wholesaler' } })}
            className="cta-button"
            style={{
              background: 'linear-gradient(135deg, #064e3b, #047857)',
              boxShadow: '0 8px 24px rgba(6, 78, 59, 0.28)'
            }}
            title="Access Wholesaler Procurement Terminal"
          >
            🏢 व्यापारी पोर्टल (Wholesaler)
            <svg className="cta-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="card-icon-box">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="card-title">AI Crop Doctor & Voice Bot</h3>
            <p className="card-description">
              Upload leaf photos for instant disease detection and doctor advice. Speak in Hindi or English using voice input for 24/7 agricultural guidance.
            </p>
          </div>

          <div className="feature-card">
            <div className="card-icon-box">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="card-title">Direct B2B Wholesale Trading</h3>
            <p className="card-description">
              Connect institutional buyers directly with local farmers. Zero middleman commission, transparent bidding, farm-gate pickup, and WhatsApp deal alerts.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer-element">
        &copy; {new Date().getFullYear()} KrishiAI. All rights reserved to safe, scalable agriculture.
      </footer>
    </div>
  );
}
