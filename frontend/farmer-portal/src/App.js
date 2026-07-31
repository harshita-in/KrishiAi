import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { apiFetch } from './config';
import LandingPage from './pages/landingpage';
import Auth from './pages/auth';
import Home from './pages/home';
import Services from './pages/services';
import AboutUs from './pages/aboutus';
import Profile from './pages/profile';
import Chat from './pages/chat';
import Recommendation from './pages/recommendation';
import Detection from './pages/detection';
import Portal from './pages/portal';

function clearFarmerSession() {
  localStorage.removeItem('farmer_token');
  localStorage.removeItem('farmer_user');
  sessionStorage.removeItem('farmer_token');
  sessionStorage.removeItem('farmer_user');
}

function RequireAuth({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('farmer_token') || sessionStorage.getItem('farmer_token');

    if (!token) {
      setStatus('unauthenticated');
      return () => { cancelled = true; };
    }

    apiFetch('/api/farmer/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Invalid session');
        if (!cancelled) setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        clearFarmerSession();
        setStatus('unauthenticated');
      });

    return () => { cancelled = true; };
  }, [location.pathname]);

  if (status === 'unauthenticated') {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (status !== 'authenticated') {
    return (
      <main aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        Checking your session...
      </main>
    );
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth portal="farmer" apiBase="/api/farmer" homePath="/home" />} />
      <Route path="/home" element={<RequireAuth><Home portalLabel="Farmer" storageKeyPrefix="farmer" /></RequireAuth>} />
      <Route path="/services" element={<RequireAuth><Services /></RequireAuth>} />
      <Route path="/about-us" element={<RequireAuth><AboutUs /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
      <Route path="/recommendation" element={<RequireAuth><Recommendation /></RequireAuth>} />
      <Route path="/detection" element={<RequireAuth><Detection /></RequireAuth>} />
      <Route path="/portal" element={<RequireAuth><Portal /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
