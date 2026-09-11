import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../config';
import './auth.css';

const initialForm = {
  name: '',
  user_id: '',
  email: '',
  password: '',
};

export default function Auth({ portal: defaultPortal, apiBase: defaultApiBase, homePath: defaultHomePath }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(location.state?.role || defaultPortal || 'farmer');
  const [mode, setMode] = useState('login');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const activePortal = role;
  const activeApiBase = role === 'wholesaler' ? '/api/wholesaler' : '/api/farmer';
  const activeHomePath = role === 'wholesaler' ? '/wholesaler/home' : '/home';

  const title = useMemo(() => (mode === 'signup' ? 'Create Account (खाता बनाएं)' : 'Welcome Back (लॉगिन करें)'), [mode]);

  const storage = keepLoggedIn ? localStorage : sessionStorage;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    const endpoint = mode === 'signup' ? '/signup' : '/login';
    const payload = mode === 'signup'
      ? { name: form.name, user_id: form.user_id, email: form.email, password: form.password }
      : { user_id: form.user_id, password: form.password };

    try {
      const res = await apiFetch(`${activeApiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed (प्रमाणीकरण विफल)');
      }

      if (mode === 'login') {
        storage.setItem(`${activePortal}_token`, data.token);
        storage.setItem(`${activePortal}_user`, JSON.stringify(data.user));
        navigate(activeHomePath, { replace: true });
      } else {
        if (data.token) {
          storage.setItem(`${activePortal}_token`, data.token);
        }
        storage.setItem(`${activePortal}_user`, JSON.stringify({
          ...(data.user || {}),
          name: data.user?.name || form.name,
          user_id: data.user?.user_id || form.user_id,
          email: data.user?.email || form.email,
        }));
        navigate(activeHomePath, { replace: true });
      }

    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showSessionHint = mode === 'login';

  return (
    <div className="auth-shell">
      <div className="auth-backdrop"></div>
      <div className="auth-card">
        {/* Account Role Selector: Farmer vs Wholesaler */}
        <div className="role-selector" role="tablist" aria-label="Select Account Type">
          <button
            type="button"
            className={`role-tab-btn ${role === 'farmer' ? 'active' : ''}`}
            onClick={() => { setRole('farmer'); setStatus(''); }}
          >
            <span>👨‍🌾</span>
            <span>Farmer (किसान)</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'wholesaler' ? 'active' : ''}`}
            onClick={() => { setRole('wholesaler'); setStatus(''); }}
          >
            <span>🏢</span>
            <span>Wholesaler (व्यापारी)</span>
          </button>
        </div>

        <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
          <button type="button" className={mode === 'login' ? 'auth-toggle-active' : ''} onClick={() => setMode('login')}>
            Login (लॉगिन)
          </button>
          <button type="button" className={mode === 'signup' ? 'auth-toggle-active' : ''} onClick={() => setMode('signup')}>
            Sign Up (नया खाता)
          </button>
        </div>

        <div className="auth-header">
          <div className="auth-mark">Krishi<span>AI</span></div>
          <h1>{title}</h1>
          <p>
            {role === 'farmer'
              ? '🌾 Farmer Portal • फसल बिक्री, लाइव भाव व AI सहायता'
              : '🏢 Wholesaler Portal • किसानों से डायरेक्ट थोक ख़रीद व बिडिंग'}
          </p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label>
                Name (नाम)
                <input name="name" value={form.name} onChange={onChange} required />
              </label>
              <label>
                Create ID (यूजर आईडी बनाएं)
                <input name="user_id" value={form.user_id} onChange={onChange} required />
              </label>
              <label>
                Email (ईमेल)
                <input name="email" type="email" value={form.email} onChange={onChange} required />
              </label>
            </>
          )}

          {mode === 'login' && (
            <label>
              User ID / Mobile (यूजर आईडी / मोबाइल)
              <input name="user_id" value={form.user_id} onChange={onChange} required />
            </label>
          )}

          <label>
            Password (पासवर्ड)
            <input name="password" type="password" value={form.password} onChange={onChange} required />
          </label>

          {showSessionHint && (
            <label className="auth-keep">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
              />
              <span>Keep me logged in (लॉग इन रखें)</span>
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait... (कृपया प्रतीक्षा करें...)' : mode === 'signup' ? 'Create Account (खाता बनाएं)' : 'Login (लॉगिन करें)'}
          </button>

          {status && <p className="auth-status">{status}</p>}
        </form>
      </div>
    </div>
  );
}
