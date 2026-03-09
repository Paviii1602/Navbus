import React, { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000/api`;
const GOOGLE_MAPS_API_KEY = 'AIzaSyDEvQLodWBd5hrO4g5YdCsL78s5-GjU40I';

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const BusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);
const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
  </svg>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);
const NavBusLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
  </svg>
);
const SwapIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
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
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter username and password'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE}/login`, {
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
            {loading
              ? <span className="login-loading">⏳ Signing in…</span>
              : '→  Sign In'}
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
  const [role,     setRole]     = useState('passenger');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please fill all fields'); return; }
    if (password.length < 4)   { setError('Password must be at least 4 characters'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE}/register`, {
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

        {/* User Info */}
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

        {/* Recent Searches */}
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

        {/* Theme Toggle */}
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

        {/* Logout */}
        <div className="drawer-section">
          <button className="drawer-logout-btn" onClick={onLogout}>🚪 Log Out</button>
        </div>
      </div>
    </>
  );
}

// ─── TRIP SEARCH (From → To) ──────────────────────────────────────────────────
function TripSearchBar({ onTripResult, onSaveSearch }) {
  const [fromQuery,    setFromQuery]    = useState('');
  const [toQuery,      setToQuery]      = useState('');
  const [fromSuggests, setFromSuggests] = useState([]);
  const [toSuggests,   setToSuggests]   = useState([]);
  const [fromStop,     setFromStop]     = useState(null);
  const [toStop,       setToStop]       = useState(null);
  const [searching,    setSearching]    = useState(false);
  const [activeField,  setActiveField]  = useState(null); // 'from' | 'to'

  // Fetch stop suggestions
  const fetchSuggests = async (q, setter) => {
    if (q.length < 2) { setter([]); return; }
    try {
      const res  = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      // Deduplicate by name — keep first occurrence per unique name
      const seen = new Set();
      const unique = (data.stops || []).filter(s => {
        if (seen.has(s.name)) return false;
        seen.add(s.name); return true;
      });
      setter(unique.slice(0, 6));
    } catch { setter([]); }
  };

  const handleFromChange = (v) => {
    setFromQuery(v); setFromStop(null); setActiveField('from');
    fetchSuggests(v, setFromSuggests);
  };

  const handleToChange = (v) => {
    setToQuery(v); setToStop(null); setActiveField('to');
    fetchSuggests(v, setToSuggests);
  };

  const selectFrom = (stop) => {
    setFromStop(stop); setFromQuery(stop.name);
    setFromSuggests([]); setActiveField(null);
  };

  const selectTo = (stop) => {
    setToStop(stop); setToQuery(stop.name);
    setToSuggests([]); setActiveField(null);
  };

  const swapStops = () => {
    setFromStop(toStop);   setFromQuery(toQuery);
    setToStop(fromStop);   setToQuery(fromQuery);
    setFromSuggests([]);   setToSuggests([]);
  };

  const handleSearch = async () => {
    if (!fromStop || !toStop) return;
    setSearching(true);
    try {
      // Find buses passing through both stops (same route_id)
      const res  = await fetch(`${API_BASE}/search?q=${encodeURIComponent(fromStop.name)}`);
      const data = await res.json();

      // Get all routes that have both stops
      const routesRes = await fetch(`${API_BASE}/routes`);
      const allRoutes = await routesRes.json();

      const matchingBuses = [];
      for (const route of allRoutes) {
        const stopsRes  = await fetch(`${API_BASE}/routes/${route.id}/stops`);
        const stops     = await stopsRes.json();
        const stopNames = stops.map(s => s.name.toLowerCase());
        const hasFrom   = stopNames.includes(fromStop.name.toLowerCase());
        const hasTo     = stopNames.includes(toStop.name.toLowerCase());
        if (hasFrom && hasTo) {
          const fromOrder = stops.find(s => s.name.toLowerCase() === fromStop.name.toLowerCase())?.stop_order;
          const toOrder   = stops.find(s => s.name.toLowerCase() === toStop.name.toLowerCase())?.stop_order;
          if (fromOrder < toOrder) {
            const busRes  = await fetch(`${API_BASE}/buses/route/${route.id}`);
            const buses   = await busRes.json();
            buses.forEach(b => matchingBuses.push({ ...b, fromStop, toStop, route }));
          }
        }
      }

      if (onSaveSearch) onSaveSearch(`${fromStop.name} → ${toStop.name}`);
      onTripResult(matchingBuses, fromStop, toStop);
    } catch {}
    setSearching(false);
  };

  return (
    <div className="trip-search-container">
      {/* FROM input */}
      <div className="trip-field-row">
        <div className="trip-field-icon from"><LocationIcon /></div>
        <div className="trip-field-wrap">
          <input
            className="trip-input"
            placeholder="From stop…"
            value={fromQuery}
            onChange={e => handleFromChange(e.target.value)}
            onFocus={() => setActiveField('from')}
          />
          {activeField === 'from' && fromSuggests.length > 0 && (
            <div className="trip-suggestions">
              {fromSuggests.map((s, i) => (
                <div key={i} className="trip-suggest-item" onClick={() => selectFrom(s)}>
                  <LocationIcon /><span>{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swap button */}
      <div className="trip-swap-row">
        <div className="trip-connector-line" />
        <button className="trip-swap-btn" onClick={swapStops}><SwapIcon /></button>
        <div className="trip-connector-line" />
      </div>

      {/* TO input */}
      <div className="trip-field-row">
        <div className="trip-field-icon to"><LocationIcon /></div>
        <div className="trip-field-wrap">
          <input
            className="trip-input"
            placeholder="To stop…"
            value={toQuery}
            onChange={e => handleToChange(e.target.value)}
            onFocus={() => setActiveField('to')}
          />
          {activeField === 'to' && toSuggests.length > 0 && (
            <div className="trip-suggestions">
              {toSuggests.map((s, i) => (
                <div key={i} className="trip-suggest-item" onClick={() => selectTo(s)}>
                  <LocationIcon /><span>{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search button */}
      <button
        className="trip-search-btn"
        onClick={handleSearch}
        disabled={!fromStop || !toStop || searching}
      >
        {searching ? 'Searching…' : <><SearchIcon /> Find Buses</>}
      </button>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({ routes, buses, user, cityName, onRouteSelect, onBusSelect, onNearMe, onProfileClick, onSaveSearch }) {
  const [tripResults, setTripResults] = useState(null);
  const [tripFrom,    setTripFrom]    = useState(null);
  const [tripTo,      setTripTo]      = useState(null);

  const handleTripResult = (results, from, to) => {
    setTripResults(results);
    setTripFrom(from);
    setTripTo(to);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="header-logo"><NavBusLogo /></div>
          <div className="header-title-group">
            <h1 className="header-title">NavBus</h1>
            {cityName && (
              <div className="header-location">
                <LocationIcon />
                <span>{cityName}</span>
              </div>
            )}
          </div>
        </div>
        <div className="header-right">
          <div className="profile-icon" onClick={onProfileClick}><ProfileIcon /></div>
        </div>
      </header>

      {/* Trip Search */}
      <TripSearchBar onTripResult={handleTripResult} onSaveSearch={onSaveSearch} />

      {/* Trip Results */}
      {tripResults !== null ? (
        <div className="content-section">
          <div className="trip-result-header">
            <span className="trip-result-label">
              {tripFrom?.name} → {tripTo?.name}
            </span>
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
                <div key={i} className="bus-card" onClick={() => onBusSelect(bus.bus_id)}>
                  <div className="bus-header">
                    <span className="bus-name">{bus.bus_name}</span>
                    <span className="bus-number">{bus.bus_number}</span>
                  </div>
                  <div className="bus-route">
                    <LocationIcon />
                    <span>{bus.route_name}</span>
                  </div>
                  <div className="bus-times">
                    <div className="time-item">
                      <ClockIcon />
                      <span>{bus.start_time} – {bus.end_time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <>
          {/* Near Me */}
          <div className="near-me-container">
            <button className="near-me-btn" onClick={onNearMe}>
              <LocationIcon /> Find Buses Near Me
            </button>
          </div>

          {/* Routes */}
          <div className="content-section">
            <h2 className="section-title">Bus Routes</h2>
            {routes.map(route => (
              <div key={route.id} className="route-card" onClick={() => onRouteSelect(route.id)}>
                <div className="route-header">
                  <span className="route-name">Route {route.id}</span>
                  <span className="route-id">{route.route_name}</span>
                </div>
                <div className="route-points">
                  <LocationIcon />
                  <span>{route.start_point}</span>
                  <ArrowIcon />
                  <span>{route.end_point}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Buses */}
          <div className="content-section">
            <h2 className="section-title">Available Buses</h2>
            {buses.slice(0, 6).map((bus, i) => (
              <div key={i} className="bus-card" onClick={() => onBusSelect(bus.bus_id)}>
                <div className="bus-header">
                  <span className="bus-name">{bus.bus_name}</span>
                  <span className="bus-number">{bus.bus_number}</span>
                </div>
                <div className="bus-route">
                  <LocationIcon />
                  <span>{bus.route_name}</span>
                </div>
                <div className="bus-times">
                  <div className="time-item">
                    <ClockIcon />
                    <span>{bus.start_time} – {bus.end_time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ROUTE DETAIL ─────────────────────────────────────────────────────────────
function RouteDetailScreen({ routeId, onBack, onBusSelect }) {
  const [route,   setRoute]   = useState(null);
  const [stops,   setStops]   = useState([]);
  const [buses,   setBuses]   = useState([]);
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
      } catch {}
      finally { setLoading(false); }
    })();
  }, [routeId]);

  if (loading) return (
    <div className="app-container">
      <header className="header"><button className="back-btn" onClick={onBack}><BackIcon /> Back</button></header>
      <div className="loading"><div className="spinner"></div></div>
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
            <div key={i} className="bus-card" onClick={() => onBusSelect(bus.bus_id)}>
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
        {stops.map((stop, i) => (
          <div key={stop.id} className="stop-card">
            <div className="stop-marker"><span style={{ color: 'white', fontWeight: 600, fontSize: 12 }}>{i + 1}</span></div>
            <div className="stop-info"><span className="stop-name">{stop.name}</span></div>
          </div>
        ))}
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
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
      });
    }
  };

  useEffect(() => {
    if (!busId || !userStop) return;
    requestPermission();

    // Poll every 20 seconds to check if bus is near chosen stop
    const check = async () => {
      try {
        const res  = await fetch(`${API_BASE}/check_nearby_notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bus_id: busId, stop_name: userStop }),
        });
        const data = await res.json();
        if (data.notify) {
          fireNotification(
            '🚌 Bus Approaching!',
            `Your bus is ${data.distance_km} km away from ${userStop}`
          );
        }
      } catch {}
    };

    intervalRef.current = setInterval(check, 20000);
    check(); // immediate first check
    return () => clearInterval(intervalRef.current);
  }, [busId, userStop]);

  return { fireNotification };
}

// ─── ROAD ROUTE HELPER (calls Flask backend to avoid CORS) ──────────────────
async function fetchRoadRoute(routeId) {
  if (!routeId) return null;
  try {
    const res  = await fetch(`${API_BASE}/routes/${routeId}/road_path`);
    const data = await res.json();
    if (data.path && data.path.length > 1) return data.path;
  } catch {}
  return null;
}

// ─── BUS TRACKING SCREEN ──────────────────────────────────────────────────────
function BusTrackingScreen({ busId, onBack, userLocation }) {
  const mapsLoaded       = useGoogleMaps();
  const mapRef           = useRef(null);
  const mapInstance      = useRef(null);
  const markersRef       = useRef([]);
  const polylineRef      = useRef(null);
  const infoWindowRef    = useRef(null);
  const [busData,         setBusData]         = useState(null);
  const [schedules,       setSchedules]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState('eta');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [notifyStop,      setNotifyStop]      = useState('');
  const [showNotifBanner, setShowNotifBanner] = useState(false);
  const lastTapRef = useRef(0);
  useNotifications(busId, notifyStop);

  useEffect(() => {
    if (!mapInstance.current || !window.google) return;
    setTimeout(() => window.google.maps.event.trigger(mapInstance.current, 'resize'), 50);
  }, [isMapFullscreen]);

  const fetchData = useCallback(async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/track/${busId}`),
        fetch(`${API_BASE}/schedules/bus/${busId}`),
      ]);
      setBusData(await tRes.json());
      setSchedules(await sRes.json());
    } catch {}
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
        center, zoom: 13,
        disableDefaultUI: false, zoomControl: true,
      });
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    const map = mapInstance.current;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    const bounds = new window.google.maps.LatLngBounds();

    // Draw straight line first (immediate), then replace with road route
    if (busData.stops?.length > 1) {
      busData.stops.forEach(s => bounds.extend({ lat: s.latitude, lng: s.longitude }));
      // Draw straight line immediately so map loads fast
      const straightPath = busData.stops.map(s => ({ lat: s.latitude, lng: s.longitude }));
      if (polylineRef.current) polylineRef.current.setMap(null);
      polylineRef.current = new window.google.maps.Polyline({
        path: straightPath, strokeColor: '#15a8cd',
        strokeOpacity: 0.5, strokeWeight: 3,
        strokeDasharray: '8,4', map,
      });
      // Then async fetch road path and replace
      fetchRoadRoute(busData.route_id).then(roadPath => {
        if (!roadPath) return;
        if (polylineRef.current) polylineRef.current.setMap(null);
        polylineRef.current = new window.google.maps.Polyline({
          path: roadPath, strokeColor: '#15a8cd',
          strokeOpacity: 0.9, strokeWeight: 5, map,
        });
      });
    }

    // Stop markers
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
        anchor:     new window.google.maps.Point(14, 14),
      };
      const marker = new window.google.maps.Marker({ position: pos, map, icon, title: stop.name });
      marker.addListener('click', () => {
        const eta     = busData.eta?.find(e => e.stop_id === stop.id);
        const etaText = eta
          ? eta.eta_minutes <= 2 ? '🟢 Arriving now' : `⏱ ETA: ${eta.eta_minutes} min`
          : '';
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

    // Bus marker
    if (busData.position) {
      const busPos = { lat: busData.position.latitude, lng: busData.position.longitude };
      bounds.extend(busPos);
      const busIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="21" fill="#15a8cd" stroke="white" stroke-width="2"/>
            <text x="22" y="29" font-size="22" text-anchor="middle">🚌</text>
          </svg>`
        )}`,
        scaledSize: new window.google.maps.Size(44, 44),
        anchor:     new window.google.maps.Point(22, 22),
      };
      const busMarker = new window.google.maps.Marker({
        position: busPos, map, icon: busIcon, title: busData.bus_name, zIndex: 999,
      });
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

    // User location marker
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
        anchor:     new window.google.maps.Point(16, 16),
      };
      markersRef.current.push(new window.google.maps.Marker({ position: uPos, map, icon: userIcon, title: 'You' }));
    }

    if (!bounds.isEmpty()) map.fitBounds(bounds, { top: 60, right: 20, bottom: 20, left: 20 });
  }, [mapsLoaded, busData, userLocation]);

  const getNextDeparture = () => {
    if (!schedules.length) return null;
    const now    = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const next   = schedules.find(s => {
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

  return (
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
          <div className="live-badge"><span className="status-dot"></span> Live</div>
          {nextDep && <div className="next-dep-badge"><ClockIcon /> Next: {nextDep}</div>}
        </div>
      </div>

      {/* Map with tap-to-fullscreen */}
      <div
        style={{
          flex:      isMapFullscreen ? 'none' : 1,
          minHeight: isMapFullscreen ? '100vh' : 280,
          height:    isMapFullscreen ? '100vh' : undefined,
          position:  isMapFullscreen ? 'fixed' : 'relative',
          inset:     isMapFullscreen ? 0 : undefined,
          zIndex:    isMapFullscreen ? 999 : 1,
          background: '#e5e3df',
        }}
        onClick={() => {
          const now = Date.now();
          if (!isMapFullscreen) {
            setIsMapFullscreen(true);
          } else {
            if (now - lastTapRef.current < 350) {
              setIsMapFullscreen(false);
            }
            lastTapRef.current = now;
          }
        }}
      >
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {!mapsLoaded && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#e5e3df' }}>
            <div className="spinner" />
          </div>
        )}
        {!isMapFullscreen && (
          <div style={{ position:'absolute', bottom:10, right:10, background:'rgba(0,0,0,0.55)', color:'white', fontSize:12, fontWeight:600, padding:'5px 10px', borderRadius:8, pointerEvents:'none' }}>
            ⛶ Tap to expand  •  Double-tap to close
          </div>
        )}
        {isMapFullscreen && (
          <div style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.6)', color:'white', padding:'8px 20px', borderRadius:20, fontSize:13, fontWeight:600, pointerEvents:'none', zIndex:1000 }}>
            Double-tap to close
          </div>
        )}
      </div>

      {/* Notification stop selector */}
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
          )) : <p style={{ textAlign:'center', color:'#888', padding:20 }}>No ETA data available</p>}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="eta-panel">
          <p style={{ fontSize:13, color:'#888', marginBottom:12 }}>Departures from <strong>{busData.start_point}</strong></p>
          <div className="schedule-grid">
            {schedules.map((s, i) => {
              const now    = new Date();
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
  const mapsLoaded    = useGoogleMaps();
  const mapRef        = useRef(null);
  const mapInstance   = useRef(null);
  const markersRef    = useRef([]);
  const polylineRef   = useRef(null);
  const locationWatch = useRef(null);
  const infoWindowRef = useRef(null);

  const [allBuses,     setAllBuses]     = useState([]);
  const [allRoutes,    setAllRoutes]    = useState([]);
  const [selectedBus,  setSelectedBus]  = useState(null);
  const [selectedRoute,setSelectedRoute]= useState(null);
  const [schedules,    setSchedules]    = useState([]);
  const [tripActive,   setTripActive]   = useState(false);
  const [driverLoc,    setDriverLoc]    = useState(null);
  const [speed,        setSpeed]        = useState(0);
  const [routeStops,   setRouteStops]   = useState([]);
  const [nextStop,     setNextStop]     = useState(null);
  const [activeTab,    setActiveTab]    = useState('info');
  const prevLocRef     = useRef(null);
  const prevTimeRef    = useRef(null);

  // Load buses and routes on mount
  useEffect(() => {
    (async () => {
      try {
        const [bRes, rRes] = await Promise.all([fetch(`${API_BASE}/buses`), fetch(`${API_BASE}/routes`)]);
        setAllBuses(await bRes.json());
        setAllRoutes(await rRes.json());
      } catch {}
    })();
  }, []);

  // When bus selected, load its schedules
  useEffect(() => {
    if (!selectedBus) return;
    fetch(`${API_BASE}/schedules/bus/${selectedBus.bus_id}`)
      .then(r => r.json()).then(setSchedules).catch(() => {});
  }, [selectedBus]);

  // When route selected, load its stops
  useEffect(() => {
    if (!selectedRoute) return;
    fetch(`${API_BASE}/routes/${selectedRoute.id}/stops`)
      .then(r => r.json()).then(setRouteStops).catch(() => {});
  }, [selectedRoute]);

  // Calculate speed from GPS coordinates
  const calcSpeed = (loc) => {
    if (prevLocRef.current && prevTimeRef.current) {
      const dt  = (Date.now() - prevTimeRef.current) / 1000; // seconds
      const R   = 6371000;
      const dLat = (loc.latitude  - prevLocRef.current.latitude)  * Math.PI / 180;
      const dLon = (loc.longitude - prevLocRef.current.longitude) * Math.PI / 180;
      const a   = Math.sin(dLat/2)**2 + Math.cos(prevLocRef.current.latitude * Math.PI/180) * Math.cos(loc.latitude * Math.PI/180) * Math.sin(dLon/2)**2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const kmh  = (dist / dt) * 3.6;
      setSpeed(Math.round(kmh > 120 ? 0 : kmh));
    }
    prevLocRef.current  = loc;
    prevTimeRef.current = Date.now();
  };

  // Find nearest upcoming stop
  const findNextStop = (loc) => {
    if (!routeStops.length) return;
    let nearest = null, minDist = Infinity;
    routeStops.forEach(stop => {
      const d = Math.sqrt((stop.latitude - loc.latitude)**2 + (stop.longitude - loc.longitude)**2);
      if (d < minDist) { minDist = d; nearest = stop; }
    });
    setNextStop(nearest);
  };

  // Start trip — begin GPS watch
  const startTrip = () => {
    if (!selectedBus || !selectedRoute) return;
    setTripActive(true);
    locationWatch.current = navigator.geolocation.watchPosition(
      pos => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setDriverLoc(loc);
        calcSpeed(loc);
        findNextStop(loc);
        // Update backend
        fetch(`${API_BASE}/update_position`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bus_id: selectedBus.bus_id, latitude: loc.latitude, longitude: loc.longitude, speed }),
        }).catch(() => {});
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  // End trip
  const endTrip = () => {
    setTripActive(false);
    if (locationWatch.current) navigator.geolocation.clearWatch(locationWatch.current);
    setDriverLoc(null); setSpeed(0); setNextStop(null);
  };

  // Init/update map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 12.92, lng: 79.13 }, zoom: 13,
        disableDefaultUI: false, zoomControl: true,
      });
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }
    const map = mapInstance.current;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    const bounds = new window.google.maps.LatLngBounds();

    // Draw road-accurate route
    if (routeStops.length > 1) {
      routeStops.forEach(s => bounds.extend({ lat: s.latitude, lng: s.longitude }));
      // Show straight line immediately, replace with road when loaded
      const straightPath = routeStops.map(s => ({ lat: s.latitude, lng: s.longitude }));
      if (polylineRef.current) polylineRef.current.setMap(null);
      polylineRef.current = new window.google.maps.Polyline({
        path: straightPath, strokeColor: '#15a8cd',
        strokeOpacity: 0.4, strokeWeight: 3, map,
      });
      fetchRoadRoute(selectedRoute?.id).then(roadPath => {
        if (!roadPath) return;
        if (polylineRef.current) polylineRef.current.setMap(null);
        polylineRef.current = new window.google.maps.Polyline({
          path: roadPath, strokeColor: '#15a8cd',
          strokeOpacity: 0.9, strokeWeight: 5, map,
        });
      });
      // Stop markers
      routeStops.forEach((stop, i) => {
        const pos  = { lat: stop.latitude, lng: stop.longitude };
        const icon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
              <circle cx="13" cy="13" r="12" fill="${nextStop?.id === stop.id ? '#f59e0b' : '#036ea7'}" stroke="white" stroke-width="2"/>
              <text x="13" y="18" font-size="10" font-weight="bold" text-anchor="middle" fill="white">${i + 1}</text>
            </svg>`
          )}`,
          scaledSize: new window.google.maps.Size(26, 26),
          anchor:     new window.google.maps.Point(13, 13),
        };
        const marker = new window.google.maps.Marker({ position: pos, map, icon, title: stop.name });
        marker.addListener('click', () => {
          infoWindowRef.current.setContent(`<div style="padding:8px"><strong>${stop.name}</strong></div>`);
          infoWindowRef.current.open(map, marker);
        });
        markersRef.current.push(marker);
      });
    }

    // Driver live location marker
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
        anchor:     new window.google.maps.Point(24, 24),
      };
      markersRef.current.push(new window.google.maps.Marker({ position: dPos, map, icon: dIcon, title: 'You', zIndex: 999 }));
      map.panTo(dPos);
    }

    if (!bounds.isEmpty()) map.fitBounds(bounds, { top: 60, right: 20, bottom: 20, left: 20 });
  }, [mapsLoaded, routeStops, driverLoc, nextStop]);

  const getNextDeparture = () => {
    if (!schedules.length) return null;
    const now    = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const next   = schedules.find(s => {
      const [h, m] = s.departure.split(':').map(Number);
      return h * 60 + m > nowMin;
    });
    return next?.departure || null;
  };

  return (
    <div className="app-container" style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      {/* Header */}
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

      {/* Bus + Route selector (shown before trip starts) */}
      {!tripActive && (
        <div className="driver-selector-card">
          <p className="driver-selector-title">Select Your Bus & Route</p>

          <div className="form-group" style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Bus</label>
            <select
              value={selectedBus?.bus_id || ''}
              onChange={e => {
                const bus = allBuses.find(b => b.bus_id === e.target.value);
                setSelectedBus(bus || null);
              }}
              style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1.5px solid #e5e5e5', fontSize:14, color:'#1a1a2e', background:'#f9f9f9' }}
            >
              <option value="">-- Choose Bus --</option>
              {allBuses.map(b => (
                <option key={b.bus_id} value={b.bus_id}>{b.bus_name} ({b.bus_number})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Route</label>
            <select
              value={selectedRoute?.id || ''}
              onChange={e => {
                const route = allRoutes.find(r => r.id === parseInt(e.target.value));
                setSelectedRoute(route || null);
              }}
              style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1.5px solid #e5e5e5', fontSize:14, color:'#1a1a2e', background:'#f9f9f9' }}
            >
              <option value="">-- Choose Route --</option>
              {allRoutes.map(r => (
                <option key={r.id} value={r.id}>{r.route_name}</option>
              ))}
            </select>
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

      {/* Live trip info bar (shown when trip active) */}
      {tripActive && (
        <div className="driver-trip-bar">
          <div className="driver-trip-info">
            <div className="driver-trip-bus">
              <span className="driver-bus-badge">🚌 {selectedBus?.bus_number}</span>
              <span className="driver-route-name">{selectedRoute?.route_name}</span>
            </div>
            <div className="driver-trip-stats">
              <div className="driver-stat">
                <span className="driver-stat-label">Speed</span>
                <span className="driver-stat-value">{speed} km/h</span>
              </div>
              <div className="driver-stat">
                <span className="driver-stat-label">Next Stop</span>
                <span className="driver-stat-value">{nextStop?.name || '—'}</span>
              </div>
              <div className="driver-stat">
                <span className="driver-stat-label">Next Dep</span>
                <span className="driver-stat-value">{getNextDeparture() || '—'}</span>
              </div>
            </div>
          </div>
          <button className="driver-end-btn" onClick={endTrip}>⏹ End Trip</button>
        </div>
      )}

      {/* Map */}
      <div style={{ flex: 1, minHeight: 300, position: 'relative' }}>
        <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
        {!mapsLoaded && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#e5e3df' }}>
            <div className="spinner" />
          </div>
        )}
        {!driverLoc && tripActive && (
          <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.6)', color:'white', padding:'6px 14px', borderRadius:20, fontSize:13 }}>
            📡 Getting your location…
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tracking-tabs">
        <button className={`tracking-tab ${activeTab === 'info' ? 'active' : ''}`}     onClick={() => setActiveTab('info')}>Info</button>
        <button className={`tracking-tab ${activeTab === 'stops' ? 'active' : ''}`}    onClick={() => setActiveTab('stops')}>Stops</button>
        <button className={`tracking-tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
      </div>

      {/* Info Tab */}
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
              <div className="driver-info-row"><span className="driver-info-label">Status</span>
                <span style={{ color: tripActive ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                  {tripActive ? '🟢 On Trip' : '🟡 Idle'}
                </span>
              </div>
            </div>
          ) : (
            <p style={{ textAlign:'center', color:'#888', padding:20 }}>Select a bus to see details</p>
          )}
        </div>
      )}

      {/* Stops Tab */}
      {activeTab === 'stops' && (
        <div className="eta-panel">
          {routeStops.length > 0 ? routeStops.map((stop, i) => (
            <div key={stop.id} className={`eta-row ${nextStop?.id === stop.id ? 'arrived' : ''}`}>
              <div className="eta-stop-info">
                <span className="eta-stop-num" style={{ background: nextStop?.id === stop.id ? '#f59e0b' : undefined }}>{i + 1}</span>
                <span className="eta-stop-name">{stop.name}</span>
              </div>
              {nextStop?.id === stop.id && (
                <span className="eta-time-badge green">Next</span>
              )}
            </div>
          )) : (
            <p style={{ textAlign:'center', color:'#888', padding:20 }}>Select a route to see stops</p>
          )}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="eta-panel">
          {schedules.length > 0 ? (
            <>
              <p style={{ fontSize:13, color:'#888', marginBottom:12 }}>Departures from <strong>{selectedRoute?.start_point}</strong></p>
              <div className="schedule-grid">
                {schedules.map((s, i) => {
                  const now    = new Date();
                  const nowMin = now.getHours() * 60 + now.getMinutes();
                  const [h, m] = s.departure.split(':').map(Number);
                  const isPast = h * 60 + m < nowMin;
                  const isNext = getNextDeparture() === s.departure;
                  const timeLabel = s.arrival && s.arrival !== s.departure
                    ? `${s.arrival} → ${s.departure}`
                    : s.departure;
                  return (
                    <div key={i} className={`schedule-chip ${isPast ? 'past' : ''} ${isNext ? 'next' : ''}`}>
                      {timeLabel}
                      {isNext && <span className="next-label">Next</span>}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p style={{ textAlign:'center', color:'#888', padding:20 }}>Select a bus to see schedule</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── NEARBY BUSES ─────────────────────────────────────────────────────────────
function NearbyBusesScreen({ onBack, onBusSelect }) {
  const [nearbyBuses, setNearbyBuses] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

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
              <div key={i} className="nearby-bus-card" onClick={() => onBusSelect(bus.bus_id)}>
                <div className="nearby-bus-header">
                  <span className="nearby-bus-name">{bus.bus_name}</span>
                  <span className="nearby-distance">{bus.distance} km away</span>
                </div>
                <div className="nearby-route">{bus.bus_number} • {bus.route_name}</div>
                {bus.current_stop_name && (
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Currently at: {bus.current_stop_name}</div>
                )}
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
  const [showSplash,      setShowSplash]      = useState(true);
  const [isLoggedIn,      setIsLoggedIn]      = useState(false);
  const [showRegister,    setShowRegister]    = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [userLocation,    setUserLocation]    = useState(null);
  const [cityName,        setCityName]        = useState('');
  const [user,            setUser]            = useState(null);
  const [screen,          setScreen]          = useState('home');
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedBusId,   setSelectedBusId]   = useState(null);
  const [routes,          setRoutes]          = useState([]);
  const [buses,           setBuses]           = useState([]);
  const [showProfile,     setShowProfile]     = useState(false);
  const [theme,           setTheme]           = useState('light');
  const [recentSearches,  setRecentSearches]  = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [rRes, bRes] = await Promise.all([fetch(`${API_BASE}/routes`), fetch(`${API_BASE}/buses`)]);
        setRoutes(await rRes.json());
        setBuses(await bRes.json());
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLocation.latitude}&lon=${userLocation.longitude}&format=json`)
      .then(r => r.json())
      .then(d => {
        const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || '';
        setCityName(city);
      }).catch(() => {});
  }, [userLocation]);

  useEffect(() => { document.body.setAttribute('data-theme', theme); }, [theme]);

  const handleLogout = () => {
    setIsLoggedIn(false); setUser(null);
    setShowProfile(false); setScreen('home'); setRecentSearches([]);
  };

  const handleSaveSearch = (query) => {
    setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 10));
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (showRegister) return (
    <RegisterScreen
      onLoginClick={() => setShowRegister(false)}
      onRegister={(userData) => { setUser(userData); setIsLoggedIn(true); setShowRegister(false); }}
    />
  );
  if (!isLoggedIn) return (
    <LoginScreen
      onLogin={(userData) => { setUser(userData); setIsLoggedIn(true); }}
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

  // ── Driver sees their own dashboard ──
  if (user?.role === 'driver') {
    return (
      <>
        <DriverDashboard
          user={user}
          onBack={goHome}
          onProfileClick={() => setShowProfile(true)}
        />
        {drawer}
      </>
    );
  }

  // ── Passenger screens ──
  switch (screen) {
    case 'routeDetail':
      return <><RouteDetailScreen routeId={selectedRouteId} onBack={goHome} onBusSelect={id => { setSelectedBusId(id); setScreen('tracking'); }} />{drawer}</>;
    case 'tracking':
      return <><BusTrackingScreen busId={selectedBusId} onBack={goHome} userLocation={userLocation} />{drawer}</>;
    case 'nearby':
      return <><NearbyBusesScreen onBack={goHome} onBusSelect={id => { setSelectedBusId(id); setScreen('tracking'); }} />{drawer}</>;
    default:
      return (
        <>
          <HomeScreen
            routes={routes} buses={buses} user={user} cityName={cityName}
            onRouteSelect={id => { setSelectedRouteId(id); setScreen('routeDetail'); }}
            onBusSelect={id  => { setSelectedBusId(id);   setScreen('tracking'); }}
            onNearMe={() => setScreen('nearby')}
            onProfileClick={() => setShowProfile(true)}
            onSaveSearch={handleSaveSearch}
          />
          {drawer}
        </>
      );
  }
}

export default App;