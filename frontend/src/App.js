import React, { useState, useEffect, useCallback, useRef } from 'react';

const getApiBase = () => {
  const envBase = process.env.REACT_APP_API_BASE;
  if (!envBase) return 'http://10.156.157.191:5000/api';
  
  let base = envBase.trim();
  if (!base.startsWith('http')) {
    base = `https://${base}`;
  }
  // Remove trailing slash if present
  base = base.replace(/\/$/, "");
  // Ensure it ends with /api
  return base.endsWith('/api') ? base : `${base}/api`;
};

const API_BASE = getApiBase();
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const BusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);
const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </svg>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);
const NavBusLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
  </svg>
);
const SwapIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" />
  </svg>
);

// ─── GOOGLE MAPS LOADER ───────────────────────────────────────────────────────
function useGoogleMaps() {
  const [loaded, setLoaded] = useState(!!window.google?.maps);
  useEffect(() => {
    if (window.google?.maps) { setLoaded(true); return; }
    const existing = document.querySelector('script[data-gmaps]');
    if (existing) {
      existing.addEventListener('load', () => setLoaded(true));
      return;
    }
    const script = document.createElement('script');
    script.setAttribute('data-gmaps', 'true');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);
  return loaded;
}

// ─── SPLASH ──────────────────────────────────────────────────────────────────
function SplashScreen({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2500);
    return () => clearTimeout(t);
  }, [onComplete]);
  return (
    <div className="splash-screen">
      <div className="splash-logo"><NavBusLogo /></div>
      <h1 className="splash-title">NavBus</h1>
      <p className="splash-subtitle">Track Your Bus</p>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onRegisterClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter username and password'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) onLogin(data);
      else setError(data.error || 'Login failed');
    } catch { setError('Cannot connect to server'); }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-logo"><NavBusLogo /></div>
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue to NavBus</p>
        <form onSubmit={handleLogin}>
          {error && <div className="login-error">⚠️ {error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input
              type="text" value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? <span className="login-loading">⏳ Signing in…</span> : '→  Sign In'}
          </button>
          <div className="login-divider"><span>or</span></div>
          <div className="login-footer">
            New to NavBus?{' '}
            <button type="button" onClick={onRegisterClick}>Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
function RegisterScreen({ onLoginClick, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('passenger');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please fill all fields'); return; }
    if (password.length < 4) { setError('Password must be at least 4 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();
      if (res.ok) onRegister({ username, role });
      else setError(data.error || 'Registration failed');
    } catch { setError('Cannot connect to server'); }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-logo"><NavBusLogo /></div>
        <h1>Create Account</h1>
        <p className="login-subtitle">Join NavBus — Vellore's bus tracker</p>
        <form onSubmit={handleRegister}>
          {error && <div className="login-error">⚠️ {error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" autoComplete="username" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 4 characters" autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label>I am a</label>
            <div className="role-toggle">
              <button type="button" className={`role-btn ${role === 'passenger' ? 'active' : ''}`} onClick={() => setRole('passenger')}>🧍 Passenger</button>
              <button type="button" className={`role-btn ${role === 'driver' ? 'active' : ''}`} onClick={() => setRole('driver')}>🚌 Driver</button>
            </div>
          </div>
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? '⏳ Creating account…' : '→  Create Account'}
          </button>
          <div className="login-divider"><span>or</span></div>
          <div className="login-footer">
            Already have an account?{' '}
            <button type="button" onClick={onLoginClick}>Sign In</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── LOCATION PERMISSION ─────────────────────────────────────────────────────
function LocationPermissionScreen({ onGranted, onDenied }) {
  const [status, setStatus] = useState('pending');

  const requestLocation = () => {
    if (!navigator.geolocation) { setStatus('denied'); return; }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setStatus('granted');
        setTimeout(() => onGranted({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }), 800);
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="location-screen">
      <div className="location-container">
        <div className="location-icon"><LocationIcon /></div>
        <h1 className="location-title">Enable Location</h1>
        <p className="location-text">NavBus needs your location to find nearby buses and show accurate ETAs.</p>
        {status === 'denied' && <p className="location-error">Location denied. Please enable it in device settings.</p>}
        <button className="location-btn" onClick={requestLocation} disabled={status === 'requesting' || status === 'granted'}>
          {status === 'requesting' ? 'Requesting…' : status === 'granted' ? '✓ Granted' : 'Allow Location Access'}
        </button>
        {status !== 'pending' && <button className="skip-btn" onClick={onDenied}>Skip for now</button>}
      </div>
    </div>
  );
}

// ─── PROFILE DRAWER ───────────────────────────────────────────────────────────
function ProfileDrawer({ user, recentSearches, theme, onToggleTheme, onLogout, onClose }) {
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className={`profile-drawer ${theme === 'dark' ? 'dark' : ''}`}>
        <button className="drawer-close" onClick={onClose}>✕</button>
        <div className="drawer-user-section">
          <div className="drawer-avatar"><ProfileIcon /></div>
          <div className="drawer-user-info">
            <p className="drawer-username">{user?.username || 'Guest'}</p>
            <span className={`drawer-role-badge ${user?.role}`}>
              {user?.role === 'driver' ? '🚌 Driver' : '🧍 Passenger'}
            </span>
          </div>
        </div>
        <div className="drawer-divider" />
        <div className="drawer-section">
          <p className="drawer-section-title">🔍 Recent Searches</p>
          {recentSearches.length > 0 ? recentSearches.slice(0, 5).map((s, i) => (
            <div key={i} className="drawer-recent-item">
              <span className="drawer-recent-icon">🕐</span>
              <span className="drawer-recent-text">{s}</span>
            </div>
          )) : <p className="drawer-empty-text">No recent searches</p>}
        </div>
        <div className="drawer-divider" />
        <div className="drawer-section">
          <p className="drawer-section-title">🎨 Theme</p>
          <div className="drawer-theme-row">
            <span className="drawer-theme-label">{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
            <div className={`theme-toggle ${theme === 'dark' ? 'on' : ''}`} onClick={onToggleTheme}>
              <div className="theme-toggle-knob" />
            </div>
          </div>
        </div>
        <div className="drawer-divider" />
        <div className="drawer-section">
          <button className="drawer-logout-btn" onClick={onLogout}>🚪 Log Out</button>
        </div>
      </div>
    </>
  );
}

// ─── TRIP SEARCH ──────────────────────────────────────────────────────────────
function TripSearchBar({ onTripResult, onSaveSearch }) {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggests, setFromSuggests] = useState([]);
  const [toSuggests, setToSuggests] = useState([]);
  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);
  const [searching, setSearching] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const fetchSuggests = async (q, setter) => {
    if (q.length < 2) { setter([]); return; }
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const seen = new Set();
      const unique = (data.stops || []).filter(s => {
        if (seen.has(s.name)) return false;
        seen.add(s.name); return true;
      });
      setter(unique.slice(0, 6));
    } catch { setter([]); }
  };

  const handleFromChange = (v) => { setFromQuery(v); setFromStop(null); setActiveField('from'); fetchSuggests(v, setFromSuggests); };
  const handleToChange = (v) => { setToQuery(v); setToStop(null); setActiveField('to'); fetchSuggests(v, setToSuggests); };
  const selectFrom = (stop) => { setFromStop(stop); setFromQuery(stop.name); setFromSuggests([]); setActiveField(null); };
  const selectTo = (stop) => { setToStop(stop); setToQuery(stop.name); setToSuggests([]); setActiveField(null); };

  const swapStops = () => {
    setFromStop(toStop); setFromQuery(toQuery);
    setToStop(fromStop); setToQuery(fromQuery);
    setFromSuggests([]); setToSuggests([]);
  };

  const handleSearch = async () => {
    if (!fromStop || !toStop) return;
    setSearching(true);
    try {
      const routesRes = await fetch(`${API_BASE}/routes`);
      const allRoutes = await routesRes.json();
      const matchingBuses = [];
      for (const route of allRoutes) {
        const stopsRes = await fetch(`${API_BASE}/routes/${route.id}/stops`);
        const stops = await stopsRes.json();
        const stopNames = stops.map(s => s.name.toLowerCase());
        const hasFrom = stopNames.includes(fromStop.name.toLowerCase());
        const hasTo = stopNames.includes(toStop.name.toLowerCase());
        if (hasFrom && hasTo) {
          const fromOrder = stops.find(s => s.name.toLowerCase() === fromStop.name.toLowerCase())?.stop_order;
          const toOrder = stops.find(s => s.name.toLowerCase() === toStop.name.toLowerCase())?.stop_order;
          if (fromOrder < toOrder) {
            const busRes = await fetch(`${API_BASE}/buses/route/${route.id}`);
            const buses = await busRes.json();
            buses.forEach(b => matchingBuses.push({ ...b, fromStop, toStop, route }));
          }
        }
      }
      if (onSaveSearch) onSaveSearch(`${fromStop.name} → ${toStop.name}`);
      onTripResult(matchingBuses, fromStop, toStop);
    } catch { }
    setSearching(false);
  };

  return (
    <div className="trip-search-container">
      <div className="trip-field-row">
        <div className="trip-field-icon from"><LocationIcon /></div>
        <div className="trip-field-wrap">
          <input className="trip-input" placeholder="From stop…" value={fromQuery} onChange={e => handleFromChange(e.target.value)} onFocus={() => setActiveField('from')} />
          {activeField === 'from' && fromSuggests.length > 0 && (
            <div className="trip-suggestions">
              {fromSuggests.map((s, i) => (
                <div key={i} className="trip-suggest-item" onClick={() => selectFrom(s)}><LocationIcon /><span>{s.name}</span></div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="trip-swap-row">
        <div className="trip-connector-line" />
        <button className="trip-swap-btn" onClick={swapStops}><SwapIcon /></button>
        <div className="trip-connector-line" />
      </div>
      <div className="trip-field-row">
        <div className="trip-field-icon to"><LocationIcon /></div>
        <div className="trip-field-wrap">
          <input className="trip-input" placeholder="To stop…" value={toQuery} onChange={e => handleToChange(e.target.value)} onFocus={() => setActiveField('to')} />
          {activeField === 'to' && toSuggests.length > 0 && (
            <div className="trip-suggestions">
              {toSuggests.map((s, i) => (
                <div key={i} className="trip-suggest-item" onClick={() => selectTo(s)}><LocationIcon /><span>{s.name}</span></div>
              ))}
            </div>
          )}
        </div>
      </div>
      <button className="trip-search-btn" onClick={handleSearch} disabled={!fromStop || !toStop || searching}>
        {searching ? 'Searching…' : <><SearchIcon /> Find Buses</>}
      </button>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({ routes, buses, user, cityName, onRouteSelect, onBusSelect, onNearMe, onProfileClick, onSaveSearch, userLocation }) {
  const [tripResults, setTripResults] = useState(null);
  const [tripFrom, setTripFrom] = useState(null);
  const [tripTo, setTripTo] = useState(null);
  const [activeBuses, setActiveBuses] = useState([]);
  const mapsLoaded = useGoogleMaps();
  const homeMapRef = useRef(null);
  const homeMapInst = useRef(null);
  const homeMarkers = useRef([]);
  const handleTripResult = (results, from, to) => { setTripResults(results); setTripFrom(from); setTripTo(to); };

  // Fetch active buses every 15 seconds
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/active_buses`);
        setActiveBuses(await res.json());
      } catch { }
    };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  // Draw active buses on home map
  useEffect(() => {
    if (!mapsLoaded || !homeMapRef.current) return;
    if (!homeMapInst.current) {
      homeMapInst.current = new window.google.maps.Map(homeMapRef.current, {
        center: { lat: 12.93, lng: 79.13 }, zoom: 12,
        disableDefaultUI: true, zoomControl: true,
      });
    }
    const map = homeMapInst.current;
    homeMarkers.current.forEach(m => m.setMap(null));
    homeMarkers.current = [];

    activeBuses.forEach(ab => {
      if (!ab.latitude || !ab.longitude) return;
      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="17" fill="#036ea7" stroke="white" stroke-width="2"/>
            <text x="18" y="24" font-size="18" text-anchor="middle">🚌</text>
          </svg>`
        )}`,
        scaledSize: new window.google.maps.Size(36, 36),
        anchor: new window.google.maps.Point(18, 18),
      };
      const marker = new window.google.maps.Marker({
        position: { lat: ab.latitude, lng: ab.longitude },
        map, icon, title: ab.bus_name,
      });
      homeMarkers.current.push(marker);
    });

    if (userLocation) {
      new window.google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" fill="#22c55e" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>`
          )}`,
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12),
        },
        title: 'You',
      });
    }
  }, [mapsLoaded, activeBuses, userLocation]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="header-logo"><NavBusLogo /></div>
          <div className="header-title-group">
            <h1 className="header-title">NavBus</h1>
            {cityName && (
              <div className="header-location"><LocationIcon /><span>{cityName}</span></div>
            )}
          </div>
        </div>
        <div className="header-right">
          <div className="profile-icon" onClick={onProfileClick}><ProfileIcon /></div>
        </div>
      </header>

      <TripSearchBar onTripResult={handleTripResult} onSaveSearch={onSaveSearch} />

      {tripResults !== null ? (
        <div className="content-section">
          <div className="trip-result-header">
            <span className="trip-result-label">{tripFrom?.name} → {tripTo?.name}</span>
            <button className="trip-clear-btn" onClick={() => { setTripResults(null); setTripFrom(null); setTripTo(null); }}>✕ Clear</button>
          </div>
          {tripResults.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><BusIcon /></div>
              <p className="empty-state-text">No direct buses found for this route</p>
            </div>
          ) : (
            <>
              <p className="trip-result-count">{tripResults.length} bus(es) found</p>
              {tripResults.map((bus, i) => (
                <div key={i} className="bus-card" onClick={() => onBusSelect(bus.bus_id, bus.route_id)}>
                  <div className="bus-header">
                    <span className="bus-name">{bus.bus_name}</span>
                    <span className="bus-number">{bus.bus_number}</span>
                  </div>
                  <div className="bus-route"><LocationIcon /><span>{bus.route_name}</span></div>
                  <div className="bus-times"><div className="time-item"><ClockIcon /><span>{bus.start_time} – {bus.end_time}</span></div></div>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="near-me-container">
            <button className="near-me-btn" onClick={onNearMe}><LocationIcon /> Find Buses Near Me</button>
          </div>
          <div className="content-section">
            <h2 className="section-title">Bus Routes</h2>
            {routes.map(route => (
              <div key={route.id} className="route-card" onClick={() => onRouteSelect(route.id)}>
                <div className="route-header">
                  <span className="route-name">Route {route.id}</span>
                  <span className="route-id">{route.route_name}</span>
                </div>
                <div className="route-points">
                  <LocationIcon /><span>{route.start_point}</span><ArrowIcon /><span>{route.end_point}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="content-section">
            <h2 className="section-title">Available Buses</h2>
            {buses.slice(0, 6).map((bus, i) => (
              <div key={i} className="bus-card" onClick={() => onBusSelect(bus.bus_id, bus.route_id)}>
                <div className="bus-header">
                  <span className="bus-name">{bus.bus_name}</span>
                  <span className="bus-number">{bus.bus_number}</span>
                </div>
                <div className="bus-route"><LocationIcon /><span>{bus.route_name}</span></div>
                <div className="bus-times"><div className="time-item"><ClockIcon /><span>{bus.start_time} – {bus.end_time}</span></div></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ROUTE DETAIL ─────────────────────────────────────────────────────────────
function RouteDetailScreen({ routeId, onBack, onBusSelect, allRoutes, allBuses }) {
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rRes, sRes, bRes] = await Promise.all([
          fetch(`${API_BASE}/routes/${routeId}`),
          fetch(`${API_BASE}/routes/${routeId}/stops`),
          fetch(`${API_BASE}/buses/route/${routeId}`),
        ]);
        setRoute(await rRes.json());
        setStops(await sRes.json());
        setBuses(await bRes.json());
      } catch { }
      finally { setLoading(false); }
    })();
  }, [routeId]);

  if (loading) return (
    <div className="app-container">
      <header className="header">
        <button className="back-btn" onClick={onBack}><BackIcon /> Back</button>
      </header>
      <div className="loading"><div className="spinner"></div></div>
    </div>
  );

  if (!route) return (
    <div className="app-container">
      <header className="header">
        <button className="back-btn" onClick={onBack}><BackIcon /> Back</button>
      </header>
      <div className="empty-state">
        <div className="empty-state-icon"><BusIcon /></div>
        <p className="empty-state-text">Could not load route. Please go back and try again.</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <button className="back-btn" onClick={onBack}><BackIcon /> Back</button>
      </header>
      <div className="route-detail">
        <div className="route-detail-header">
          <h2 className="route-detail-title">{route?.route_name}</h2>
          <div className="route-detail-path">
            <LocationIcon /><span>{route?.start_point}</span><ArrowIcon /><span>{route?.end_point}</span>
          </div>
        </div>
        <div className="buses-section">
          <h3 className="buses-title">Buses on this Route</h3>
          {buses.map((bus, i) => (
            <div key={i} className="bus-card" onClick={() => onBusSelect(bus.bus_id, routeId)}>
              <div className="bus-header">
                <span className="bus-name">{bus.bus_name}</span>
                <span className="bus-number">{bus.bus_number}</span>
              </div>
              <div className="bus-times">
                <div className="time-item"><ClockIcon /><span>{bus.start_time} – {bus.end_time}</span></div>
              </div>
            </div>
          ))}
        </div>
        <h3 className="buses-title" style={{ marginTop: 20 }}>Stops</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>
          {stops.length} stops · {route?.start_point} → {route?.end_point}
        </p>

        <div style={{ background: '#0f2030', borderRadius: 16, padding: '8px 16px' }}>
          {stops
            .filter((stop, index, self) =>
              index === self.findIndex(s => s.name === stop.name)
            )
            .sort((a, b) => a.stop_order - b.stop_order)
            .map((stop, i, arr) => (
              <div key={stop.id} style={{ display: 'flex', alignItems: 'stretch', gap: 14 }}>

                {/* Dot + connecting line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 14,
                    background: i === 0 ? '#15a8cd' : i === arr.length - 1 ? '#ef4444' : '#334155',
                    border: `2px solid ${i === 0 ? '#15a8cd' : i === arr.length - 1 ? '#ef4444' : '#475569'}`,
                    boxShadow: i === 0 ? '0 0 8px rgba(21,168,205,0.6)' : 'none',
                  }} />
                  {i < arr.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: '#1e3a4a', minHeight: 20 }} />
                  )}
                </div>

                {/* Stop name + badge */}
                <div style={{
                  flex: 1, display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', padding: '12px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: i === 0 ? '#15a8cd' : '#e2e8f0', fontWeight: i === 0 ? 700 : 400 }}>
                      {stop.name}
                    </span>
                    {i === 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#15a8cd',
                        background: 'rgba(21,168,205,0.15)', border: '1px solid rgba(21,168,205,0.3)',
                        padding: '2px 7px', borderRadius: 6, letterSpacing: 0.5,
                      }}>START</span>
                    )}
                    {i === arr.length - 1 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#ef4444',
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                        padding: '2px 7px', borderRadius: 6, letterSpacing: 0.5,
                      }}>END</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 500, marginTop: 2, flexShrink: 0 }}>
                    Stop {i + 1}
                  </span>
                </div>

              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── PUSH NOTIFICATION HOOK ───────────────────────────────────────────────────
function useNotifications(busId, userStop) {
  const intervalRef = useRef(null);

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  };

  const fireNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico', vibrate: [200, 100, 200] });
    }
  };

  useEffect(() => {
    if (!busId || !userStop) return;
    requestPermission();
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/check_nearby_notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bus_id: busId, stop_name: userStop }),
        });
        const data = await res.json();
        if (data.notify) {
          fireNotification('🚌 Bus Approaching!', `Your bus is ${data.distance_km} km away from ${userStop}`);
        }
      } catch { }
    };
    intervalRef.current = setInterval(check, 20000);
    check();
    return () => clearInterval(intervalRef.current);
  }, [busId, userStop]);

  return { fireNotification };
}

// ─── ROAD ROUTE HELPER ───────────────────────────────────────────────────────
async function fetchRoadRoute(routeId) {
  if (!routeId) return null;
  try {
    const res = await fetch(`${API_BASE}/routes/${routeId}/road_path`);
    const data = await res.json();
    if (data.path && data.path.length > 1) return data.path;
  } catch { }
  return null;
}

// ─── BUS TRACKING SCREEN ──────────────────────────────────────────────────────
function BusTrackingScreen({ busId, onBack, userLocation, selectedRouteId }) {
  const mapsLoaded = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const infoWindowRef = useRef(null);
  const lastTapRef = useRef(0);

  const [busData, setBusData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('eta');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [activeBuses, setActiveBuses] = useState([]);
  const [notifyStop, setNotifyStop] = useState('');
  const [showNotifBanner, setShowNotifBanner] = useState(false);
  // Crowdsourcing state
  const [crowdStatus, setCrowdStatus] = useState(null);
  const [crowdReports, setCrowdReports] = useState([]);
  const [onBusReported, setOnBusReported] = useState(false);
  const locationIntervalRef = useRef(null);
  const [crowdLoading, setCrowdLoading] = useState(false);
  const [crowdFeedback, setCrowdFeedback] = useState('');
  const [showCrowdPanel, setShowCrowdPanel] = useState(false);

  useNotifications(busId, notifyStop);

  useEffect(() => {
    if (!mapInstance.current || !window.google) return;
    setTimeout(() => window.google.maps.event.trigger(mapInstance.current, 'resize'), 50);
  }, [isMapFullscreen]);

  // ── BUG FIX 1: destructure all 4 responses correctly ─────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [tRes, sRes, csRes, crRes, abRes] = await Promise.all([
        fetch(`${API_BASE}/track/${busId}${selectedRouteId ? `?route_id=${selectedRouteId}` : ''}`),
        fetch(`${API_BASE}/schedules/bus/${busId}`),
        fetch(`${API_BASE}/crowd/status/${busId}`),
        fetch(`${API_BASE}/crowd/${busId}`),
        fetch(`${API_BASE}/active_buses`),
      ]);
      setBusData(await tRes.json());
      setSchedules(await sRes.json());
      setCrowdStatus(await csRes.json());
      setCrowdReports(await crRes.json());
      setActiveBuses(await abRes.json());
    } catch { }
    finally { setLoading(false); }
  }, [busId]);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 10000);
    return () => clearInterval(iv);
  }, [fetchData]);

  useEffect(() => {
    if (!mapsLoaded || !busData || !mapRef.current) return;
    const center = busData.position
      ? { lat: busData.position.latitude, lng: busData.position.longitude }
      : { lat: 12.92, lng: 79.13 };

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center, zoom: 13, disableDefaultUI: false, zoomControl: true,
      });
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    const map = mapInstance.current;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    const bounds = new window.google.maps.LatLngBounds();

    if (busData.stops?.length > 1) {
      busData.stops.forEach(s => bounds.extend({ lat: s.latitude, lng: s.longitude }));
      const straightPath = busData.stops.map(s => ({ lat: s.latitude, lng: s.longitude }));
      polylineRef.current = new window.google.maps.Polyline({
        path: straightPath, strokeColor: '#15a8cd', strokeOpacity: 0.5, strokeWeight: 3, map,
      });
      fetchRoadRoute(busData.route_id).then(roadPath => {
        if (!roadPath) return;
        if (polylineRef.current) polylineRef.current.setMap(null);
        polylineRef.current = new window.google.maps.Polyline({
          path: roadPath, strokeColor: '#15a8cd', strokeOpacity: 0.9, strokeWeight: 5, map,
        });
      });
    }

    busData.stops?.forEach((stop, i) => {
      const pos = { lat: stop.latitude, lng: stop.longitude };
      bounds.extend(pos);
      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="13" fill="#036ea7" stroke="white" stroke-width="2"/>
            <text x="14" y="19" font-size="11" font-weight="bold" text-anchor="middle" fill="white">${i + 1}</text>
          </svg>`
        )}`,
        scaledSize: new window.google.maps.Size(28, 28),
        anchor: new window.google.maps.Point(14, 14),
      };
      const marker = new window.google.maps.Marker({ position: pos, map, icon, title: stop.name });
      marker.addListener('click', () => {
        const eta = busData.eta?.find(e => e.stop_id === stop.id);
        const etaText = eta ? (eta.eta_minutes <= 2 ? '🟢 Arriving now' : `⏱ ETA: ${eta.eta_minutes} min`) : '';
        infoWindowRef.current.setContent(
          `<div style="padding:8px;min-width:150px;">
            <strong style="color:#1a1a2e">${stop.name}</strong>
            ${etaText ? `<p style="color:#15a8cd;font-size:13px;margin-top:4px">${etaText}</p>` : ''}
          </div>`
        );
        infoWindowRef.current.open(map, marker);
      });
      markersRef.current.push(marker);
    });

    // Draw all OTHER active buses in blue
    activeBuses
      .filter(ab => ab.bus_id !== busId)   // exclude the tracked bus
      .forEach(ab => {
        if (!ab.latitude || !ab.longitude) return;
        const abPos = { lat: ab.latitude, lng: ab.longitude };
        bounds.extend(abPos);
        const blueIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="17" fill="#036ea7" stroke="white" stroke-width="2"/>
              <text x="18" y="24" font-size="18" text-anchor="middle">🚌</text>
            </svg>`
          )}`,
          scaledSize: new window.google.maps.Size(36, 36),
          anchor: new window.google.maps.Point(18, 18),
        };
        const abMarker = new window.google.maps.Marker({
          position: abPos, map, icon: blueIcon,
          title: `${ab.bus_name} (${ab.bus_number})`, zIndex: 100
        });
        abMarker.addListener('click', () => {
          infoWindowRef.current.setContent(
            `<div style="padding:8px;min-width:150px;">
              <strong style="color:#036ea7">${ab.bus_name}</strong>
              <p style="color:#555;font-size:13px">${ab.route_name}</p>
              <p style="color:#15a8cd;font-size:12px">Speed: ${ab.speed || 0} km/h</p>
            </div>`
          );
          infoWindowRef.current.open(map, abMarker);
        });
        markersRef.current.push(abMarker);
      });

    if (busData.position) {
      const busPos = { lat: busData.position.latitude, lng: busData.position.longitude };
      bounds.extend(busPos);
      const busIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="21" fill="#16a34a" stroke="white" stroke-width="2"/>
            <text x="22" y="29" font-size="22" text-anchor="middle">🚌</text>
          </svg>`
        )}`,
        scaledSize: new window.google.maps.Size(44, 44),
        anchor: new window.google.maps.Point(22, 22),
      };
      const busMarker = new window.google.maps.Marker({ position: busPos, map, icon: busIcon, title: busData.bus_name, zIndex: 999 });
      busMarker.addListener('click', () => {
        infoWindowRef.current.setContent(
          `<div style="padding:8px;min-width:160px;">
            <strong style="color:#1a1a2e">${busData.bus_name}</strong>
            <p style="color:#555;font-size:13px">${busData.bus_number}</p>
            <p style="color:#15a8cd;font-size:13px">Speed: ${busData.position.speed || 0} km/h</p>
          </div>`
        );
        infoWindowRef.current.open(map, busMarker);
      });
      markersRef.current.push(busMarker);
    }

    if (userLocation) {
      const uPos = { lat: userLocation.latitude, lng: userLocation.longitude };
      bounds.extend(uPos);
      const userIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="15" fill="#22c55e" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>`
        )}`,
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16),
      };
      markersRef.current.push(new window.google.maps.Marker({ position: uPos, map, icon: userIcon, title: 'You' }));
    }

    if (!bounds.isEmpty()) map.fitBounds(bounds, { top: 60, right: 20, bottom: 20, left: 20 });
  }, [mapsLoaded, busData, userLocation]);

  // ── Crowdsourcing helpers ─────────────────────────────────────────────────
  const reportOnBus = async () => {
    // If already sharing — STOP sharing
    if (onBusReported) {
      clearInterval(locationIntervalRef.current);
      setOnBusReported(false);
      setCrowdFeedback('📍 Location sharing stopped.');
      setTimeout(() => setCrowdFeedback(''), 3000);
      return;
    }

    // Start sharing
    if (!navigator.geolocation) { setCrowdFeedback('Location not available'); return; }
    setCrowdLoading(true);

    const shareLocation = () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await fetch(`${API_BASE}/crowd/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bus_id: busId, report_type: 'location',
              latitude: pos.coords.latitude, longitude: pos.coords.longitude,
              reported_by: 'passenger',
            }),
          });
          fetchData();
        } catch { }
      });
    };

    // Share immediately then every 30 seconds
    shareLocation();
    locationIntervalRef.current = setInterval(shareLocation, 30000);
    setOnBusReported(true);
    setCrowdFeedback('✅ Sharing your location every 30 sec.');
    setTimeout(() => setCrowdFeedback(''), 4000);
    setCrowdLoading(false);
  };

  const reportStatus = async (reportType) => {
    try {
      await fetch(`${API_BASE}/crowd/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bus_id: busId, report_type: reportType, reported_by: 'passenger' }),
      });
      setCrowdFeedback(`✅ Reported: ${reportType.replace('_', ' ')}`);
      fetchData();
      setTimeout(() => setCrowdFeedback(''), 4000);
    } catch { setCrowdFeedback('Failed to report. Try again.'); }
  };

  const confirmReport = async (reportId) => {
    await fetch(`${API_BASE}/crowd/confirm/${reportId}`, { method: 'POST' });
    fetchData();
  };

  const sourceInfo = () => {
    if (!crowdStatus) return { label: '🕐 Schedule only', color: '#888' };
    if (crowdStatus.source === 'driver') return { label: '🚌 Driver Live', color: '#22c55e' };
    if (crowdStatus.source === 'crowd') return { label: '👥 Crowdsourced', color: '#f59e0b' };
    return { label: '🕐 Schedule only', color: '#888' };
  };

  const getNextDeparture = () => {
    if (!schedules.length) return null;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const next = schedules.find(s => {
      const [h, m] = s.departure.split(':').map(Number);
      return h * 60 + m > nowMin;
    });
    return next ? next.departure : schedules[0]?.departure + ' (tomorrow)';
  };

  if (loading) return (
    <div className="app-container">
      <header className="header"><button className="back-btn" onClick={onBack}><BackIcon /> Back</button></header>
      <div className="loading"><div className="spinner"></div></div>
    </div>
  );

  if (!busData) return (
    <div className="app-container">
      <header className="header"><button className="back-btn" onClick={onBack}><BackIcon /> Back</button></header>
      <div className="empty-state">
        <div className="empty-state-icon"><BusIcon /></div>
        <p className="empty-state-text">Bus not found</p>
      </div>
    </div>
  );

  const nextDep = getNextDeparture();
  const srcInfo = sourceInfo();

  return (
    // ── BUG FIX 2: removed the unclosed <div className="Crowdsourcing"> that
    //    was wrapping tracking-tabs and eta/schedule panels inside crowd bar ──
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header className="header">
        <button className="back-btn" onClick={onBack}><BackIcon /> Back</button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{busData.bus_name}</span>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginLeft: 8 }}>({busData.bus_number})</span>
        </div>
        <div style={{ width: 60 }} />
      </header>

      <div className="tracking-info-strip">
        <div className="tracking-route-label">
          <LocationIcon /><span>{busData.start_point}</span><ArrowIcon /><span>{busData.end_point}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
          {/* ── BUG FIX 3: source badge now correctly uses sourceInfo() ── */}
          <div className="live-badge" style={{ background: srcInfo.color + '22', color: srcInfo.color, border: `1px solid ${srcInfo.color}44` }}>
            <span className="status-dot" style={{ background: srcInfo.color }} />
            {srcInfo.label}
          </div>
          {nextDep && <div className="next-dep-badge"><ClockIcon /> Next: {nextDep}</div>}
        </div>
      </div>

      {/* Map */}
      <div
        style={{
          flex: isMapFullscreen ? 'none' : 1,
          minHeight: isMapFullscreen ? '100vh' : 280,
          height: isMapFullscreen ? '100vh' : undefined,
          position: isMapFullscreen ? 'fixed' : 'relative',
          inset: isMapFullscreen ? 0 : undefined,
          zIndex: isMapFullscreen ? 999 : 1,
          background: '#e5e3df',
        }}
        onClick={() => {
          const now = Date.now();
          if (!isMapFullscreen) {
            setIsMapFullscreen(true);
          } else {
            if (now - lastTapRef.current < 350) setIsMapFullscreen(false);
            lastTapRef.current = now;
          }
        }}
      >
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {!mapsLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e3df' }}>
            <div className="spinner" />
          </div>
        )}
        {!isMapFullscreen && (
          <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8, pointerEvents: 'none' }}>
            ⛶ Tap to expand  •  Double-tap to close
          </div>
        )}
        {isMapFullscreen && (
          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, pointerEvents: 'none', zIndex: 1000 }}>
            Double-tap to close
          </div>
        )}
      </div>

      {/* Notification bar */}
      <div className="notif-selector-bar">
        <span className="notif-bell">🔔</span>
        <select
          className="notif-stop-select"
          value={notifyStop}
          onChange={e => {
            setNotifyStop(e.target.value);
            if (e.target.value) {
              Notification.requestPermission().then(p => {
                if (p === 'granted') setShowNotifBanner(true);
                setTimeout(() => setShowNotifBanner(false), 3000);
              });
            }
          }}
        >
          <option value="">Notify me when near stop…</option>
          {busData.stops?.map((s, i) => (
            <option key={i} value={s.name}>{s.name}</option>
          ))}
        </select>
        {notifyStop && <button className="notif-clear-btn" onClick={() => setNotifyStop('')}>✕</button>}
      </div>

      {showNotifBanner && (
        <div className="notif-banner">
          ✅ You'll be notified when the bus is near <strong>{notifyStop}</strong>
        </div>
      )}

      {/* Crowd Alerts */}
      {crowdStatus?.alerts?.length > 0 && (
        <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 16px', fontSize: 13, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>{crowdStatus.alerts[0].report_type === 'not_running' ? '🚫' : '⚠️'}</span>
          <div style={{ flex: 1 }}>
            <strong>{crowdStatus.alerts[0].report_type === 'not_running' ? 'Reported: Not running today' : 'Reported: Bus is delayed'}</strong>
            <span style={{ marginLeft: 8, opacity: 0.7 }}>({crowdStatus.alerts[0].confirmations} report{crowdStatus.alerts[0].confirmations > 1 ? 's' : ''})</span>
          </div>
        </div>
      )}

      {/* ── Crowdsource Bar ── */}
      <div className="crowd-bar">
        <div className="crowd-action-row">
          <button
            className={`crowd-share-btn ${onBusReported ? 'shared' : ''}`}
            onClick={reportOnBus}
            disabled={crowdLoading}
          >
            {crowdLoading ? '⏳ Starting…' : onBusReported ? '✅ Sharing — tap to stop' : "🚌 I'm on this bus"}
          </button>
          <button className="crowd-toggle-btn" onClick={() => setShowCrowdPanel(p => !p)}>
            {showCrowdPanel ? '▲' : '▼'} Reports
          </button>
        </div>

        {crowdFeedback && <p className="crowd-feedback">{crowdFeedback}</p>}

        {/* ── BUG FIX 4: crowd panel now fully rendered with reportStatus wired up ── */}
        {showCrowdPanel && (
          <div className="crowd-panel">
            <p className="crowd-panel-label">Report bus status:</p>
            <div className="crowd-status-btns">
              <button className="crowd-status-btn" onClick={() => reportStatus('stop_departed')}>🛑 Just departed stop</button>
              <button className="crowd-status-btn" onClick={() => reportStatus('delayed')}>⚠️ Bus is delayed</button>
              <button className="crowd-status-btn" onClick={() => reportStatus('not_running')}>🚫 Not running</button>
            </div>

            <p className="crowd-panel-label">
              Recent reports {crowdReports.length > 0 && <span className="crowd-count">({crowdReports.length} active)</span>}
            </p>

            {crowdReports.length === 0 ? (
              <p className="crowd-empty">No crowd reports yet. Be the first!</p>
            ) : (
              <div className="crowd-reports-list">
                {crowdReports.slice(0, 5).map((r, i) => (
                  <div key={i} className="crowd-report-row">
                    <span className="crowd-report-icon">
                      {r.report_type === 'location' ? '📍' : r.report_type === 'delayed' ? '⚠️' : r.report_type === 'not_running' ? '🚫' : '🛑'}
                    </span>
                    <div className="crowd-report-info">
                      <span className="crowd-report-text">
                        {r.report_type === 'location' ? 'Location shared' : r.report_type === 'delayed' ? 'Reported delayed' : r.report_type === 'not_running' ? 'Reported not running' : `Departed: ${r.stop_name || 'a stop'}`}
                      </span>
                      <span className="crowd-report-confirms">{r.confirmations} confirm{r.confirmations !== 1 ? 's' : ''}</span>
                    </div>
                    <button className="crowd-confirm-btn" onClick={() => confirmReport(r.id)}>+1</button>
                  </div>
                ))}
              </div>
            )}

            {crowdStatus?.crowd_stop && (
              <div className="crowd-last-seen">
                👥 <strong>Last seen:</strong> departed <em>{crowdStatus.crowd_stop.stop_name}</em> — {crowdStatus.crowd_stop.confirmations} confirm{crowdStatus.crowd_stop.confirmations !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tracking-tabs">
        <button className={`tracking-tab ${activeTab === 'eta' ? 'active' : ''}`} onClick={() => setActiveTab('eta')}>ETA</button>
        <button className={`tracking-tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
      </div>

      {activeTab === 'eta' && (
        <div className="eta-panel">
          {busData.eta?.length > 0 ? busData.eta.map((eta, i) => (
            <div key={i} className={`eta-row ${eta.eta_minutes <= 2 ? 'arrived' : ''}`}
              onClick={() => {
                const stop = busData.stops?.find(s => s.id === eta.stop_id);
                if (stop && mapInstance.current) {
                  mapInstance.current.panTo({ lat: stop.latitude, lng: stop.longitude });
                  mapInstance.current.setZoom(16);
                }
              }}>
              <div className="eta-stop-info">
                <span className="eta-stop-num">{i + 1}</span>
                <span className="eta-stop-name">{eta.stop_name}</span>
              </div>
              <div className="eta-right">
                <span className="eta-dist">{eta.distance_km} km</span>
                <span className={`eta-time-badge ${eta.eta_minutes <= 2 ? 'green' : ''}`}>
                  {eta.eta_minutes <= 2 ? 'Arriving' : `${eta.eta_minutes} min`}
                </span>
              </div>
            </div>
          )) : <p style={{ textAlign: 'center', color: '#888', padding: 20 }}>No ETA data available</p>}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="eta-panel">
          <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Departures from <strong>{busData.start_point}</strong></p>
          <div className="schedule-grid">
            {schedules.map((s, i) => {
              const now = new Date();
              const nowMin = now.getHours() * 60 + now.getMinutes();
              const [h, m] = s.departure.split(':').map(Number);
              const isPast = h * 60 + m < nowMin;
              const isNext = getNextDeparture() === s.departure;
              return (
                <div key={i} className={`schedule-chip ${isPast ? 'past' : ''} ${isNext ? 'next' : ''}`}>
                  {s.departure}
                  {isNext && <span className="next-label">Next</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DRIVER DASHBOARD ─────────────────────────────────────────────────────────
function DriverDashboard({ user, onBack, onProfileClick }) {
  const mapsLoaded = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const locationWatch = useRef(null);
  const infoWindowRef = useRef(null);

  const [allBuses, setAllBuses] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [tripActive, setTripActive] = useState(false);
  const [driverLoc, setDriverLoc] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [routeStops, setRouteStops] = useState([]);
  const [nextStop, setNextStop] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const prevLocRef = useRef(null);
  const prevTimeRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [bRes, rRes] = await Promise.all([fetch(`${API_BASE}/buses`), fetch(`${API_BASE}/routes`)]);
        setAllBuses(await bRes.json());
        setAllRoutes(await rRes.json());
      } catch { }
    })();
  }, []);

  useEffect(() => {
    if (!selectedRoute) { setFilteredBuses([]); setSelectedBus(null); return; }
    const buses = allBuses.filter(b => b.route_id === selectedRoute.id);
    setFilteredBuses(buses);
    setSelectedBus(null);   // reset bus when route changes
  }, [selectedRoute, allBuses]);

  useEffect(() => {
    if (!selectedBus) return;
    fetch(`${API_BASE}/schedules/bus/${selectedBus.bus_id}`).then(r => r.json()).then(setSchedules).catch(() => { });
  }, [selectedBus]);

  useEffect(() => {
    if (!selectedRoute) return;
    fetch(`${API_BASE}/routes/${selectedRoute.id}/stops`).then(r => r.json()).then(setRouteStops).catch(() => { });
  }, [selectedRoute]);

  const calcSpeed = (loc) => {
    if (prevLocRef.current && prevTimeRef.current) {
      const dt = (Date.now() - prevTimeRef.current) / 1000;
      const R = 6371000;
      const dLat = (loc.latitude - prevLocRef.current.latitude) * Math.PI / 180;
      const dLon = (loc.longitude - prevLocRef.current.longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(prevLocRef.current.latitude * Math.PI / 180) * Math.cos(loc.latitude * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const kmh = (dist / dt) * 3.6;
      setSpeed(Math.round(kmh > 120 ? 0 : kmh));
    }
    prevLocRef.current = loc;
    prevTimeRef.current = Date.now();
  };

  const findNextStop = (loc) => {
    if (!routeStops.length) return;
    let nearest = null, minDist = Infinity;
    routeStops.forEach(stop => {
      const d = Math.sqrt((stop.latitude - loc.latitude) ** 2 + (stop.longitude - loc.longitude) ** 2);
      if (d < minDist) { minDist = d; nearest = stop; }
    });
    setNextStop(nearest);
  };

  const startTrip = () => {
    if (!selectedBus || !selectedRoute) return;
    setTripActive(true);
    locationWatch.current = navigator.geolocation.watchPosition(
      pos => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setDriverLoc(loc);
        calcSpeed(loc);
        findNextStop(loc);
        fetch(`${API_BASE}/update_position`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('navbus_token')}`
          },
          body: JSON.stringify({ bus_id: selectedBus.bus_id, latitude: loc.latitude, longitude: loc.longitude, speed }),
        }).catch(() => { });
      },
      () => { },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const endTrip = () => {
    setTripActive(false);
    if (locationWatch.current) navigator.geolocation.clearWatch(locationWatch.current);
    setDriverLoc(null); setSpeed(0); setNextStop(null);
  };

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 12.92, lng: 79.13 }, zoom: 13, disableDefaultUI: false, zoomControl: true,
      });
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }
    const map = mapInstance.current;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    const bounds = new window.google.maps.LatLngBounds();

    if (routeStops.length > 1) {
      routeStops.forEach(s => bounds.extend({ lat: s.latitude, lng: s.longitude }));
      const straightPath = routeStops.map(s => ({ lat: s.latitude, lng: s.longitude }));
      polylineRef.current = new window.google.maps.Polyline({
        path: straightPath, strokeColor: '#15a8cd', strokeOpacity: 0.4, strokeWeight: 3, map,
      });
      fetchRoadRoute(selectedRoute?.id).then(roadPath => {
        if (!roadPath) return;
        if (polylineRef.current) polylineRef.current.setMap(null);
        polylineRef.current = new window.google.maps.Polyline({
          path: roadPath, strokeColor: '#15a8cd', strokeOpacity: 0.9, strokeWeight: 5, map,
        });
      });
      routeStops.forEach((stop, i) => {
        const pos = { lat: stop.latitude, lng: stop.longitude };
        const icon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
              <circle cx="13" cy="13" r="12" fill="${nextStop?.id === stop.id ? '#f59e0b' : '#036ea7'}" stroke="white" stroke-width="2"/>
              <text x="13" y="18" font-size="10" font-weight="bold" text-anchor="middle" fill="white">${i + 1}</text>
            </svg>`
          )}`,
          scaledSize: new window.google.maps.Size(26, 26),
          anchor: new window.google.maps.Point(13, 13),
        };
        const marker = new window.google.maps.Marker({ position: pos, map, icon, title: stop.name });
        marker.addListener('click', () => {
          infoWindowRef.current.setContent(`<div style="padding:8px"><strong>${stop.name}</strong></div>`);
          infoWindowRef.current.open(map, marker);
        });
        markersRef.current.push(marker);
      });
    }

    if (driverLoc) {
      const dPos = { lat: driverLoc.latitude, lng: driverLoc.longitude };
      bounds.extend(dPos);
      const dIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="23" fill="#15a8cd" stroke="white" stroke-width="2"/>
            <text x="24" y="31" font-size="24" text-anchor="middle">🚌</text>
          </svg>`
        )}`,
        scaledSize: new window.google.maps.Size(48, 48),
        anchor: new window.google.maps.Point(24, 24),
      };
      markersRef.current.push(new window.google.maps.Marker({ position: dPos, map, icon: dIcon, title: 'You', zIndex: 999 }));
      map.panTo(dPos);
    }

    if (!bounds.isEmpty()) map.fitBounds(bounds, { top: 60, right: 20, bottom: 20, left: 20 });
  }, [mapsLoaded, routeStops, driverLoc, nextStop]);

  const getNextDeparture = () => {
    if (!schedules.length) return null;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const next = schedules.find(s => {
      const [h, m] = s.departure.split(':').map(Number);
      return h * 60 + m > nowMin;
    });
    return next?.departure || null;
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header className="header">
        <div className="header-left">
          <div className="header-logo"><NavBusLogo /></div>
          <div className="header-title-group">
            <h1 className="header-title">Driver Mode</h1>
            <div className="header-location"><LocationIcon /><span>KV1 Route</span></div>
          </div>
        </div>
        <div className="header-right">
          <div className="profile-icon" onClick={onProfileClick}><ProfileIcon /></div>
        </div>
      </header>

      {!tripActive && (
        <div className="driver-selector-card">
          <p className="driver-selector-title">Select Your Bus & Route</p>

          {/* Step 1 — Pick Route first */}
          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
              Step 1 — Choose Route
            </label>
            <select
              value={selectedRoute?.id || ''}
              onChange={e => {
                const route = allRoutes.find(r => r.id === parseInt(e.target.value));
                setSelectedRoute(route || null);
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e5e5', fontSize: 14, color: '#1a1a2e', background: '#f9f9f9', marginBottom: 14 }}
            >
              <option value="">-- Choose Route --</option>
              {allRoutes.map(r => (
                <option key={r.id} value={r.id}>{r.route_name}</option>
              ))}
            </select>
          </div>

          {/* Step 2 — Pick Bus (only shows after route selected) */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: selectedRoute ? '#94a3b8' : '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
              Step 2 — Choose Your Bus
              {!selectedRoute && <span style={{ fontWeight: 400, fontSize: 11, marginLeft: 6 }}>(select route first)</span>}
            </label>
            <select
              value={selectedBus?.bus_id || ''}
              disabled={!selectedRoute}
              onChange={e => {
                const bus = filteredBuses.find(b => b.bus_id === e.target.value);
                setSelectedBus(bus || null);
              }}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
                border: `1.5px solid ${selectedRoute ? '#e5e5e5' : '#f0f0f0'}`,
                color: selectedRoute ? '#1a1a2e' : '#aaa',
                background: selectedRoute ? '#f9f9f9' : '#f5f5f5',
                marginBottom: 4,
              }}
            >
              <option value="">-- Choose Bus --</option>
              {filteredBuses.map(b => (
                <option key={b.bus_id} value={b.bus_id}>
                  {b.bus_name} ({b.bus_number})
                </option>
              ))}
            </select>
            {selectedRoute && filteredBuses.length === 0 && (
              <p style={{ fontSize: 12, color: '#f59e0b', margin: '4px 0 0' }}>
                ⚠️ No buses found for this route
              </p>
            )}
            {selectedRoute && filteredBuses.length > 0 && (
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                {filteredBuses.length} bus{filteredBuses.length > 1 ? 'es' : ''} available on this route
              </p>
            )}
          </div>

          <button
            className="trip-search-btn"
            onClick={startTrip}
            disabled={!selectedBus || !selectedRoute}
          >
            🚦 Start Trip
          </button>
        </div>
      )}

      {tripActive && (
        <div className="driver-trip-bar">
          <div className="driver-trip-info">
            <div className="driver-trip-bus">
              <span className="driver-bus-badge">🚌 {selectedBus?.bus_number}</span>
              <span className="driver-route-name">{selectedRoute?.route_name}</span>
            </div>
            <div className="driver-trip-stats">
              <div className="driver-stat"><span className="driver-stat-label">Speed</span><span className="driver-stat-value">{speed} km/h</span></div>
              <div className="driver-stat"><span className="driver-stat-label">Next Stop</span><span className="driver-stat-value">{nextStop?.name || '—'}</span></div>
              <div className="driver-stat"><span className="driver-stat-label">Next Dep</span><span className="driver-stat-value">{getNextDeparture() || '—'}</span></div>
            </div>
          </div>
          <button className="driver-end-btn" onClick={endTrip}>⏹ End Trip</button>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 300, position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {!mapsLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e3df' }}>
            <div className="spinner" />
          </div>
        )}
        {!driverLoc && tripActive && (
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 13 }}>
            📡 Getting your location…
          </div>
        )}
      </div>

      <div className="tracking-tabs">
        <button className={`tracking-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Info</button>
        <button className={`tracking-tab ${activeTab === 'stops' ? 'active' : ''}`} onClick={() => setActiveTab('stops')}>Stops</button>
        <button className={`tracking-tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
      </div>

      {activeTab === 'info' && (
        <div className="eta-panel">
          {selectedBus ? (
            <div style={{ padding: '4px 0' }}>
              <div className="driver-info-row"><span className="driver-info-label">Bus Name</span><span className="driver-info-value">{selectedBus.bus_name}</span></div>
              <div className="driver-info-row"><span className="driver-info-label">Bus Number</span><span className="driver-info-value">{selectedBus.bus_number}</span></div>
              <div className="driver-info-row"><span className="driver-info-label">Route</span><span className="driver-info-value">{selectedRoute?.route_name || '—'}</span></div>
              <div className="driver-info-row"><span className="driver-info-label">From</span><span className="driver-info-value">{selectedRoute?.start_point || '—'}</span></div>
              <div className="driver-info-row"><span className="driver-info-label">To</span><span className="driver-info-value">{selectedRoute?.end_point || '—'}</span></div>
              <div className="driver-info-row"><span className="driver-info-label">First Dep</span><span className="driver-info-value">{selectedBus.start_time}</span></div>
              <div className="driver-info-row"><span className="driver-info-label">Last Dep</span><span className="driver-info-value">{selectedBus.end_time}</span></div>
              <div className="driver-info-row">
                <span className="driver-info-label">Status</span>
                <span style={{ color: tripActive ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{tripActive ? '🟢 On Trip' : '🟡 Idle'}</span>
              </div>
            </div>
          ) : <p style={{ textAlign: 'center', color: '#888', padding: 20 }}>Select a bus to see details</p>}
        </div>
      )}

      {activeTab === 'stops' && (
        <div className="eta-panel">
          {routeStops.length > 0 ? routeStops.map((stop, i) => (
            <div key={stop.id} className={`eta-row ${nextStop?.id === stop.id ? 'arrived' : ''}`}>
              <div className="eta-stop-info">
                <span className="eta-stop-num" style={{ background: nextStop?.id === stop.id ? '#f59e0b' : undefined }}>{i + 1}</span>
                <span className="eta-stop-name">{stop.name}</span>
              </div>
              {nextStop?.id === stop.id && <span className="eta-time-badge green">Next</span>}
            </div>
          )) : <p style={{ textAlign: 'center', color: '#888', padding: 20 }}>Select a route to see stops</p>}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="eta-panel">
          {schedules.length > 0 ? (
            <>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Departures from <strong>{selectedRoute?.start_point}</strong></p>
              <div className="schedule-grid">
                {schedules.map((s, i) => {
                  const now = new Date();
                  const nowMin = now.getHours() * 60 + now.getMinutes();
                  const [h, m] = s.departure.split(':').map(Number);
                  const isPast = h * 60 + m < nowMin;
                  const isNext = getNextDeparture() === s.departure;
                  const timeLabel = s.arrival && s.arrival !== s.departure ? `${s.arrival} → ${s.departure}` : s.departure;
                  return (
                    <div key={i} className={`schedule-chip ${isPast ? 'past' : ''} ${isNext ? 'next' : ''}`}>
                      {timeLabel}
                      {isNext && <span className="next-label">Next</span>}
                    </div>
                  );
                })}
              </div>
            </>
          ) : <p style={{ textAlign: 'center', color: '#888', padding: 20 }}>Select a bus to see schedule</p>}
        </div>
      )}
    </div>
  );
}

// ─── NEARBY BUSES ─────────────────────────────────────────────────────────────
function NearbyBusesScreen({ onBack, onBusSelect }) {
  const [nearbyBuses, setNearbyBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNearby = () => {
    setLoading(true);
    if (!navigator.geolocation) { setError('Geolocation not supported'); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const res = await fetch(`${API_BASE}/nearby?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&radius=5`);
          setNearbyBuses(await res.json()); setError(null);
        } catch { setError('Failed to fetch nearby buses'); }
        finally { setLoading(false); }
      },
      () => { setError('Unable to get your location.'); setLoading(false); }
    );
  };

  useEffect(() => { fetchNearby(); }, []);

  return (
    <div className="app-container">
      <header className="header">
        <button className="back-btn" onClick={onBack}><BackIcon /> Back</button>
        <h1 className="header-title" style={{ fontSize: 18 }}>Nearby Buses</h1>
        <div style={{ width: 60 }} />
      </header>
      <div className="nearby-section">
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon"><LocationIcon /></div>
            <p className="empty-state-text">{error}</p>
            <button className="near-me-btn" onClick={fetchNearby} style={{ marginTop: 16 }}>Try Again</button>
          </div>
        ) : nearbyBuses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><BusIcon /></div>
            <p className="empty-state-text">No buses found nearby</p>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: 16, color: '#6b7280' }}>Found {nearbyBuses.length} bus(es) within 5 km</p>
            {nearbyBuses.map((bus, i) => (
              <div key={i} className="nearby-bus-card" onClick={() => onBusSelect(bus.bus_id, bus.route_id)}>
                <div className="nearby-bus-header">
                  <span className="nearby-bus-name">{bus.bus_name}</span>
                  <span className="nearby-distance">{bus.distance} km away</span>
                </div>
                <div className="nearby-route">{bus.bus_number} • {bus.route_name}</div>
                {bus.current_stop_name && <div style={{ fontSize: 13, color: '#6b7280' }}>Currently at: {bus.current_stop_name}</div>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── APP ROOT ────────────────────────────────────────────────────────────────
function App() {
  const savedUser = JSON.parse(localStorage.getItem('navbus_user') || 'null');

  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedUser);
  const [showRegister, setShowRegister] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [cityName, setCityName] = useState('');
  const [user, setUser] = useState(savedUser);
  const [screen, setScreen] = useState('home');
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState('light');
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [rRes, bRes] = await Promise.all([fetch(`${API_BASE}/routes`), fetch(`${API_BASE}/buses`)]);
        setRoutes(await rRes.json());
        setBuses(await bRes.json());
      } catch { }
    })();
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLocation.latitude}&lon=${userLocation.longitude}&format=json`)
      .then(r => r.json())
      .then(d => {
        const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || '';
        setCityName(city);
      }).catch(() => { });
  }, [userLocation]);

  useEffect(() => { document.body.setAttribute('data-theme', theme); }, [theme]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('navbus_user');
    localStorage.removeItem('navbus_token');
    setShowProfile(false);
    setScreen('home');
    setRecentSearches([]);
  };

  const handleSaveSearch = (query) => {
    setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 10));
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  if (showRegister) return (
    <RegisterScreen
      onLoginClick={() => setShowRegister(false)}
      onRegister={(u) => {
        setUser(u);
        setIsLoggedIn(true);
        setShowRegister(false);
        localStorage.setItem('navbus_user', JSON.stringify(u));
        if (u.token) localStorage.setItem('navbus_token', u.token);
      }}
    />
  );

  if (!isLoggedIn) return (
    <LoginScreen
      onLogin={(u) => {
        setUser(u);
        setIsLoggedIn(true);
        localStorage.setItem('navbus_user', JSON.stringify(u));
        localStorage.setItem('navbus_token', u.token);
      }}
      onRegisterClick={() => setShowRegister(true)}
    />
  );

  if (!locationGranted) return (
    <LocationPermissionScreen
      onGranted={loc => { setUserLocation(loc); setLocationGranted(true); }}
      onDenied={() => setLocationGranted(true)}
    />
  );

  const goHome = () => { setScreen('home'); setSelectedRouteId(null); setSelectedBusId(null); };

  const drawer = showProfile && (
    <ProfileDrawer
      user={user} recentSearches={recentSearches} theme={theme}
      onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
      onLogout={handleLogout}
      onClose={() => setShowProfile(false)}
    />
  );

  if (user?.role === 'driver') {
    return <><DriverDashboard user={user} onBack={goHome} onProfileClick={() => setShowProfile(true)} />{drawer}</>;
  }

  switch (screen) {
    case 'routeDetail':
      return <><RouteDetailScreen routeId={selectedRouteId} onBack={goHome} allRoutes={routes} allBuses={buses} onBusSelect={(busId, routeId) => { setSelectedBusId(busId); if (routeId) setSelectedRouteId(routeId); setScreen('tracking'); }} />{drawer}</>;
    case 'tracking':
      return <><BusTrackingScreen busId={selectedBusId} onBack={goHome} userLocation={userLocation} selectedRouteId={selectedRouteId} />{drawer}</>;
    case 'nearby':
      return <><NearbyBusesScreen onBack={goHome} onBusSelect={id => { setSelectedBusId(id); setScreen('tracking'); }} />{drawer}</>;
    default:
      return (
        <>
          <HomeScreen
            routes={routes} buses={buses} user={user} cityName={cityName}
            onRouteSelect={id => { setSelectedRouteId(id); setScreen('routeDetail'); }}
            onBusSelect={id => { setSelectedBusId(id); setScreen('tracking'); }}
            onNearMe={() => setScreen('nearby')}
            onProfileClick={() => setShowProfile(true)}
            onSaveSearch={handleSaveSearch}
            userLocation={userLocation}
          />
          {drawer}
        </>
      );
  }
}

export default App;