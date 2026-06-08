import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingpage';

// Placeholder Auth Component (We will build the complete file next!)
const AuthPlaceholder = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <h2 className="text-xl font-medium text-slate-700">Authentication Portal Coming Soon...</h2>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Landing Page layout */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Authentication Router Gateway */}
      <Route path="/auth" element={<AuthPlaceholder />} />
    </Routes>
  );
}

export default App;