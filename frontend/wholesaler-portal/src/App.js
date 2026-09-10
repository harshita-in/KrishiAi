import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/landingpage';
import Auth from './pages/auth';
import Home from './pages/home';

function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('wholesaler_token') || sessionStorage.getItem('wholesaler_token');

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth portal="wholesaler" apiBase="/api/wholesaler" homePath="/home" />} />
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Home portalLabel="Wholesaler" storageKeyPrefix="wholesaler" />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
