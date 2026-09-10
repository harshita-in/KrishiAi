import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './detection.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Disease Detection', to: '/detection' },
  { label: 'Crop Recommendation', to: '/recommendation' },
  { label: 'Marketplace', to: '/portal' },
  { label: 'Services', to: '/services' },
  { label: 'AI Chat', to: '/chat' },
  { label: 'Profile', to: '/profile' },
];

const sampleLeaves = [
  { id: 'wheat-yellow-rust', name: 'Wheat Rust (गेहूं का पीला रतुआ)', crop: 'Wheat' },
  { id: 'tomato-early-blight', name: 'Tomato Blight (टमाटर झुलसा)', crop: 'Tomato' },
  { id: 'potato-late-blight', name: 'Potato Blight (आलू पछेती झुलसा)', crop: 'Potato' },
  { id: 'cotton-leaf-curl', name: 'Cotton Curl (कपास पत्ती मरोड़)', crop: 'Cotton' },
  { id: 'rice-blast', name: 'Rice Blast (धान झोंका रोग)', crop: 'Rice / Paddy' },
  { id: 'healthy-crop', name: 'Healthy Leaf (स्वस्थ फसल)', crop: 'General' },
];

export default function Detection() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropType, setCropType] = useState('Wheat');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setSelectedSample(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleClick = async (sample) => {
    setSelectedSample(sample.id);
    setCropType(sample.crop);
    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/agro/disease-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: sample.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze sample');
      setDiagnosis(data.diagnosis);
    } catch (err) {
      setError(err.message || 'Error diagnosing crop disease');
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnose = async (e) => {
    e?.preventDefault();
    if (!selectedImage && !symptoms && !selectedSample) {
      setError('Please upload a leaf photo, choose a sample, or describe symptoms.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/agro/disease-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          cropType,
          symptoms,
          sampleId: selectedSample
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to diagnose');
      setDiagnosis(data.diagnosis);
    } catch (err) {
      setError(err.message || 'Error diagnosing crop disease');
    } finally {
      setLoading(false);
    }
  };

  const askAiDoctor = () => {
    if (!diagnosis) return;
    const query = `My ${diagnosis.crop} has ${diagnosis.diseaseName} (${diagnosis.hindiName}). What immediate steps should I take today?`;
    navigate('/chat', { state: { prefillQuery: query } });
  };

  return (
    <div className="detection-shell">
      {/* Aurora Ambient Glows */}
      <div className="farmer-aurora farmer-aurora-one" />
      <div className="farmer-aurora farmer-aurora-two" />

      {/* Navigation */}
      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI Intelligence</span>
          <span className="brand-title">Crop Disease Detection</span>
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
      <main className="detection-main">
        <div className="detection-header">
          <span className="detection-kicker">🌱 AI Plant Pathology Lab</span>
          <h1>Instant Crop Disease Detection & Doctor Advice</h1>
          <p>
            Upload a photo of diseased leaves or pick a quick demo sample. Our AI identifies pathogens,
            recommends organic home remedies (देसी नुस्खे), and specifies safe chemical dosages.
          </p>
        </div>

        {/* Quick Demo Sample Bar for Instant Viva Demo */}
        <div className="sample-leaves-bar">
          <span className="sample-label">⚡ Quick Demo Samples:</span>
          {sampleLeaves.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className={`sample-chip ${selectedSample === sample.id ? 'active' : ''}`}
              onClick={() => handleSampleClick(sample)}
            >
              {sample.name}
            </button>
          ))}
        </div>

        {error && <div className="status-chip" style={{ background: '#fee2e2', color: '#b91c1c', marginBottom: 20 }}>{error}</div>}

        <div className="detection-grid">
          {/* Left Column: Upload & Controls */}
          <div className="upload-card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', marginBottom: 14 }}>
              Upload Leaf Image
            </h2>

            {selectedImage ? (
              <div className="preview-container">
                <img src={selectedImage} alt="Crop Leaf Preview" className="preview-img" />
                {loading && <div className="scan-laser" />}
                <button
                  type="button"
                  className="remove-img-btn"
                  onClick={() => setSelectedImage(null)}
                  title="Remove Image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <div className="upload-icon-circle">📷</div>
                <div className="upload-title">Drop leaf photo or browse</div>
                <div className="upload-subtitle">Supports JPG, PNG, WEBP from mobile or computer</div>
                <span className="browse-btn">Choose Photo</span>
              </label>
            )}

            <div className="upload-form-group">
              <label htmlFor="cropSelect">Crop Type</label>
              <select
                id="cropSelect"
                className="upload-select"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              >
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Tomato">Tomato (टमाटर)</option>
                <option value="Potato">Potato (आलू)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Rice / Paddy">Rice / Paddy (धान)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Mustard">Mustard (सरसों)</option>
                <option value="Onion">Onion (प्याज)</option>
                <option value="General">Other / Mixed</option>
              </select>
            </div>

            <div className="upload-form-group">
              <label htmlFor="symptomsDesc">Observable Symptoms (Optional)</label>
              <input
                id="symptomsDesc"
                type="text"
                className="upload-input"
                placeholder="e.g., yellow spots on leaves, curling, black powder"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="diagnose-submit-btn"
              onClick={handleDiagnose}
              disabled={loading}
            >
              {loading ? 'Analyzing with AI Scanner...' : '🔍 Diagnose Disease Now'}
            </button>
          </div>

          {/* Right Column: Results & Treatment Card */}
          <div className="result-card">
            {!diagnosis ? (
              <div className="result-placeholder">
                <div className="result-placeholder-icon">🌿</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                  Ready to Diagnose
                </h3>
                <p style={{ maxWidth: 360 }}>
                  Upload a crop photo or click one of the quick demo buttons above to see the AI diagnosis,
                  severity analysis, and step-by-step treatment plan.
                </p>
              </div>
            ) : (
              <div>
                <div className="diag-header">
                  <div className="diag-badges">
                    <span className={`severity-badge severity-${diagnosis.severity}`}>
                      {diagnosis.severity} Severity
                    </span>
                    <span className="confidence-chip">
                      ✓ {diagnosis.confidence}% Confidence
                    </span>
                    <span className="confidence-chip" style={{ background: '#f1f5f9', color: '#334155' }}>
                      Crop: {diagnosis.crop}
                    </span>
                  </div>

                  <h2 className="diag-title">{diagnosis.diseaseName}</h2>
                  <div className="diag-hindi">{diagnosis.hindiName}</div>
                  <div className="diag-pathogen">
                    <strong>Pathogen:</strong> {diagnosis.pathogen}
                  </div>
                </div>

                {/* Symptoms */}
                <div className="diag-section">
                  <h3 className="diag-section-title">
                    <span>🔬</span> Symptoms Identified
                  </h3>
                  <div className="symptoms-box">{diagnosis.symptoms}</div>
                </div>

                {/* Organic Desi Remedies */}
                <div className="diag-section">
                  <h3 className="diag-section-title">
                    <span>🌱</span> Organic & Home Remedies (देसी नुस्खे)
                  </h3>
                  <ul className="treatment-list">
                    {diagnosis.organicRemedies?.map((remedy, idx) => (
                      <li key={idx} className="treatment-item treatment-item-organic">
                        <span className="treatment-dot" />
                        <span>{remedy}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical Treatment & Dosage */}
                <div className="diag-section">
                  <h3 className="diag-section-title">
                    <span>🧪</span> Recommended Chemical Treatment (कीटनाशक व फफूंदनाशक)
                  </h3>
                  <ul className="treatment-list">
                    {diagnosis.chemicalTreatments?.map((chem, idx) => (
                      <li key={idx} className="treatment-item treatment-item-chemical">
                        <span className="treatment-dot" />
                        <span>{chem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="diag-section">
                  <h3 className="diag-section-title">
                    <span>🛡️</span> Prevention Checklist for Future
                  </h3>
                  <ul className="treatment-list">
                    {diagnosis.prevention?.map((prev, idx) => (
                      <li key={idx} className="treatment-item">
                        <span className="treatment-dot" style={{ background: '#64748b' }} />
                        <span>{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button type="button" className="ask-doctor-btn" onClick={askAiDoctor}>
                  💬 Ask AI Assistant Follow-up Questions
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
