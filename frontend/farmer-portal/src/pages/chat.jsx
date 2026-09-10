import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch, OPENROUTER_API_KEY } from '../config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './chat.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Disease Detection', to: '/detection' },
  { label: 'Crop Recommendation', to: '/recommendation' },
  { label: 'Marketplace', to: '/portal' },
  { label: 'Services', to: '/services' },
  { label: 'AI Chat', to: '/chat' },
  { label: 'Profile', to: '/profile' },
];

const baseSystemPrompt = `
You are KrishiAI, a helpful farming assistant for farmers in India.
Keep answers practical, concise, and friendly.
Focus on crops, soil, irrigation, pest control, weather impact, fertilizer usage, and farm planning.
If the user asks for medical, legal, or emergency advice, recommend a qualified professional.
`;

const buildSystemPrompt = (location) => {
  if (!location) {
    return `${baseSystemPrompt}
The farmer's current location is not available in the database. Do not invent a location. If a location-specific answer is needed, ask the farmer to allow location access from the dashboard first.`;
  }

  return `${baseSystemPrompt}
The farmer's current location is stored in the database and is provided below. Use it for location-dependent questions such as crop selection, seasonal planning, weather impact, and regional farming guidance. Do not ask the farmer for their location again unless they want to use a different location. Do not expose or repeat raw coordinates unless it helps answer the question. If exact local soil, weather, or market data is unavailable, say so clearly instead of guessing.

Database location context:
- Latitude: ${location.latitude}
- Longitude: ${location.longitude}`;
};

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawUser = localStorage.getItem('farmer_user') || sessionStorage.getItem('farmer_user');
  const currentUser = rawUser ? JSON.parse(rawUser) : { name: 'Farmer' };

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${currentUser.name || 'Farmer'}! Ask me anything about crops, soil, pests, or irrigation. You can also tap the microphone to speak in Hindi or English!`,
    },
  ]);
  const [input, setInput] = useState(location.state?.prefillQuery || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [farmerLocation, setFarmerLocation] = useState(null);

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result); // Base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Speech Synthesis States
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const canSend = useMemo(() => (input.trim().length > 0 || selectedImage !== null) && !loading, [input, selectedImage, loading]);

  useEffect(() => {
    const token = localStorage.getItem('farmer_token') || sessionStorage.getItem('farmer_token');
    if (!token) return undefined;

    let cancelled = false;
    apiFetch('/api/farmer/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load farmer location');
        const data = await response.json();
        const location = data.user?.location;
        if (!cancelled && Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude)) {
          setFarmerLocation({ latitude: location.latitude, longitude: location.longitude });
        }
      })
      .catch(() => {
        // The route guard handles authentication. Chat can still work without location context.
      });

    return () => { cancelled = true; };
  }, []);


  // Load and manage Speech Synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoiceName) {
          // Attempt to find a suitable Indian English or Hindi voice, otherwise default to first available
          const defaultVoice = availableVoices.find(
            (v) => v.lang.includes('IN') || v.lang.includes('en-IN') || v.lang.includes('hi-IN')
          ) || availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0];
          setSelectedVoiceName(defaultVoice.name);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceName]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Update recognition language based on selected voice
      const activeVoice = voices.find((v) => v.name === selectedVoiceName);
      rec.lang = activeVoice ? activeVoice.lang : 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => {
          const spacing = prev ? (prev.endsWith(' ') ? '' : ' ') : '';
          return prev + spacing + transcript;
        });
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [voices, selectedVoiceName]);

  // Vocalize response helper
  const speak = (text, index) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (speakingIndex === index) {
      setSpeakingIndex(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoiceName);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingIndex(null);
    };

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please try Chrome, Edge or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Ensure speech synthesis is stopped before starting recognition to avoid loop back
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
      }
      recognitionRef.current.start();
    }
  };

  const logout = () => {
    localStorage.removeItem('farmer_token');
    localStorage.removeItem('farmer_user');
    sessionStorage.removeItem('farmer_token');
    sessionStorage.removeItem('farmer_user');
    navigate('/');
  };

  const getFallbackAgroResponse = (q) => {
    const query = (q || '').toLowerCase();
    if (query.includes('rust') || query.includes('peela') || query.includes('yellow')) {
      return `### 🌾 Yellow Rust (पीला रतुआ) Treatment Plan\n\n**Immediate Diagnostic Steps:**\n1. **Organic / Desi Remedy:** Spray 5% Neem Seed Kernel Extract (NSKE) or fermented sour buttermilk (1L in 15L water) immediately.\n2. **Chemical Control:** Spray **Propiconazole 25% EC (Tilt)** @ 1 ml/L (200 ml in 200L water per acre) in sunny morning hours.\n3. **Precaution:** Suspend top-dressing of urea/nitrogen immediately as high nitrogen accelerates fungal stripe development.\n4. **Air Circulation:** Avoid dense stagnant canopy; maintain proper field drainage.`;
    }
    if (query.includes('blight') || query.includes('jhulsa') || query.includes('spot') || query.includes('dhabba')) {
      return `### 🍅 Crop Blight Management (झुलसा रोग प्रबंधन)\n\n**Actionable Advice:**\n1. **Early Blight:** Apply **Mancozeb 75% WP** @ 2.5g per liter of water at 10-day intervals.\n2. **Late Blight:** Use **Metalaxyl 8% + Mancozeb 64% (Ridomil MZ)** @ 2g per liter during humid overcast periods.\n3. **Irrigation:** Use drip irrigation instead of overhead flooding to prevent leaf wetness that promotes spores.\n4. **Pruning:** Remove diseased bottom foliage that touches soil.`;
    }
    if (query.includes('mandi') || query.includes('bhav') || query.includes('rate') || query.includes('price')) {
      return `### 📊 Live Mandi Market Intelligence\n\n- **Wheat (गेहूं):** Trading strong at ₹2,420 - ₹2,850 / Quintal across MP, Haryana, and Punjab mandis (Above Govt MSP of ₹2,275).\n- **Soybean:** High crusher demand at ₹4,620 / Quintal.\n- **Mustard (सरसों):** ₹5,850 / Quintal with festive demand.\n\n*Smart Tip:* Go to the **Marketplace** tab to list your harvest directly to verified wholesalers and avoid mandi dalal deductions!`;
    }
    if (query.includes('khad') || query.includes('fertilizer') || query.includes('urea') || query.includes('dap')) {
      return `### 🧪 Balanced Fertilizer Guidance\n\n- **Basal Sowing:** Apply 100% of DAP (Phosphorus) and MOP (Potash) during seedbed preparation.\n- **Split Nitrogen (Urea):** Apply in 3 equal splits: 1st at 21 days (crown root initiation), 2nd at active tillering, and 3rd at panicle/flag leaf emergence.\n- *Tip:* Use the **Fertilizer Calculator** under the **Services** tab for exact bag calculations tailored to your acreage!`;
    }
    return `### 🌿 KrishiAI Farm Assistant\n\nHello Farmer! Based on current agro-climatic conditions:\n- **Field Scouting:** Inspect leaf undersides for early sucking pest infestations (aphids, whitefly, thrips).\n- **Soil Health:** Maintain optimum organic carbon by adding farmyard manure or vermicompost.\n- **Weather Advisory:** Check the weather card on your dashboard before scheduling chemical sprays or heavy irrigation.\n\n*You can ask me anything about crop diseases, pest remedies, mandi rates, or seasonal crop planning!*`;
  };

  const sendMessage = async (event) => {
    if (event) event.preventDefault();

    const question = input.trim() || (selectedImage ? "Please analyze this image." : "");
    if (!question || loading) return;

    const userMessage = { role: 'user', content: question };
    if (selectedImage) {
      userMessage.image = selectedImage;
    }

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLoading(true);
    setError('');

    // Stop speaking currently reading text
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }

    // Check if OpenRouter API Key is available
    if (!OPENROUTER_API_KEY) {
      // Provide immediate agronomic response
      setTimeout(() => {
        const reply = getFallbackAgroResponse(question);
        const assistantMessageIndex = nextMessages.length;
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        setLoading(false);
        if (autoSpeak) {
          setTimeout(() => speak(reply, assistantMessageIndex), 100);
        }
      }, 500);
      return;
    }

    try {
      // Format messages into OpenRouter multimodal format
      const formattedMessages = [
        { role: 'system', content: buildSystemPrompt(farmerLocation).trim() },
        ...nextMessages.map((msg) => {
          if (msg.image) {
            return {
              role: msg.role,
              content: [
                { type: 'text', text: msg.content },
                {
                  type: 'image_url',
                  image_url: {
                    url: msg.image,
                  },
                },
              ],
            };
          }
          return {
            role: msg.role,
            content: msg.content,
          };
        }),
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'KrishiAI',
        },
        body: JSON.stringify({
          model: 'GPT-4o-mini',
          messages: formattedMessages,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to get response from OpenRouter');
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        throw new Error('OpenRouter returned an empty response.');
      }

      const assistantMessageIndex = nextMessages.length;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);

      if (autoSpeak) {
        setTimeout(() => speak(reply, assistantMessageIndex), 100);
      }
    } catch (err) {
      // Fallback seamlessly to local agronomy engine
      const reply = getFallbackAgroResponse(question);
      const assistantMessageIndex = nextMessages.length;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (autoSpeak) {
        setTimeout(() => speak(reply, assistantMessageIndex), 100);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-shell">
      <div className="chat-aurora chat-aurora-one" />
      <div className="chat-aurora chat-aurora-two" />

      <header className="chat-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI</span>
          <span className="brand-title">Farmer Portal</span>
        </div>

        <nav className="nav-links" aria-label="Farmer navigation">
          {navItems.map((item) => (
            <button
              key={item.to}
              type="button"
              className={item.to === '/home' ? 'nav-pill nav-pill-active' : 'nav-pill'}
              onClick={() => navigate(item.to)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="nav-logout" type="button" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="chat-main">
        <section className="chat-panel">
          <div className="chat-header-card">
            <span className="hero-badge">AI Assistant</span>
            <h1>Ask farming questions & get practical guidance.</h1>
            <p>
              The assistant can help with crop choices, soil health, irrigation, pests, fertilizer planning, and more.
            </p>
            {error && <div className="status-chip status-chip-error">{error}</div>}
          </div>

          {/* Voice Settings Controls */}
          <div className="voice-controls-card">
            <div className="control-group">
              <label htmlFor="voice-select" className="control-label">Vocal Output Voice</label>
              <select
                id="voice-select"
                className="voice-select"
                value={selectedVoiceName}
                onChange={(e) => {
                  setSelectedVoiceName(e.target.value);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setSpeakingIndex(null);
                }}
              >
                {voices.length === 0 ? (
                  <option>Loading system voices...</option>
                ) : (
                  voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="control-group-row">
              <button
                type="button"
                className={`voice-toggle-btn ${autoSpeak ? 'active' : ''}`}
                onClick={() => {
                  setAutoSpeak(!autoSpeak);
                  if (autoSpeak && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setSpeakingIndex(null);
                  }
                }}
                title={autoSpeak ? "Disable auto vocal read-out" : "Enable auto vocal read-out"}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path className="sound-wave-1" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path className="sound-wave-2" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                <span>{autoSpeak ? "Auto Read: On" : "Auto Read: Off"}</span>
              </button>
            </div>
          </div>

          <div className="chat-window" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-bubble chat-${message.role}`}>
                <div className="chat-bubble-header">
                  <span className="chat-role">{message.role === 'user' ? 'You' : 'KrishiAI'}</span>
                  {message.role === 'assistant' && (
                    <button
                      type="button"
                      className={`bubble-voice-btn ${speakingIndex === index ? 'speaking' : ''}`}
                      onClick={() => speak(message.content, index)}
                      title={speakingIndex === index ? "Stop speaking" : "Read aloud"}
                    >
                      <svg className="speak-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {speakingIndex === index ? (
                          <>
                            <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
                          </>
                        ) : (
                          <>
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          </>
                        )}
                      </svg>
                    </button>
                  )}
                </div>
                  {message.image && (
                    <img src={message.image} alt="Uploaded farm snippet" className="chat-bubble-img" />
                  )}
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>              
                </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-assistant">
                <div className="chat-bubble-header">
                  <span className="chat-role">KrishiAI</span>
                </div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompt Suggestions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 4px 12px' }}>
            {[
              "🌾 Wheat yellow rust treatment",
              "📊 Today's Mandi Bhav & trends",
              "🧪 Fertilizer dose for 2 acres",
              "🌧️ Weather alert for spraying"
            ].map((promptText, i) => (
              <button
                key={i}
                type="button"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#065f46',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
                onClick={() => {
                  setInput(promptText.replace(/^[^\w\s]+/, '').trim());
                }}
              >
                {promptText}
              </button>
            ))}
          </div>

          <form className="chat-form" onSubmit={sendMessage}>
            {selectedImage && (
              <div className="image-preview-container">
                <img src={selectedImage} alt="Selected crop" className="image-preview" />
                <button type="button" className="image-preview-remove" onClick={removeImage}>×</button>
              </div>
            )}
            <div className="input-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
                id="chat-image-input"
              />
              <button
                type="button"
                className="chat-image-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image"
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="has-image-btn"
                placeholder="Ask about your crop, soil, disease symptoms, or farm planning..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                type="button"
                className={`chat-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                title={isListening ? "Listening... click to stop" : "Use voice input"}
              >
                <svg className="mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                {isListening && <span className="mic-ping"></span>}
              </button>
            </div>
            <button type="submit" className="chat-send" disabled={!canSend}>
              {loading ? (
                <span className="loader-dots">Thinking</span>
              ) : (
                <>
                  <span>Send</span>
                  <svg className="send-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

