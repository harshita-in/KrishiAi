import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './services.css';

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

const SCHEMES_LIST = [
  {
    id: 'pm-kisan',
    title: 'PM-Kisan Samman Nidhi (पीएम-किसान)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    badge: '₹6,000 / Year Cash Transfer',
    benefits: 'Direct financial assistance of ₹6,000 annually provided in 3 equal installments of ₹2,000 directly into Aadhaar-linked bank accounts.',
    eligibility: 'All landholding farmer families with cultivable land in their name.',
    documents: 'Aadhaar Card, Land ownership papers (Khatauni/Khasra), Active Bank Passbook.',
    applyUrl: 'https://pmkisan.gov.in/'
  },
  {
    id: 'pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    ministry: 'Department of Agriculture & Farmers Welfare',
    badge: 'Comprehensive Crop Insurance',
    benefits: 'Affordable crop insurance against non-preventable natural risks (drought, flood, unseasonal rain, pests). Farmer premium capped at just 1.5% for Rabi and 2% for Kharif.',
    eligibility: 'All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.',
    documents: 'Land possession certificate, Sowing certificate / declaration, Bank account details.',
    applyUrl: 'https://pmfby.gov.in/'
  },
  {
    id: 'kcc',
    title: 'Kisan Credit Card (KCC Loan)',
    ministry: 'NABARD & Reserve Bank of India',
    badge: 'Subsidized 4% Interest Loan',
    benefits: 'Collateral-free credit up to ₹1.6 Lakhs (and up to ₹3 Lakhs with land pledge) at an effective 4% annual interest rate with timely repayment.',
    eligibility: 'Individual/joint borrowers who are owner cultivators, tenant farmers, or oral lessees.',
    documents: 'Identity proof, address proof, land record papers, passport photos.',
    applyUrl: 'https://myscheme.gov.in/schemes/kcc'
  },
  {
    id: 'pm-kusum',
    title: 'PM-KUSUM Solar Pump Scheme',
    ministry: 'Ministry of New and Renewable Energy',
    badge: 'Up to 60% Solar Subsidy',
    benefits: 'Subsidy of 60% (30% Central + 30% State) for installing standalone solar agriculture pumps and solarizing existing grid pumps.',
    eligibility: 'Individual farmers, farmer groups, cooperatives, and water user associations.',
    documents: 'Aadhaar, Land ownership documents, bank account, electricity connection details (if grid-connected).',
    applyUrl: 'https://pmkusum.mnre.gov.in/'
  },
  {
    id: 'soil-health',
    title: 'Soil Health Card Scheme (मृदा स्वास्थ्य कार्ड)',
    ministry: 'Ministry of Agriculture',
    badge: 'Free Soil Lab Testing',
    benefits: 'Provides farmers with 12-parameter soil health analysis and customized fertilizer dosage recommendations to reduce unnecessary urea costs.',
    eligibility: 'Available to all agricultural landholders across India.',
    documents: 'Soil sample collected by local agricultural officer or submitted at nearest Krishi Vigyan Kendra (KVK).',
    applyUrl: 'https://soilhealth.dac.gov.in/'
  }
];

export default function Services() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'schemes' | 'calculator'

  // Bahi-Khata State
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Seeds (बीज)', amount: 4500, note: 'Certified Wheat HD-2967' },
    { id: 2, category: 'Fertilizer (खाद)', amount: 6200, note: 'Urea 3 bags + DAP 2 bags' },
    { id: 3, category: 'Tractor / Ploughing (जुताई)', amount: 3800, note: '2 rounds deep rotavator' },
    { id: 4, category: 'Labour (मजदूरी)', amount: 5000, note: 'Weeding & irrigation labour' },
  ]);
  const [harvestRevenue, setHarvestRevenue] = useState(48000);
  const [newCategory, setNewCategory] = useState('Seeds (बीज)');
  const [newAmount, setNewAmount] = useState('');
  const [newNote, setNewNote] = useState('');

  // Fertilizer Calculator State
  const [calcAcre, setCalcAcre] = useState(2);
  const [calcCrop, setCalcCrop] = useState('Wheat');

  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const netProfit = harvestRevenue - totalExpense;
  const profitMargin = harvestRevenue > 0 ? ((netProfit / harvestRevenue) * 100).toFixed(1) : 0;

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newAmount || Number(newAmount) <= 0) return;
    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        category: newCategory,
        amount: Number(newAmount),
        note: newNote || 'General expense'
      }
    ]);
    setNewAmount('');
    setNewNote('');
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Fertilizer Bag Calculation formulas based on acreage
  const calcResults = (() => {
    const acres = Number(calcAcre) || 1;
    switch (calcCrop) {
      case 'Wheat':
        return { urea: (acres * 2.5).toFixed(1), dap: (acres * 1.0).toFixed(1), mop: (acres * 0.5).toFixed(1), water: '4 - 5 Irrigations' };
      case 'Paddy':
        return { urea: (acres * 3.0).toFixed(1), dap: (acres * 1.2).toFixed(1), mop: (acres * 0.8).toFixed(1), water: 'Continuous Shallow Ponding' };
      case 'Soybean':
        return { urea: (acres * 0.5).toFixed(1), dap: (acres * 1.5).toFixed(1), mop: (acres * 0.8).toFixed(1), water: 'Monsoon Dependent (1-2 protective)' };
      case 'Mustard':
        return { urea: (acres * 1.8).toFixed(1), dap: (acres * 1.0).toFixed(1), mop: (acres * 0.4).toFixed(1), water: '2 - 3 Irrigations + Sulphur 15kg' };
      case 'Cotton':
        return { urea: (acres * 3.2).toFixed(1), dap: (acres * 1.5).toFixed(1), mop: (acres * 1.0).toFixed(1), water: '5 - 6 Irrigations' };
      default:
        return { urea: (acres * 2.0).toFixed(1), dap: (acres * 1.0).toFixed(1), mop: (acres * 0.5).toFixed(1), water: 'Moderate' };
    }
  })();

  return (
    <div className="services-shell">
      {/* Aurora Glows */}
      <div className="farmer-aurora farmer-aurora-one" />
      <div className="farmer-aurora farmer-aurora-two" />

      {/* Navigation */}
      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI Services</span>
          <span className="brand-title">Kisan Financial & Welfare Hub</span>
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

      <main className="services-main">
        <div className="services-header">
          <span className="services-kicker">💼 Financial Planning & Welfare</span>
          <h1>Empowering Farmers with Ledger, Schemes & Calculators</h1>
          <p>
            Track your seasonal crop expenses, calculate net profit, apply for central agricultural schemes,
            and compute precision fertilizer requirements.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="services-tabs-nav">
          <button
            type="button"
            className={`services-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            <span>📖 Kisan Bahi-Khata (Expense & Profit)</span>
          </button>
          <button
            type="button"
            className={`services-tab-btn ${activeTab === 'schemes' ? 'active' : ''}`}
            onClick={() => setActiveTab('schemes')}
          >
            <span>🏛️ Sarkari Yojna (Govt Schemes)</span>
          </button>
          <button
            type="button"
            className={`services-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <span>🧮 Fertilizer & Water Calculator</span>
          </button>
        </div>

        {/* TAB 1: BAHI-KHATA */}
        {activeTab === 'ledger' && (
          <div>
            <div className="financial-summary-banner">
              <div className="fin-stat-box">
                <span className="fin-stat-label">Total Investment / Cost</span>
                <span className="fin-stat-val expense-red">₹{totalExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="fin-stat-box">
                <span className="fin-stat-label">Harvest Revenue Sold</span>
                <span className="fin-stat-val">₹{harvestRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="fin-stat-box">
                <span className="fin-stat-label">Net Profit (शुद्ध लाभ)</span>
                <span className="fin-stat-val profit-green">₹{netProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="fin-stat-box">
                <span className="fin-stat-label">Profit Margin</span>
                <span className="fin-stat-val profit-green">{profitMargin}%</span>
              </div>
            </div>

            <div className="bahi-khata-grid">
              {/* Form to Add Expense */}
              <div className="ledger-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', marginBottom: 16 }}>
                  Record Farm Expense (खर्चा जोड़ें)
                </h2>

                <form onSubmit={handleAddExpense}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                      Expense Category
                    </label>
                    <select
                      className="upload-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Seeds (बीज)">Seeds (बीज)</option>
                      <option value="Fertilizer (खाद)">Fertilizer (खाद)</option>
                      <option value="Tractor / Ploughing (जुताई)">Tractor / Ploughing (जुताई)</option>
                      <option value="Labour (मजदूरी)">Labour (मजदूरी)</option>
                      <option value="Pesticides (दवाई / कीटनाशक)">Pesticides (दवाई / कीटनाशक)</option>
                      <option value="Diesel / Electricity (डीजल/बिजली)">Diesel / Electricity (डीजल/बिजली)</option>
                      <option value="Transport / Mandi (भाड़ा)">Transport / Mandi (भाड़ा)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      className="upload-input"
                      placeholder="e.g. 2500"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                      Notes / Shop Details
                    </label>
                    <input
                      type="text"
                      className="upload-input"
                      placeholder="e.g. Purchased 2 bags from Kisan Seva Kendra"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="diagnose-submit-btn">
                    ➕ Add to Ledger
                  </button>
                </form>

                <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                    Harvest Income / Selling Total (₹)
                  </label>
                  <input
                    type="number"
                    className="upload-input"
                    value={harvestRevenue}
                    onChange={(e) => setHarvestRevenue(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Expense Records List */}
              <div className="ledger-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', marginBottom: 16 }}>
                  Itemized Expense Records ({expenses.length})
                </h2>

                {expenses.map((item) => (
                  <div key={item.id} className="expense-row-item">
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.category}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.note}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <strong style={{ color: '#b91c1c', fontSize: '1rem' }}>₹{item.amount.toLocaleString('en-IN')}</strong>
                      <button
                        type="button"
                        onClick={() => removeExpense(item.id)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOVT SCHEMES */}
        {activeTab === 'schemes' && (
          <div className="schemes-container">
            {SCHEMES_LIST.map((scheme) => (
              <div key={scheme.id} className="scheme-card">
                <div className="scheme-header">
                  <div>
                    <h2 className="scheme-title">{scheme.title}</h2>
                    <span className="scheme-ministry">{scheme.ministry}</span>
                  </div>
                  <span className="scheme-badge">{scheme.badge}</span>
                </div>

                <p style={{ color: '#334155', fontSize: '0.94rem', lineHeight: 1.6, margin: '8px 0' }}>
                  {scheme.benefits}
                </p>

                <div className="scheme-body">
                  <div>
                    <strong style={{ color: '#047857' }}>✓ Eligibility:</strong> {scheme.eligibility}
                  </div>
                  <div>
                    <strong style={{ color: '#047857' }}>📄 Documents:</strong> {scheme.documents}
                  </div>
                </div>

                <a
                  href={scheme.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="scheme-apply-link"
                >
                  🔗 View Official Portal & Apply Online &rarr;
                </a>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: FERTILIZER CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="calc-card">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', marginBottom: 6, textAlign: 'center' }}>
              Precision Fertilizer & Water Calculator
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#64748b', marginBottom: 24, textAlign: 'center' }}>
              Enter your land area to get exact bag counts for balanced soil nutrition and water cycles.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                  Land Area (Acres)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  className="upload-input"
                  value={calcAcre}
                  onChange={(e) => setCalcAcre(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                  Target Crop
                </label>
                <select
                  className="upload-select"
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Paddy">Paddy / Rice (धान)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                  <option value="Cotton">Cotton (कपास)</option>
                </select>
              </div>
            </div>

            <div className="calc-results-grid">
              <div className="calc-bag-box">
                <div className="calc-bag-num">{calcResults.urea}</div>
                <div className="calc-bag-title">Urea (यूरिया)</div>
                <div className="calc-bag-sub">45 kg standard bags</div>
              </div>

              <div className="calc-bag-box">
                <div className="calc-bag-num">{calcResults.dap}</div>
                <div className="calc-bag-title">D.A.P. (डीएपी)</div>
                <div className="calc-bag-sub">50 kg standard bags</div>
              </div>

              <div className="calc-bag-box">
                <div className="calc-bag-num">{calcResults.mop}</div>
                <div className="calc-bag-title">M.O.P. Potash (पोटाश)</div>
                <div className="calc-bag-sub">50 kg standard bags</div>
              </div>
            </div>

            <div style={{ marginTop: 22, background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#064e3b', marginBottom: 6 }}>
                💧 Irrigation Schedule for {calcCrop} on {calcAcre} Acres:
              </div>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {calcResults.water}. Apply DAP and Potash during basal field preparation (sowing time). Split Urea into 2 or 3 top-dressings at crown root initiation and tillering stages.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
