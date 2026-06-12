import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GROQ_CHATBOT_API } from '../config';
import './chat.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Services', to: '/services' },
  { label: 'About us', to: '/about-us' },
  { label: 'Profile', to: '/profile' },
];

const systemPrompt = `
You are KrishiAI, a helpful farming assistant for farmers in India.
Keep answers practical, concise, and friendly.
Focus on crops, soil, irrigation, pest control, weather impact, fertilizer usage, and farm planning.
If the user asks for medical, legal, or emergency advice, recommend a qualified professional.
`;

export default function Chat() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('farmer_user') || sessionStorage.getItem('farmer_user');
  const currentUser = rawUser ? JSON.parse(rawUser) : { name: 'Farmer' };

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${currentUser.name || 'Farmer'}! Ask me anything about crops, soil, pests, or irrigation.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Speech Synthesis States
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

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

  const sendMessage = async (event) => {
    if (event) event.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    if (!GROQ_CHATBOT_API) {
      setError('Missing Groq API key. Set REACT_APP_GROQ_CHATBOT_API in frontend/farmer-portal/.env and restart the app.');
      return;
    }

    const userMessage = { role: 'user', content: question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError('');

    // Stop speaking currently reading text
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_CHATBOT_API}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt.trim() },
            ...nextMessages,
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to get response from Groq');
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        throw new Error('Groq returned an empty response.');
      }

      const assistantMessageIndex = nextMessages.length;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);

      if (autoSpeak) {
        // Delay slightly to ensure UI has rendered and active voice updates
        setTimeout(() => speak(reply, assistantMessageIndex), 100);
      }
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not process that request right now.' }]);
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
                <p>{message.content}</p>
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

          <form className="chat-form" onSubmit={sendMessage}>
            <div className="input-container">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
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

