import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './home.css';
import './chopal.css';

const navItems = [
  { label: 'Home (होम)', to: '/home', exact: true },
  { label: 'Marketplace (बाजार / फसल बेचें)', to: '/portal' },
  { label: 'Kisan Chopal (किसान चौपाल)', to: '/chopal' },
  { label: 'Services (सेवाएं व योजनाएं)', to: '/services' },
  { label: 'AI Crop Doctor (फसल डॉक्टर)', to: '/chat' },
  { label: 'Profile (प्रोफाइल)', to: '/profile' },
];

const categories = [
  { id: 'All', label: '🌾 All Discussions (सभी चर्चाएं)' },
  { id: 'Pest & Disease', label: '🐛 Pest & Disease (कीट व रोग)' },
  { id: 'Organic Farming', label: '🌿 Organic Farming (जैविक खेती)' },
  { id: 'Mandi & Pricing', label: '📊 Mandi & Pricing (मंडी भाव चर्चा)' },
  { id: 'General', label: '🚜 General (सामान्य सलाह)' }
];

export default function Chopal() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('farmer_user') || sessionStorage.getItem('farmer_user');
  let currentFarmerName = 'Kisan Mitra';
  try {
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u.name) currentFarmerName = u.name;
    }
  } catch (e) {}

  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [submittingReply, setSubmittingReply] = useState(false);

  // New Post Form State
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    cropTag: 'Wheat (गेहूं)',
    category: 'Pest & Disease'
  });
  const [posting, setPosting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const res = await apiFetch(`/api/community/posts?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch chopal posts:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle Upvote
  const handleUpvote = async (postId) => {
    // Optimistic UI update
    setPosts(prev =>
      prev.map(p => {
        if (p._id === postId) {
          return { ...p, upvotes: (p.upvotes || 0) + 1 };
        }
        return p;
      })
    );

    try {
      await apiFetch(`/api/community/posts/${postId}/upvote`, { method: 'POST' });
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  // Toggle replies accordion
  const toggleReplies = (postId) => {
    setExpandedReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Submit a reply
  const handleAddReply = async (postId) => {
    const text = replyInputs[postId]?.trim();
    if (!text) return;

    setSubmittingReply(true);
    try {
      const res = await apiFetch(`/api/community/posts/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: currentFarmerName,
          authorRole: 'Farmer',
          text
        })
      });
      const data = await res.json();
      if (res.ok && data.post) {
        setPosts(prev => prev.map(p => p._id === postId ? data.post : p));
        setReplyInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error('Reply submission error:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Create new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    setPosting(true);
    try {
      const res = await apiFetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: currentFarmerName,
          authorRole: 'Farmer',
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          cropTag: newPost.cropTag,
          category: newPost.category
        })
      });
      const data = await res.json();
      if (res.ok && data.post) {
        setPosts(prev => [data.post, ...prev]);
        setShowModal(false);
        setNewPost({
          title: '',
          content: '',
          cropTag: 'Wheat (गेहूं)',
          category: 'Pest & Disease'
        });
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="chopal-shell">
      {/* Background ambient lighting */}
      <div className="farmer-aurora farmer-aurora-one" />
      <div className="farmer-aurora farmer-aurora-two" />

      {/* Navigation */}
      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI Community (कृषि एआई समुदाय)</span>
          <span className="brand-title">Kisan Chopal Forum (किसान चौपाल मंच)</span>
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

      <main className="chopal-main">
        {/* Header */}
        <div className="chopal-header">
          <span className="chopal-kicker">
            👥 Krishak Samvaad • Certified KVK & Peer Agri-Forum (कृषक संवाद • किसान व वैज्ञानिक चर्चा मंच)
          </span>
          <h1>Kisan Chopal (किसान चौपाल - आपस में पूछें और सीखें)</h1>
          <p>
            Collaborate with progressive farmers and Krishi Vigyan Kendra agronomists.
            Ask crop disease remedies, share verified local desi formulations, and discuss mandi prices. (साथी किसानों व कृषि वैज्ञानिकों से जुड़ें। फसल रोगों का देशी व वैज्ञानिक समाधान पूछें और मंडी भावों पर चर्चा करें।)
          </p>
        </div>

        {/* Controls Bar: Search & Ask Question */}
        <div className="chopal-controls-card">
          <div className="chopal-search-box">
            <span role="img" aria-label="search">🔍</span>
            <input
              type="text"
              placeholder="Search discussions (e.g. Gehu, Aphid, Urea dosage, Mustard)... (चर्चा खोजें जैसे गेहूं, माहू, यूरिया, सरसों...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className="chopal-ask-btn"
            onClick={() => setShowModal(true)}
          >
            <span>✍️</span> Ask Question (चौपाल में पूछें)
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="chopal-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Threads List */}
        {loading && posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
            Loading Kisan Chopal discussions... (किसान चौपाल चर्चा लोड हो रही है...)
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 24,
            border: '1px dashed #cbd5e1'
          }}>
            <h3 style={{ color: '#064e3b', marginBottom: 6 }}>No discussions found (कोई चर्चा नहीं मिली)</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
              Be the first progressive farmer to start a conversation on this topic! (इस विषय पर सवाल पूछने वाले पहले किसान बनें!)
            </p>
            <button
              type="button"
              className="chopal-ask-btn"
              style={{ marginTop: 12 }}
              onClick={() => setShowModal(true)}
            >
              Ask First Question (पहला सवाल पूछें) &rarr;
            </button>
          </div>
        ) : (
          posts.map((post) => {
            const isExpanded = !!expandedReplies[post._id];
            const repliesCount = post.replies?.length || 0;
            const authorInitial = post.authorName ? post.authorName.charAt(0).toUpperCase() : 'K';
            const isExpert = post.authorRole?.toLowerCase().includes('scientist') || post.authorRole?.toLowerCase().includes('expert');

            return (
              <article key={post._id} className="thread-card">
                {/* Meta Row */}
                <div className="thread-meta-row">
                  <div className="author-info">
                    <div className="author-avatar">{authorInitial}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>{post.authorName}</strong>
                        <span className={`author-role-badge ${isExpert ? 'role-expert' : 'role-farmer'}`}>
                          {isExpert ? 'Expert / वैज्ञानिक' : post.authorRole || 'Farmer / किसान'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently (हाल ही में)'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#ecfdf5',
                      color: '#047857',
                      border: '1px solid rgba(4, 120, 87, 0.15)'
                    }}>
                      {post.cropTag}
                    </span>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#f1f5f9',
                      color: '#475569'
                    }}>
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Title and Content */}
                <h3 className="thread-title">{post.title}</h3>
                <p className="thread-body">{post.content}</p>

                {/* Actions Row */}
                <div className="thread-actions-row">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="upvote-btn"
                      onClick={() => handleUpvote(post._id)}
                      title="Upvote helpful question (मददगार सवाल को वोट दें)"
                    >
                      <span>👍 Helpful (मददगार)</span>
                      <strong>{post.upvotes || 0}</strong>
                    </button>

                    <button
                      type="button"
                      className="reply-toggle-btn"
                      onClick={() => toggleReplies(post._id)}
                    >
                      <span>💬 {repliesCount} {repliesCount === 1 ? 'Answer (जवाब)' : 'Answers (जवाब)'}</span>
                      <span>{isExpanded ? '▲' : '▼'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const q = `Question from Kisan Chopal: "${post.title}" - Context: "${post.content}". As an agricultural expert, what is the best scientific solution?`;
                      navigate('/chat', { state: { prefillQuery: q } });
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#047857',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    Ask AI Agri-Doctor (एआई डॉक्टर से पूछें) &rarr;
                  </button>
                </div>

                {/* Expandable Answers / Replies List */}
                {isExpanded && (
                  <div className="replies-container">
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#064e3b', fontWeight: 800 }}>
                      Responses & Recommendations (जवाब व सलाह) ({repliesCount})
                    </h4>

                    {repliesCount === 0 ? (
                      <p style={{ fontSize: '0.84rem', color: '#64748b', fontStyle: 'italic', margin: '0 0 10px' }}>
                        No replies yet. Be the first to share your experience! (अभी कोई जवाब नहीं है। अपनी सलाह या अनुभव साझा करें!)
                      </p>
                    ) : (
                      post.replies.map((rep, idx) => {
                        const repIsExpert = rep.authorRole?.toLowerCase().includes('scientist') || rep.authorRole?.toLowerCase().includes('expert');
                        return (
                          <div key={idx} className="single-reply" style={{
                            borderColor: repIsExpert ? 'rgba(16, 185, 129, 0.4)' : '#e2e8f0',
                            background: repIsExpert ? '#f0fdf4' : '#ffffff'
                          }}>
                            <div className="reply-author-line">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{rep.authorName}</strong>
                                {repIsExpert && (
                                  <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: 999,
                                    background: '#047857',
                                    color: '#ffffff'
                                  }}>
                                    ✓ Verified Expert (प्रमाणित विशेषज्ञ)
                                  </span>
                                )}
                                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                  ({repIsExpert ? 'Scientist / विशेषज्ञ' : rep.authorRole || 'Farmer / किसान'})
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                              {rep.text}
                            </p>
                          </div>
                        );
                      })
                    )}

                    {/* Quick Reply Form */}
                    <div className="reply-input-box">
                      <input
                        type="text"
                        placeholder="Write your advice or answer... (अपनी सलाह या जवाब लिखें...)"
                        value={replyInputs[post._id] || ''}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [post._id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddReply(post._id);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddReply(post._id)}
                        disabled={submittingReply}
                      >
                        {submittingReply ? 'Posting... (भेज रहे हैं...)' : 'Post Reply (जवाब भेजें)'}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </main>

      {/* Ask Question Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#064e3b', fontWeight: 800 }}>
                Ask Kisan Chopal Community (किसान चौपाल में सवाल पूछें)
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Question Title (समस्या का शीर्षक) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gehu me peela ratua rog lagne par kiska spray karein? (जैसे गेहूं में पीला रतुआ लगने पर किसका स्प्रे करें?)"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Crop (फसल) *
                  </label>
                  <select
                    value={newPost.cropTag}
                    onChange={(e) => setNewPost({ ...newPost, cropTag: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="General Agriculture">🌾 General Agriculture (सामान्य कृषि)</option>
                    <optgroup label="Cereals & Grains (अनाज)">
                      <option value="Wheat (गेहूं)">Wheat (गेहूं)</option>
                      <option value="Paddy / Rice (धान)">Paddy / Rice (धान)</option>
                      <option value="Maize (मक्का)">Maize (मक्का)</option>
                      <option value="Bajra (बाजरा)">Bajra (बाजरा)</option>
                      <option value="Jowar (ज्वार)">Jowar (ज्वार)</option>
                      <option value="Barley (जौ)">Barley (जौ)</option>
                    </optgroup>
                    <optgroup label="Pulses (दालें / दलहन)">
                      <option value="Chana (चना)">Chana (चना)</option>
                      <option value="Tur / Arhar (तुअर / अरहर)">Tur / Arhar (तुअर / अरहर)</option>
                      <option value="Moong (मूंग)">Moong (मूंग)</option>
                      <option value="Urad (उड़द)">Urad (उड़द)</option>
                      <option value="Masoor (मसूर)">Masoor (मसूर)</option>
                    </optgroup>
                    <optgroup label="Oilseeds (तिलहन)">
                      <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन)</option>
                      <option value="Mustard (सरसों)">Mustard (सरसों)</option>
                      <option value="Groundnut (मूंगफली)">Groundnut (मूंगफली)</option>
                      <option value="Sunflower (सूरजमुखी)">Sunflower (सूरजमुखी)</option>
                      <option value="Sesame (तिल)">Sesame (तिल)</option>
                    </optgroup>
                    <optgroup label="Cash Crops (नकदी फसलें)">
                      <option value="Cotton (कपास)">Cotton (कपास)</option>
                      <option value="Sugarcane (गन्ना)">Sugarcane (गन्ना)</option>
                      <option value="Jute (पटसन / जूट)">Jute (पटसन / जूट)</option>
                    </optgroup>
                    <optgroup label="Vegetables & Spices (सब्जियां व मसाले)">
                      <option value="Onion (प्याज)">Onion (प्याज)</option>
                      <option value="Potato (आलू)">Potato (आलू)</option>
                      <option value="Tomato (टमाटर)">Tomato (टमाटर)</option>
                      <option value="Garlic (लहसुन)">Garlic (लहसुन)</option>
                      <option value="Ginger (अदरक)">Ginger (अदरक)</option>
                      <option value="Chilli (मिर्च)">Chilli (मिर्च)</option>
                      <option value="Turmeric (हल्दी)">Turmeric (हल्दी)</option>
                      <option value="Cumin / Jeera (जीरा)">Cumin / Jeera (जीरा)</option>
                    </optgroup>
                    <optgroup label="Fruits (फल)">
                      <option value="Apple (सेब)">Apple (सेब)</option>
                      <option value="Mango (आम)">Mango (आम)</option>
                      <option value="Banana (केला)">Banana (केला)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Category (श्रेणी) *
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Pest & Disease">Pest & Disease (कीट व रोग)</option>
                    <option value="Organic Farming">Organic Farming (जैविक खेती)</option>
                    <option value="Mandi & Pricing">Mandi & Pricing (मंडी भाव चर्चा)</option>
                    <option value="General">General (सामान्य सलाह)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Detailed Description (समस्या का पूरा विवरण) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the crop age, symptoms, dosage questions, or soil conditions so scientists and farmers can advise accurately... (फसल की उम्र, पत्ती के लक्षण, दवा की मात्रा आदि विस्तार से लिखें ताकि वैज्ञानिक व किसान सटीक सलाह दे सकें...)"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 12,
                    border: 'none',
                    background: '#047857',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: posting ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(4, 120, 87, 0.28)'
                  }}
                >
                  {posting ? 'Publishing... (पोस्ट हो रहा है...)' : 'Publish to Chopal (चौपाल में पोस्ट करें)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
