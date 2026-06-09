import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth portal="farmer" apiBase="http://localhost:5000/api/farmer" homePath="/home" />} />
      <Route path="/home" element={<Home portalLabel="Farmer" storageKeyPrefix="farmer" />} />
      <Route path="/services" element={<Services />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/recommendation" element={<Recommendation />} />
      <Route path="/detection" element={<Detection />} />
      <Route path="/portal" element={<Portal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
