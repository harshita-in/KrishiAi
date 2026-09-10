import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './home.css';
import './satellite.css';

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

export default function Satellite() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState('ndvi'); // 'ndvi' | 'moisture' | 'rgb'
  const [selectedPlotId, setSelectedPlotId] = useState('plot-1');
  const [loading, setLoading] = useState(false);
  const [satelliteData, setSatelliteData] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Fetch Satellite NDVI Data
  const loadSatelliteData = async (lat, lng) => {
    setLoading(true);
    try {
      const url = lat && lng 
        ? `/api/agro/satellite-ndvi?lat=${lat}&lng=${lng}` 
        : '/api/agro/satellite-ndvi';
      const res = await apiFetch(url);
      const data = await res.json();
      if (res.ok) {
        setSatelliteData(data);
      }
    } catch (err) {
      console.error('Satellite data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get farmer's location from localStorage or default
    const rawUser = localStorage.getItem('farmer_user') || sessionStorage.getItem('farmer_user');
    let lat = null;
    let lng = null;
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u.location?.latitude && u.location?.longitude) {
          lat = u.location.latitude;
          lng = u.location.longitude;
        }
      } catch (e) {}
    }
    loadSatelliteData(lat, lng);
  }, []);

  const triggerLiveScan = () => {
    setScanning(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadSatelliteData(pos.coords.latitude, pos.coords.longitude);
          setTimeout(() => setScanning(false), 1200);
        },
        () => {
          loadSatelliteData(null, null);
          setTimeout(() => setScanning(false), 1200);
        }
      );
    } else {
      loadSatelliteData(null, null);
      setTimeout(() => setScanning(false), 1200);
    }
  };

  const selectedPlot = satelliteData?.plots?.find((p) => p.id === selectedPlotId) || satelliteData?.plots?.[0];

  return (
    <div className="satellite-shell">
      {/* Ambient background glows */}
      <div className="farmer-aurora farmer-aurora-one" />
      <div className="farmer-aurora farmer-aurora-two" />

      {/* Navigation */}
      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI Space Intelligence</span>
          <span className="brand-title">Satellite Crop Health</span>
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

      <main className="satellite-main">
        {/* Header section */}
        <div className="satellite-header">
          <span className="satellite-kicker">
            🛰️ ESA Sentinel-2 Multispectral MSI Sensor (10m Resolution)
          </span>
          <h1>Satellite NDVI Farm Health & Biomass Mapping</h1>
          <p>
            Monitor vegetation vigor, soil moisture stress, and chlorophyll density across your farm plots
            from Earth orbit. Spot nutrient deficiencies 10-14 days before visible leaf yellowing.
          </p>
        </div>

        {/* Studio Grid */}
        <div className="satellite-grid">
          {/* Left Column: Interactive Farm Map & Layer Viewer */}
          <div className="map-viewer-card">
            <div className="map-controls-row">
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Active Sensor Layer
                </span>
                <div className="layer-toggle-group" style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    className={`layer-btn ${activeLayer === 'ndvi' ? 'active' : ''}`}
                    onClick={() => setActiveLayer('ndvi')}
                  >
                    🌿 NDVI Vigor
                  </button>
                  <button
                    type="button"
                    className={`layer-btn ${activeLayer === 'moisture' ? 'active' : ''}`}
                    onClick={() => setActiveLayer('moisture')}
                  >
                    💧 Moisture (NDWI)
                  </button>
                  <button
                    type="button"
                    className={`layer-btn ${activeLayer === 'rgb' ? 'active' : ''}`}
                    onClick={() => setActiveLayer('rgb')}
                  >
                    🛰️ True RGB
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={triggerLiveScan}
                  disabled={scanning || loading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: '1px solid rgba(4, 120, 87, 0.3)',
                    background: scanning ? '#d1fae5' : '#ffffff',
                    color: '#047857',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: scanning ? 'wait' : 'pointer',
                    boxShadow: '0 2px 6px rgba(4, 120, 87, 0.08)'
                  }}
                >
                  {scanning ? '🛰️ Orbiting & Scanning...' : '🔄 Scan Current GPS Field'}
                </button>
              </div>
            </div>

            {/* Farm Plot SVG Interactive Map */}
            <div className="map-canvas-container" style={{ background: '#f8fafc', position: 'relative' }}>
              {scanning && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                    boxShadow: '0 0 14px #10b981',
                    animation: 'scanline 1.2s infinite ease-in-out',
                    zIndex: 10
                  }}
                />
              )}

              <svg
                viewBox="0 0 600 360"
                style={{ width: '100%', height: '100%', display: 'block' }}
              >
                <defs>
                  {/* Background Grid Pattern */}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                  </pattern>

                  {/* NDVI Gradient Fills */}
                  <linearGradient id="healthyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.88" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.95" />
                  </linearGradient>

                  <linearGradient id="stressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="fallowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.85" />
                  </linearGradient>

                  <linearGradient id="moistureHigh" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="rgbNatural" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4d7c0f" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#365314" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Base Map Grid */}
                <rect width="600" height="360" fill="url(#grid)" />

                {/* Road / Farm Boundary lines */}
                <path d="M 0,180 Q 280,195 600,175" stroke="#cbd5e1" strokeWidth="6" fill="none" strokeDasharray="8 6" />
                <path d="M 330,0 L 330,360" stroke="#cbd5e1" strokeWidth="4" fill="none" />

                {/* Plot 1: North Plot (Wheat) */}
                <g
                  onClick={() => setSelectedPlotId('plot-1')}
                  style={{ cursor: 'pointer', transition: 'all 200ms ease' }}
                >
                  <polygon
                    points="40,30 310,25 310,165 40,165"
                    fill={
                      activeLayer === 'moisture'
                        ? 'url(#moistureHigh)'
                        : activeLayer === 'rgb'
                        ? 'url(#rgbNatural)'
                        : 'url(#healthyGradient)'
                    }
                    stroke={selectedPlotId === 'plot-1' ? '#047857' : '#ffffff'}
                    strokeWidth={selectedPlotId === 'plot-1' ? 4 : 2}
                    filter={selectedPlotId === 'plot-1' ? 'drop-shadow(0 6px 12px rgba(16,185,129,0.3))' : 'none'}
                  />
                  <text x="175" y="85" fill="#ffffff" fontWeight="800" fontSize="14" textAnchor="middle">
                    North Plot • 2.2 Ac
                  </text>
                  <text x="175" y="110" fill="#ecfdf5" fontWeight="700" fontSize="12" textAnchor="middle">
                    Wheat (HD-2967) • NDVI 0.84
                  </text>
                  <circle cx="175" cy="130" r="4" fill="#a7f3d0" />
                </g>

                {/* Plot 2: West Plot (Mustard) */}
                <g
                  onClick={() => setSelectedPlotId('plot-2')}
                  style={{ cursor: 'pointer', transition: 'all 200ms ease' }}
                >
                  <polygon
                    points="40,200 310,200 310,335 40,335"
                    fill={
                      activeLayer === 'moisture'
                        ? '#67e8f9'
                        : activeLayer === 'rgb'
                        ? '#65a30d'
                        : 'url(#stressGradient)'
                    }
                    stroke={selectedPlotId === 'plot-2' ? '#047857' : '#ffffff'}
                    strokeWidth={selectedPlotId === 'plot-2' ? 4 : 2}
                    filter={selectedPlotId === 'plot-2' ? 'drop-shadow(0 6px 12px rgba(245,158,11,0.3))' : 'none'}
                  />
                  <text x="175" y="255" fill="#ffffff" fontWeight="800" fontSize="14" textAnchor="middle">
                    West Plot • 1.5 Ac
                  </text>
                  <text x="175" y="280" fill="#fef3c7" fontWeight="700" fontSize="12" textAnchor="middle">
                    Mustard (Pusa Bold) • NDVI 0.64
                  </text>
                  <text x="175" y="302" fill="#fffbeb" fontWeight="600" fontSize="11" textAnchor="middle">
                    ⚠️ Mild Nitrogen Stress
                  </text>
                </g>

                {/* Plot 3: East Ridge (Canal / Fallow) */}
                <g
                  onClick={() => setSelectedPlotId('plot-3')}
                  style={{ cursor: 'pointer', transition: 'all 200ms ease' }}
                >
                  <polygon
                    points="350,30 560,45 560,335 350,335"
                    fill={
                      activeLayer === 'moisture'
                        ? '#bae6fd'
                        : activeLayer === 'rgb'
                        ? '#78716c'
                        : 'url(#fallowGradient)'
                    }
                    stroke={selectedPlotId === 'plot-3' ? '#047857' : '#ffffff'}
                    strokeWidth={selectedPlotId === 'plot-3' ? 4 : 2}
                    filter={selectedPlotId === 'plot-3' ? 'drop-shadow(0 6px 12px rgba(239,68,68,0.3))' : 'none'}
                  />
                  <text x="455" y="170" fill="#ffffff" fontWeight="800" fontSize="14" textAnchor="middle">
                    East Ridge • 0.8 Ac
                  </text>
                  <text x="455" y="195" fill="#fee2e2" fontWeight="700" fontSize="12" textAnchor="middle">
                    Canal Bund / Fallow • NDVI 0.36
                  </text>
                  <text x="455" y="218" fill="#ffffff" fontWeight="600" fontSize="11" textAnchor="middle">
                    Low Vegetative Cover
                  </text>
                </g>

                {/* GPS Pin indicator */}
                <g transform="translate(175, 55)">
                  <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.4)" />
                  <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#047857" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="3" fill="#047857" />
                </g>
              </svg>

              {/* Coordinates Pill */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 14,
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(8px)',
                  color: '#f8fafc',
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.04em'
                }}
              >
                Lat: {satelliteData?.farmCoords?.latitude?.toFixed(4) || '22.7196'}° N • Lng: {satelliteData?.farmCoords?.longitude?.toFixed(4) || '75.8577'}° E
              </div>
            </div>

            {/* NDVI Legend Bar */}
            <div className="ndvi-legend">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                  NDVI Color Scale (Vegetation Index)
                </span>
                <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>
                  Optimal Biomass Range: 0.70 - 0.90
                </span>
              </div>
              <div className="legend-bar" />
              <div className="legend-labels">
                <span>0.0 Bare / Water</span>
                <span>0.3 High Stress</span>
                <span>0.5 Moderate</span>
                <span>0.7 Good Health</span>
                <span>1.0 Dense Biomass</span>
              </div>
            </div>
          </div>

          {/* Right Column: Agronomic Breakdown & Selected Plot Analysis */}
          <div className="analysis-panel">
            {/* Overall Farm NDVI Score Banner */}
            <div className="ndvi-stat-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                    Farm Average NDVI
                  </span>
                  <div className="ndvi-big-score">{satelliteData?.overallNdvi || '0.78'}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#10b981'
                    }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#047857' }}>
                      {satelliteData?.canopyHealth || 'Excellent & Vigorous'}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block' }}>
                    Last Satellite Flyover
                  </span>
                  <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                    {satelliteData?.lastScanDate || 'Yesterday, 11:42 AM IST'}
                  </strong>
                  <div style={{ marginTop: 6, fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                    Moisture: {satelliteData?.moistureScore || '72% (Optimal)'}
                  </div>
                </div>
              </div>

              {/* 4-Week NDVI Biomass Trajectory */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                  📈 4-Week Canopy Growth Trajectory
                </span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 60, padding: '4px 0' }}>
                  {satelliteData?.growthCurve?.map((item, idx) => {
                    const heightPercent = Math.round(item.ndvi * 100);
                    return (
                      <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                        <div
                          style={{
                            height: `${heightPercent}%`,
                            background: idx === 3 ? '#047857' : '#a7f3d0',
                            borderRadius: '6px 6px 0 0',
                            transition: 'height 400ms ease',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingTop: 2
                          }}
                        >
                          <span style={{ fontSize: '0.66rem', color: idx === 3 ? '#ffffff' : '#065f46', fontWeight: 800 }}>
                            {item.ndvi}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: 4 }}>
                          {item.week.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Plot Zone Inspector */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.92)',
              borderRadius: 24,
              padding: 22,
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#064e3b', fontWeight: 800 }}>
                  Plot Zone Inspector
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Click a zone on map to inspect
                </span>
              </div>

              {selectedPlot && (
                <div style={{
                  background: '#f8fafc',
                  border: `2px solid ${selectedPlot.color || '#10b981'}33`,
                  borderRadius: 18,
                  padding: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{selectedPlot.name}</strong>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: `${selectedPlot.color || '#10b981'}22`,
                      color: selectedPlot.color || '#047857'
                    }}>
                      NDVI {selectedPlot.ndvi} • {selectedPlot.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, margin: '8px 0 14px' }}>
                    <strong>Agronomic Diagnosis:</strong> {selectedPlot.diagnosis}
                  </p>

                  <div style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    color: '#475569'
                  }}>
                    <span>Area: <strong>{selectedPlot.areaAcre} Acres</strong></span>
                    <span>Chlorophyll Vigor: <strong style={{ color: '#047857' }}>High</strong></span>
                    <span>Zone Health: <strong style={{ color: selectedPlot.color }}>{selectedPlot.status}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const q = `Sentinel satellite scan detected ${selectedPlot.status} with NDVI ${selectedPlot.ndvi} on my ${selectedPlot.name}. Diagnosis: ${selectedPlot.diagnosis}. What fertilizer or spray should I apply?`;
                        navigate('/chat', { state: { prefillQuery: q } });
                      }}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        background: '#047857',
                        color: '#ffffff',
                        borderRadius: 12,
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Ask AI Doctor for Zone Spray &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* All Farm Plots List */}
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  All Monitored Farm Zones ({satelliteData?.plots?.length || 3})
                </span>
                <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                  {satelliteData?.plots?.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlotId(p.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        borderRadius: 14,
                        background: selectedPlotId === p.id ? '#ecfdf5' : '#ffffff',
                        border: `1px solid ${selectedPlotId === p.id ? '#10b981' : '#e2e8f0'}`,
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: p.color
                        }} />
                        <div>
                          <strong style={{ fontSize: '0.86rem', color: '#1e293b', display: 'block' }}>
                            {p.name}
                          </strong>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {p.areaAcre} Acres • {p.status}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#047857' }}>
                        NDVI {p.ndvi}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
