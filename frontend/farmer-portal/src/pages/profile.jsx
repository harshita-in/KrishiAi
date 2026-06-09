import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './home.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Services', to: '/services' },
  { label: 'About us', to: '/about-us' },
  { label: 'Profile', to: '/profile' },
];

export default function Profile() {
  const navigate = useNavigate();
  const rawToken = localStorage.getItem('farmer_token') || sessionStorage.getItem('farmer_token');
  const storage = useMemo(() => (localStorage.getItem('farmer_token') ? localStorage : sessionStorage), []);

  const [currentUser, setCurrentUser] = useState({ name: '', user_id: '', email: '' });
  const [form, setForm] = useState({ name: '', user_id: '', email: '' });
  const [status, setStatus] = useState('Loading profile...');
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const readResponseBody = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return { error: text || `Request failed with status ${response.status}` };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!rawToken) {
        setStatus('No active farmer session found.');
        return;
      }

      try {
        const response = await apiFetch('/api/farmer/profile', {
          headers: {
            Authorization: `Bearer ${rawToken}`,
          },
        });

        const data = await readResponseBody(response);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load profile');
        }

        const nextUser = {
          name: data.user?.name || '',
          user_id: data.user?.user_id || '',
          email: data.user?.email || '',
        };

        setCurrentUser(nextUser);
        setForm(nextUser);
        storage.setItem('farmer_user', JSON.stringify(nextUser));
        setStatus('');
      } catch (error) {
        setStatus(error.message);
      } finally {
        setHydrated(true);
      }
    };

    fetchProfile();
  }, [rawToken, storage]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const logout = () => {
    localStorage.removeItem('farmer_token');
    localStorage.removeItem('farmer_user');
    sessionStorage.removeItem('farmer_token');
    sessionStorage.removeItem('farmer_user');
    navigate('/');
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('');
    setLoading(true);

      try {
      const response = await apiFetch('/api/farmer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${rawToken}`,
        },
        body: JSON.stringify({
          name: form.name,
          user_id: form.user_id,
          email: form.email,
        }),
      });

      const data = await readResponseBody(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      const updatedUser = {
        name: data.user?.name || form.name,
        user_id: data.user?.user_id || form.user_id,
        email: data.user?.email || form.email,
      };

      setCurrentUser(updatedUser);
      setForm(updatedUser);
      storage.setItem('farmer_user', JSON.stringify(updatedUser));
      setStatus('Profile updated successfully.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farmer-shell">
      <div className="farmer-aurora farmer-aurora-one" />
      <div className="farmer-aurora farmer-aurora-two" />

      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI</span>
          <span className="brand-title">Farmer Portal</span>
        </div>

        <nav className="nav-links" aria-label="Farmer navigation">
          {navItems.map((item) => (
            <button
              key={item.to}
              type="button"
              className={item.to === '/profile' ? 'nav-pill nav-pill-active' : 'nav-pill'}
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

      <main className="farmer-main">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="hero-badge">Profile settings</span>
            <h1>Edit your farmer account details.</h1>
            <p>
              Your saved name, user ID, and email are loaded from MongoDB. You can replace any of
              them here if needed. Password changes are intentionally not available from this screen.
            </p>
            {status && <div className="status-chip">{status}</div>}
          </div>

          <div className="hero-stat-card">
            <span className="stat-label">Current login</span>
            <strong>{currentUser.user_id || 'No ID found'}</strong>
            <p>{currentUser.email || 'No email saved yet'}</p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="profile-form-card">
            <form className="profile-form" onSubmit={submit}>
              <label>
                Name
                <input name="name" value={form.name} onChange={onChange} required disabled={!hydrated || loading} />
              </label>

              <label>
                User ID
                <input name="user_id" value={form.user_id} onChange={onChange} required disabled={!hydrated || loading} />
              </label>

              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={onChange} required disabled={!hydrated || loading} />
              </label>

              <button type="submit" className="profile-save" disabled={loading || !hydrated}>
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
