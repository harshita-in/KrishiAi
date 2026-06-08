import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landingpage';
import Auth from './pages/auth';
import Home from './pages/home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth portal="farmer" apiBase="http://localhost:5000/api/farmer" homePath="/home" />} />
      <Route path="/home" element={<Home portalLabel="Farmer" storageKeyPrefix="farmer" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
