import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const initialForm = {
  name: '',
  user_id: '',
  email: '',
  password: '',
};

export default function Auth({ portal, apiBase, homePath }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === 'signup' ? 'Create account' : 'Welcome back'), [mode]);

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
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (mode === 'login') {
        storage.setItem(`${portal}_token`, data.token);
        storage.setItem(`${portal}_user`, JSON.stringify(data.user));
      }

      setStatus(mode === 'signup' ? 'Account created. You can log in now.' : 'Signed in successfully.');
      if (mode === 'login') navigate(homePath);
      if (mode === 'signup') setMode('login');
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
        <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
          <button className={mode === 'login' ? 'auth-toggle-active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={mode === 'signup' ? 'auth-toggle-active' : ''} onClick={() => setMode('signup')}>
            Sign up
          </button>
        </div>

        <div className="auth-header">
          <div className="auth-mark">Krishi<span>AI</span></div>
          <h1>{title}</h1>
          <p>{portal === 'farmer' ? 'Farmer Portal' : 'Wholesaler Portal'} access, styled to stay calm and formal.</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label>
                Name
                <input name="name" value={form.name} onChange={onChange} required />
              </label>
              <label>
                Create ID
                <input name="user_id" value={form.user_id} onChange={onChange} required />
              </label>
              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={onChange} required />
              </label>
            </>
          )}

          {mode === 'login' && (
            <label>
              ID
              <input name="user_id" value={form.user_id} onChange={onChange} required />
            </label>
          )}

          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={onChange} required />
          </label>

          {showSessionHint && (
            <label className="auth-keep">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
              />
              <span>Keep me logged in</span>
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Login'}
          </button>

          {status && <p className="auth-status">{status}</p>}
        </form>
      </div>
    </div>
  );
}
