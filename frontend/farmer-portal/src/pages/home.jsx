import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home({ portalLabel, storageKeyPrefix }) {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem(`${storageKeyPrefix}_user`) || sessionStorage.getItem(`${storageKeyPrefix}_user`);
  const user = rawUser ? JSON.parse(rawUser) : null;
  const [locationStatus, setLocationStatus] = useState('');
  const apiBase = `http://localhost:5000/api/${storageKeyPrefix}`;

  useEffect(() => {
    if (storageKeyPrefix !== 'farmer') return;

    const token =
      localStorage.getItem(`${storageKeyPrefix}_token`) ||
      sessionStorage.getItem(`${storageKeyPrefix}_token`);

    if (!token) {
      setLocationStatus('Signed in, but location upload is unavailable without a token.');
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by this browser.');
      return;
    }

    let cancelled = false;
    setLocationStatus('Requesting your location permission...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          if (cancelled) return;
          setLocationStatus('Saving your location...');

          const response = await fetch(`${apiBase}/location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to save location');
          }

          if (!cancelled) {
            setLocationStatus('Location saved successfully.');
          }
        } catch (error) {
          if (!cancelled) {
            setLocationStatus(error.message);
          }
        }
      },
      (error) => {
        if (!cancelled) {
          setLocationStatus(error.message || 'Location permission was denied.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      cancelled = true;
    };
  }, [apiBase, storageKeyPrefix]);

  const logout = () => {
    localStorage.removeItem(`${storageKeyPrefix}_token`);
    localStorage.removeItem(`${storageKeyPrefix}_user`);
    sessionStorage.removeItem(`${storageKeyPrefix}_token`);
    sessionStorage.removeItem(`${storageKeyPrefix}_user`);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#0f172a' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>Welcome {user?.name || 'User'}</h1>
        <p style={{ marginBottom: 24 }}>{portalLabel} Portal Home</p>
        {locationStatus && storageKeyPrefix === 'farmer' && (
          <p style={{ marginBottom: 24, color: '#0f766e' }}>{locationStatus}</p>
        )}
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
