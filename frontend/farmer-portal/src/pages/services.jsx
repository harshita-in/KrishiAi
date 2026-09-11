import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './services.css';

const navItems = [
  { label: 'Home (होम)', to: '/home', exact: true },
  { label: 'Marketplace (बाजार / फसल बेचें)', to: '/portal' },
  { label: 'Kisan Chopal (किसान चौपाल)', to: '/chopal' },
  { label: 'Services (सेवाएं व योजनाएं)', to: '/services' },
  { label: 'AI Crop Doctor (फसल डॉक्टर)', to: '/chat' },
  { label: 'Profile (प्रोफाइल)', to: '/profile' },
];

const SCHEMES_LIST = [
  {
    id: 'pm-kisan',
    title: 'PM-Kisan Samman Nidhi (पीएम-किसान सम्मान निधि)',
    ministry: 'Ministry of Agriculture & Farmers Welfare (कृषि व किसान कल्याण मंत्रालय)',
    badge: '₹6,000 / Year Cash Transfer (₹6,000 वार्षिक सहायता)',
    benefits: 'Direct financial assistance of ₹6,000 annually provided in 3 equal installments of ₹2,000 directly into Aadhaar-linked bank accounts. (सालाना ₹6,000 की सीधी वित्तीय सहायता, ₹2,000 की 3 समान किस्तों में बैंक खाते में।)',
    eligibility: 'All landholding farmer families with cultivable land in their name. (सभी भूमिधारक किसान परिवार जिनके नाम पर कृषि भूमि है।)',
    documents: 'Aadhaar Card, Land ownership papers (Khatauni/Khasra), Active Bank Passbook. (आधार कार्ड, खतौनी/खसरा नकल, बैंक पासबुक।)',
    applyUrl: 'https://pmkisan.gov.in/'
  },
  {
    id: 'pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) (प्रधानमंत्री फसल बीमा योजना)',
    ministry: 'Department of Agriculture & Farmers Welfare (कृषि विभाग, भारत सरकार)',
    badge: 'Comprehensive Crop Insurance (फसल सुरक्षा बीमा)',
    benefits: 'Affordable crop insurance against non-preventable natural risks (drought, flood, unseasonal rain, pests). Farmer premium capped at just 1.5% for Rabi and 2% for Kharif. (प्राकृतिक आपदाओं से फसल सुरक्षा। रबी फसलों पर मात्र 1.5% व खरीफ पर 2% प्रीमियम।)',
    eligibility: 'All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers. (अधिसूचित क्षेत्रों में अधिसूचित फसल उगाने वाले सभी किसान।)',
    documents: 'Land possession certificate, Sowing certificate / declaration, Bank account details. (भूमि स्वामित्व प्रमाण, बुवाई घोषणा पत्र, बैंक पासबुक।)',
    applyUrl: 'https://pmfby.gov.in/'
  },
  {
    id: 'kcc',
    title: 'Kisan Credit Card (KCC Loan) (किसान क्रेडिट कार्ड ऋण)',
    ministry: 'NABARD & Reserve Bank of India (नाबार्ड व रिजर्व बैंक)',
    badge: 'Subsidized 4% Interest Loan (4% ब्याज दर पर सस्ता ऋण)',
    benefits: 'Collateral-free credit up to ₹1.6 Lakhs (and up to ₹3 Lakhs with land pledge) at an effective 4% annual interest rate with timely repayment. (समय पर भुगतान करने पर मात्र 4% प्रभावी वार्षिक ब्याज दर पर ₹3 लाख तक का रियायती कृषि ऋण।)',
    eligibility: 'Individual/joint borrowers who are owner cultivators, tenant farmers, or oral lessees. (सभी काश्तकार, पट्टेदार व व्यक्तिगत किसान।)',
    documents: 'Identity proof, address proof, land record papers, passport photos. (पहचान पत्र, भूमि दस्तावेज, बैंक विवरण, फोटो।)',
    applyUrl: 'https://myscheme.gov.in/schemes/kcc'
  },
  {
    id: 'pm-kusum',
    title: 'PM-KUSUM Solar Pump Scheme (पीएम-कुसुम सोलर पंप योजना)',
    ministry: 'Ministry of New and Renewable Energy (नवीन व नवीकरणीय ऊर्जा मंत्रालय)',
    badge: 'Up to 60% Solar Subsidy (60% तक सोलर अनुदान)',
    benefits: 'Subsidy of 60% (30% Central + 30% State) for installing standalone solar agriculture pumps and solarizing existing grid pumps. (खेतों में सोलर कृषि पंप लगाने के लिए 60% सरकारी सब्सिडी (30% केंद्र + 30% राज्य)।)',
    eligibility: 'Individual farmers, farmer groups, cooperatives, and water user associations. (व्यक्तिगत किसान, किसान समूह व सहकारी समितियां।)',
    documents: 'Aadhaar, Land ownership documents, bank account, electricity connection details. (आधार कार्ड, जमीन के दस्तावेज, बैंक पासबुक।)',
    applyUrl: 'https://pmkusum.mnre.gov.in/'
  },
  {
    id: 'soil-health',
    title: 'Soil Health Card Scheme (मृदा स्वास्थ्य कार्ड योजना)',
    ministry: 'Ministry of Agriculture (कृषि मंत्रालय, भारत सरकार)',
    badge: 'Free Soil Lab Testing (मुफ्त मिट्टी जांच व सिफारिश)',
    benefits: 'Provides farmers with 12-parameter soil health analysis and customized fertilizer dosage recommendations to reduce unnecessary urea costs. (मिट्टी के 12 पोषक तत्वों की प्रयोगशाला जांच व संतुलित खाद की सटीक सिफारिश।)',
    eligibility: 'Available to all agricultural landholders across India. (देश के सभी कृषि भूमिधारक किसानों के लिए उपलब्ध।)',
    documents: 'Soil sample collected by local agricultural officer or submitted at nearest Krishi Vigyan Kendra (KVK). (निकटतम कृषि विज्ञान केंद्र या कृषि अधिकारी को दिया गया मिट्टी का नमूना।)',
    applyUrl: 'https://soilhealth.dac.gov.in/'
  }
];

export default function Services() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'schemes' | 'calculator'

  // Bahi-Khata State
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Seeds (बीज)', amount: 4500, note: 'Certified Wheat HD-2967' },
    { id: 2, category: 'Fertilizer (खाद / उर्वरक)', amount: 6200, note: 'Urea 3 bags + DAP 2 bags' },
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
        return { urea: (acres * 2.5).toFixed(1), dap: (acres * 1.0).toFixed(1), mop: (acres * 0.5).toFixed(1), water: '4 - 5 Irrigations (CRI, Tillering, Flowering) / 4-5 सिंचाई' };
      case 'Paddy':
        return { urea: (acres * 3.0).toFixed(1), dap: (acres * 1.2).toFixed(1), mop: (acres * 0.8).toFixed(1), water: 'Continuous Shallow Ponding (5 cm) / खेत में 5 सेमी जल भराव' };
      case 'Soybean':
        return { urea: (acres * 0.5).toFixed(1), dap: (acres * 1.5).toFixed(1), mop: (acres * 0.8).toFixed(1), water: 'Monsoon Dependent (1-2 protective at pod fill) / फली भरते समय 1-2 सिंचाई' };
      case 'Mustard':
        return { urea: (acres * 1.8).toFixed(1), dap: (acres * 1.0).toFixed(1), mop: (acres * 0.4).toFixed(1), water: '2 - 3 Irrigations + Sulphur 15 kg/acre / 2-3 सिंचाई व 15 किग्रा सल्फर' };
      case 'Cotton':
        return { urea: (acres * 3.2).toFixed(1), dap: (acres * 1.5).toFixed(1), mop: (acres * 1.0).toFixed(1), water: '5 - 6 Irrigations (Square & Boll formation) / 5-6 सिंचाई (डोडा बनते समय)' };
      case 'Maize':
        return { urea: (acres * 2.8).toFixed(1), dap: (acres * 1.2).toFixed(1), mop: (acres * 0.6).toFixed(1), water: '4 - 5 Irrigations (Silking & Tasseling) / 4-5 सिंचाई' };
      case 'Sugarcane':
        return { urea: (acres * 5.0).toFixed(1), dap: (acres * 2.0).toFixed(1), mop: (acres * 1.5).toFixed(1), water: '8 - 10 Irrigations (High water requirement) / 8-10 सिंचाई' };
      case 'Chana':
        return { urea: (acres * 0.4).toFixed(1), dap: (acres * 1.2).toFixed(1), mop: (acres * 0.4).toFixed(1), water: '1 - 2 Light Irrigations (Pre-flowering) / 1-2 हल्की सिंचाई (फूल आने से पहले)' };
      case 'Potato':
        return { urea: (acres * 3.5).toFixed(1), dap: (acres * 1.8).toFixed(1), mop: (acres * 1.2).toFixed(1), water: '6 - 7 Light Furrow Irrigations / 6-7 हल्की सिंचाई' };
      case 'Onion':
        return { urea: (acres * 2.2).toFixed(1), dap: (acres * 1.4).toFixed(1), mop: (acres * 1.0).toFixed(1), water: '8 - 10 Frequent Light Irrigations / 8-10 बार हल्की सिंचाई' };
      case 'Groundnut':
        return { urea: (acres * 0.6).toFixed(1), dap: (acres * 1.4).toFixed(1), mop: (acres * 0.8).toFixed(1), water: '3 - 4 Irrigations + Gypsum 100 kg/acre / 3-4 सिंचाई व जिप्सम' };
      case 'Tomato':
        return { urea: (acres * 2.6).toFixed(1), dap: (acres * 1.5).toFixed(1), mop: (acres * 1.0).toFixed(1), water: 'Drip / Furrow every 4-6 days / ड्रिप या 4-6 दिन पर सिंचाई' };
      case 'Garlic':
        return { urea: (acres * 2.4).toFixed(1), dap: (acres * 1.5).toFixed(1), mop: (acres * 0.9).toFixed(1), water: '7 - 9 Light Irrigations + Sulphur 20 kg/acre / 7-9 हल्की सिंचाई व सल्फर' };
      case 'Turmeric':
        return { urea: (acres * 2.5).toFixed(1), dap: (acres * 1.6).toFixed(1), mop: (acres * 1.2).toFixed(1), water: '15 - 20 Days interval / 15-20 दिन के अंतराल पर सिंचाई' };
      case 'Bajra':
        return { urea: (acres * 1.8).toFixed(1), dap: (acres * 0.8).toFixed(1), mop: (acres * 0.4).toFixed(1), water: '1 - 2 Protective Irrigations / 1-2 सुरक्षात्मक सिंचाई' };
      default:
        return { urea: (acres * 2.0).toFixed(1), dap: (acres * 1.0).toFixed(1), mop: (acres * 0.5).toFixed(1), water: 'Moderate 3 - 4 Irrigations / 3-4 सामान्य सिंचाई' };
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
          <span className="brand-kicker">KrishiAI Services (कृषि एआई सेवाएं)</span>
          <span className="brand-title">Kisan Financial & Welfare Hub (किसान वित्तीय व कल्याण केंद्र)</span>
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
          Logout (लॉगआउट)
        </button>
      </header>

      <main className="services-main">
        <div className="services-header">
          <span className="services-kicker">💼 Financial Planning & Welfare (वित्तीय नियोजन व सरकारी योजनाएं)</span>
          <h1>Empowering Farmers with Ledger, Schemes & Calculators (बही-खाता, सरकारी योजनाएं व खाद कैलकुलेटर)</h1>
          <p>
            Track your seasonal crop expenses, calculate net profit, apply for central agricultural schemes,
            and compute precision fertilizer requirements. (खेती की लागत व शुद्ध मुनाफे का हिसाब रखें, सरकारी योजनाओं की जानकारी पाएं और सटीक खाद मात्रा जानें।)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="services-tabs-nav">
          <button
            type="button"
            className={`services-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            <span>📖 Kisan Bahi-Khata (बही-खाता व मुनाफा)</span>
          </button>
          <button
            type="button"
            className={`services-tab-btn ${activeTab === 'schemes' ? 'active' : ''}`}
            onClick={() => setActiveTab('schemes')}
          >
            <span>🏛️ Sarkari Yojna (सरकारी योजनाएं)</span>
          </button>
          <button
            type="button"
            className={`services-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <span>🧮 Fertilizer & Water Calculator (खाद व सिंचाई गणक)</span>
          </button>
        </div>

        {/* TAB 1: BAHI-KHATA */}
        {activeTab === 'ledger' && (
          <div>
            <div className="financial-summary-banner">
              <div className="fin-stat-box">
                <span className="fin-stat-label">Total Investment / Cost (कुल खर्चा)</span>
                <span className="fin-stat-val expense-red">₹{totalExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="fin-stat-box">
                <span className="fin-stat-label">Harvest Revenue Sold (कुल बिक्री आमदनी)</span>
                <span className="fin-stat-val">₹{harvestRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="fin-stat-box">
                <span className="fin-stat-label">Net Profit (शुद्ध मुनाफा)</span>
                <span className="fin-stat-val profit-green">₹{netProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="fin-stat-box">
                <span className="fin-stat-label">Profit Margin (मुनाफा दर)</span>
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
                      Expense Category (खर्च की श्रेणी)
                    </label>
                    <select
                      className="upload-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Seeds (बीज)">Seeds (बीज)</option>
                      <option value="Fertilizer (खाद / उर्वरक)">Fertilizer (खाद / उर्वरक)</option>
                      <option value="Tractor / Ploughing (जुताई)">Tractor / Ploughing (जुताई)</option>
                      <option value="Labour (मजदूरी)">Labour (मजदूरी)</option>
                      <option value="Pesticides (दवाई / कीटनाशक)">Pesticides (दवाई / कीटनाशक)</option>
                      <option value="Diesel / Electricity (डीजल व बिजली)">Diesel / Electricity (डीजल व बिजली)</option>
                      <option value="Transport / Mandi (भाड़ा व परिवहन)">Transport / Mandi (भाड़ा व परिवहन)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                      Amount (रुपये - ₹)
                    </label>
                    <input
                      type="number"
                      className="upload-input"
                      placeholder="e.g. 2500 (जैसे 2500)"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                      Notes / Shop Details (विवरण / दुकान का नाम)
                    </label>
                    <input
                      type="text"
                      className="upload-input"
                      placeholder="e.g. Purchased 2 bags from Kisan Seva Kendra (जैसे 2 बोरी खाद खरीदी)"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="diagnose-submit-btn">
                    ➕ Add to Ledger (बही-खाता में जोड़ें)
                  </button>
                </form>

                <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                    Harvest Income / Selling Total (कुल फसल बिक्री आमदनी - ₹)
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
                  Itemized Expense Records (कुल दर्ज खर्चे) ({expenses.length})
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
                        title="Delete (हटाएं)"
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
                    <strong style={{ color: '#047857' }}>✓ Eligibility (पात्रता):</strong> {scheme.eligibility}
                  </div>
                  <div>
                    <strong style={{ color: '#047857' }}>📄 Documents (दस्तावेज):</strong> {scheme.documents}
                  </div>
                </div>

                <a
                  href={scheme.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="scheme-apply-link"
                >
                  🔗 View Official Portal & Apply Online (आधिकारिक पोर्टल देखें व आवेदन करें) &rarr;
                </a>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: FERTILIZER CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="calc-card">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', marginBottom: 6, textAlign: 'center' }}>
              Precision Fertilizer & Water Calculator (सटीक खाद व सिंचाई कैलकुलेटर)
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#64748b', marginBottom: 24, textAlign: 'center' }}>
              Enter your land area to get exact bag counts for balanced soil nutrition and water cycles. (अपनी जमीन का रकबा (एकड़) चुनें और खाद की बोरियों की सटीक मात्रा जानें।)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                  Land Area (खेत का रकबा - एकड़)
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
                  Target Crop (लक्षित फसल)
                </label>
                <select
                  className="upload-select"
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                >
                  <optgroup label="Cereals & Grains (अनाज)">
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Paddy">Paddy / Rice (धान)</option>
                    <option value="Maize">Maize (मक्का)</option>
                    <option value="Bajra">Bajra (बाजरा)</option>
                  </optgroup>
                  <optgroup label="Pulses (दालें / दलहन)">
                    <option value="Chana">Chana (चना)</option>
                  </optgroup>
                  <optgroup label="Oilseeds (तिलहन)">
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Mustard">Mustard (सरसों / राई)</option>
                    <option value="Groundnut">Groundnut (मूंगफली)</option>
                  </optgroup>
                  <optgroup label="Cash Crops (नकदी फसलें)">
                    <option value="Cotton">Cotton (कपास)</option>
                    <option value="Sugarcane">Sugarcane (गन्ना)</option>
                  </optgroup>
                  <optgroup label="Vegetables & Spices (सब्जियां व मसाले)">
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Onion">Onion (प्याज)</option>
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Garlic">Garlic (लहसुन)</option>
                    <option value="Turmeric">Turmeric (हल्दी)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="calc-results-grid">
              <div className="calc-bag-box">
                <div className="calc-bag-num">{calcResults.urea}</div>
                <div className="calc-bag-title">Urea (यूरिया)</div>
                <div className="calc-bag-sub">45 kg bags (45 किग्रा मानक बैग)</div>
              </div>

              <div className="calc-bag-box">
                <div className="calc-bag-num">{calcResults.dap}</div>
                <div className="calc-bag-title">D.A.P. (डीएपी)</div>
                <div className="calc-bag-sub">50 kg bags (50 किग्रा मानक बैग)</div>
              </div>

              <div className="calc-bag-box">
                <div className="calc-bag-num">{calcResults.mop}</div>
                <div className="calc-bag-title">M.O.P. Potash (पोटाश)</div>
                <div className="calc-bag-sub">50 kg bags (50 किग्रा मानक बैग)</div>
              </div>
            </div>

            <div style={{ marginTop: 22, background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#064e3b', marginBottom: 6 }}>
                💧 Irrigation Schedule (सिंचाई शिड्यूल) — {calcCrop} ({calcAcre} Acres / एकड़):
              </div>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {calcResults.water}. Apply DAP and Potash during basal field preparation (sowing time). Split Urea into 2 or 3 top-dressings at crown root initiation and tillering stages. (डीएपी व पोटाश की पूरी मात्रा बुवाई के समय बेसल डोज में दें। यूरिया को 2-3 भागों में बांटकर पहली व दूसरी सिंचाई पर दें।)
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
