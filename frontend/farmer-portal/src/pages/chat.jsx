import React, { useMemo, useState } from 'react';
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

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const logout = () => {
    localStorage.removeItem('farmer_token');
    localStorage.removeItem('farmer_user');
    sessionStorage.removeItem('farmer_token');
    sessionStorage.removeItem('farmer_user');
    navigate('/');
  };

  const sendMessage = async (event) => {
    event.preventDefault();

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

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
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
            <span className="hero-badge">AI chatbot</span>
            <h1>Ask farming questions and get practical guidance.</h1>
            <p>
              The assistant can help with crop choices, soil health, irrigation, pests, fertilizer planning, and more.
            </p>
            {error && <div className="status-chip status-chip-error">{error}</div>}
          </div>

          <div className="chat-window" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-bubble chat-${message.role}`}>
                <span className="chat-role">{message.role === 'user' ? 'You' : 'KrishiAI'}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-assistant">
                <span className="chat-role">KrishiAI</span>
                <p>Thinking...</p>
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={sendMessage}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your crop, soil, disease symptoms, or farm planning..."
              rows={3}
            />
            <button type="submit" className="chat-send" disabled={!canSend}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
