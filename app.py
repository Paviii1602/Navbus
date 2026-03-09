from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import sqlite3
import math

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ─── DB HELPER ───────────────────────────────────────────────────────────────

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# ─── DISTANCE & ETA ──────────────────────────────────────────────────────────

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def calculate_eta(distance_km, speed_kmh=25):
    speed_kmh = speed_kmh if speed_kmh > 0 else 25
    return max(1, round(distance_km / speed_kmh * 60))

# ─── AUTH ────────────────────────────────────────────────────────────────────

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    role     = data.get('role')

    if not username or not password or not role:
        return jsonify({'error': 'Missing fields'}), 400

    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            (username, password, role)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Username already exists'}), 400
    conn.close()
    return jsonify({'message': 'User registered successfully'})


@app.route('/api/login', methods=['POST'])
def login():
    data     = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, password)
    ).fetchone()
    conn.close()

    if user:
        return jsonify({'message': 'Login successful',
                        'username': user['username'],
                        'role':     user['role']})
    return jsonify({'error': 'Invalid credentials'}), 401

# ─── ROUTES ──────────────────────────────────────────────────────────────────

@app.route('/api/routes', methods=['GET'])
def get_routes():
    conn   = get_db_connection()
    routes = conn.execute('SELECT * FROM routes').fetchall()
    conn.close()
    return jsonify([dict(r) for r in routes])


@app.route('/api/routes/<int:route_id>', methods=['GET'])
def get_route(route_id):
    conn  = get_db_connection()
    route = conn.execute('SELECT * FROM routes WHERE id = ?', (route_id,)).fetchone()
    conn.close()
    if route is None:
        return jsonify({'error': 'Route not found'}), 404
    return jsonify(dict(route))


@app.route('/api/routes/<int:route_id>/stops', methods=['GET'])
def get_route_stops(route_id):
    conn  = get_db_connection()
    stops = conn.execute(
        'SELECT * FROM stops WHERE route_id = ? ORDER BY stop_order',
        (route_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(s) for s in stops])

# ─── ROAD PATH (Google Directions API — server side to avoid CORS) ──────────

GOOGLE_MAPS_API_KEY = 'AIzaSyDEvQLodWBd5hrO4g5YdCsL78s5-GjU40I'

# Cache road paths in memory so we only call Directions API once per route
_road_path_cache = {}

@app.route('/api/routes/<int:route_id>/road_path', methods=['GET'])
def get_road_path(route_id):
    import urllib.request, json as _json, urllib.parse

    # Return cached result if available
    if route_id in _road_path_cache:
        return jsonify({'path': _road_path_cache[route_id]})

    conn  = get_db_connection()
    stops = conn.execute(
        'SELECT * FROM stops WHERE route_id = ? ORDER BY stop_order',
        (route_id,)
    ).fetchall()
    conn.close()
    stops = [dict(s) for s in stops]

    if len(stops) < 2:
        return jsonify({'path': []})

    def decode_polyline(encoded):
        points = []
        index = 0
        lat = lng = 0
        while index < len(encoded):
            for is_lng in (False, True):
                result = shift = 0
                while True:
                    b = ord(encoded[index]) - 63
                    index += 1
                    result |= (b & 0x1F) << shift
                    shift += 5
                    if b < 0x20:
                        break
                val = ~(result >> 1) if result & 1 else result >> 1
                if is_lng:
                    lng += val
                    points.append({'lat': round(lat / 1e5, 6), 'lng': round(lng / 1e5, 6)})
                else:
                    lat += val
        return points

    def fetch_segment(seg_stops):
        """Fetch road path for a segment of max 10 stops (8 waypoints + origin + dest)."""
        origin      = f"{seg_stops[0]['latitude']},{seg_stops[0]['longitude']}"
        destination = f"{seg_stops[-1]['latitude']},{seg_stops[-1]['longitude']}"
        mid = seg_stops[1:-1]
        waypoints = '|'.join(f"{s['latitude']},{s['longitude']}" for s in mid) if mid else ''
        url = (
            f"https://maps.googleapis.com/maps/api/directions/json"
            f"?origin={urllib.parse.quote(origin)}"
            f"&destination={urllib.parse.quote(destination)}"
            f"&mode=driving"
            f"&key={GOOGLE_MAPS_API_KEY}"
        )
        if waypoints:
            url += f"&waypoints={urllib.parse.quote(waypoints)}"
        try:
            with urllib.request.urlopen(url, timeout=10) as resp:
                data = _json.loads(resp.read())
            if data.get('status') == 'OK':
                pts = []
                for leg in data['routes'][0]['legs']:
                    for step in leg['steps']:
                        pts.extend(decode_polyline(step['polyline']['points']))
                return pts
        except:
            pass
        # fallback straight line for this segment
        return [{'lat': s['latitude'], 'lng': s['longitude']} for s in seg_stops]

    # Split stops into chunks of 10 (8 waypoints max per request)
    # Each chunk overlaps by 1 stop so segments connect seamlessly
    CHUNK = 10
    full_path = []
    i = 0
    while i < len(stops):
        chunk = stops[i:i + CHUNK]
        seg   = fetch_segment(chunk)
        if full_path and seg:
            seg = seg[1:]   # remove duplicate junction point
        full_path.extend(seg)
        i += CHUNK - 1      # overlap by 1

    _road_path_cache[route_id] = full_path
    return jsonify({'path': full_path})

# ─── BUSES ───────────────────────────────────────────────────────────────────

@app.route('/api/buses', methods=['GET'])
def get_buses():
    conn  = get_db_connection()
    buses = conn.execute('''
        SELECT b.*, r.route_name, r.start_point, r.end_point
        FROM buses b
        JOIN routes r ON b.route_id = r.id
    ''').fetchall()
    conn.close()
    return jsonify([dict(b) for b in buses])


@app.route('/api/buses/<bus_id>', methods=['GET'])
def get_bus(bus_id):
    conn = get_db_connection()
    bus  = conn.execute('''
        SELECT b.*, r.route_name, r.start_point, r.end_point
        FROM buses b
        JOIN routes r ON b.route_id = r.id
        WHERE b.bus_id = ?
    ''', (bus_id,)).fetchone()
    conn.close()
    if bus is None:
        return jsonify({'error': 'Bus not found'}), 404
    return jsonify(dict(bus))


@app.route('/api/buses/route/<int:route_id>', methods=['GET'])
def get_buses_by_route(route_id):
    conn  = get_db_connection()
    buses = conn.execute('''
        SELECT b.*, r.route_name, r.start_point, r.end_point
        FROM buses b
        JOIN routes r ON b.route_id = r.id
        WHERE b.route_id = ?
    ''', (route_id,)).fetchall()
    conn.close()
    return jsonify([dict(b) for b in buses])

# ─── SCHEDULES ───────────────────────────────────────────────────────────────

@app.route('/api/schedules', methods=['GET'])
def get_all_schedules():
    """Return all departures grouped by operator and route."""
    conn = get_db_connection()
    rows = conn.execute('''
        SELECT bs.bus_id, bs.route_id, bs.arrival, bs.departure,
               b.bus_name, b.bus_number,
               r.route_name, r.start_point, r.end_point
        FROM bus_schedules bs
        JOIN buses  b ON bs.bus_id   = b.bus_id
        JOIN routes r ON bs.route_id = r.id
        ORDER BY bs.bus_id, bs.departure
    ''').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/schedules/route/<int:route_id>', methods=['GET'])
def get_schedules_by_route(route_id):
    """All departures for a specific route, sorted by time."""
    conn = get_db_connection()
    rows = conn.execute('''
        SELECT bs.bus_id, bs.arrival, bs.departure,
               b.bus_name, b.bus_number
        FROM bus_schedules bs
        JOIN buses b ON bs.bus_id = b.bus_id
        WHERE bs.route_id = ?
        ORDER BY bs.departure
    ''', (route_id,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/schedules/bus/<bus_id>', methods=['GET'])
def get_schedules_by_bus(bus_id):
    """All departures for one bus_id."""
    conn = get_db_connection()
    rows = conn.execute('''
        SELECT bs.arrival, bs.departure, bs.route_id, r.route_name
        FROM bus_schedules bs
        JOIN routes r ON bs.route_id = r.id
        WHERE bs.bus_id = ?
        ORDER BY bs.departure
    ''', (bus_id,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ─── SEARCH ──────────────────────────────────────────────────────────────────

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify({'routes': [], 'buses': [], 'stops': []})

    conn = get_db_connection()

    routes = conn.execute('''
        SELECT * FROM routes
        WHERE LOWER(route_name) LIKE ? OR LOWER(start_point) LIKE ? OR LOWER(end_point) LIKE ?
    ''', (f'%{query}%',) * 3).fetchall()

    buses = conn.execute('''
        SELECT b.*, r.route_name
        FROM buses b
        JOIN routes r ON b.route_id = r.id
        WHERE LOWER(b.bus_id) LIKE ? OR LOWER(b.bus_name) LIKE ? OR LOWER(b.bus_number) LIKE ?
    ''', (f'%{query}%',) * 3).fetchall()

    # Return each stop with its own route_id and coordinates (no grouping)
    # Frontend filters by route when needed
    stops = conn.execute('''
        SELECT id, name, latitude, longitude, route_id, stop_order
        FROM stops WHERE LOWER(name) LIKE ?
        ORDER BY route_id, stop_order
    ''', (f'%{query}%',)).fetchall()

    conn.close()
    return jsonify({
        'routes': [dict(r) for r in routes],
        'buses':  [dict(b) for b in buses],
        'stops':  [dict(s) for s in stops],
    })

# ─── STOPS ───────────────────────────────────────────────────────────────────

@app.route('/api/stops', methods=['GET'])
def get_all_stops():
    conn  = get_db_connection()
    stops = conn.execute('SELECT * FROM stops').fetchall()
    conn.close()
    return jsonify([dict(s) for s in stops])


@app.route('/api/stops/<int:stop_id>', methods=['GET'])
def get_stop(stop_id):
    conn = get_db_connection()
    stop = conn.execute('SELECT * FROM stops WHERE id = ?', (stop_id,)).fetchone()
    conn.close()
    if stop is None:
        return jsonify({'error': 'Stop not found'}), 404
    return jsonify(dict(stop))

# ─── NEARBY ──────────────────────────────────────────────────────────────────

@app.route('/api/nearby', methods=['GET'])
def get_nearby_buses():
    lat    = request.args.get('lat',    type=float)
    lon    = request.args.get('lon',    type=float)
    radius = request.args.get('radius', 2.0, type=float)

    if lat is None or lon is None:
        return jsonify({'error': 'Latitude and longitude required'}), 400

    conn  = get_db_connection()
    buses = conn.execute('''
        SELECT b.*, r.route_name, r.start_point, r.end_point,
               bp.latitude, bp.longitude, bp.speed, bp.timestamp
        FROM buses b
        JOIN routes r ON b.route_id = r.id
        LEFT JOIN bus_positions bp ON b.bus_id = bp.bus_id
        WHERE bp.timestamp IS NOT NULL
    ''').fetchall()

    nearby = []
    for bus in buses:
        if bus['latitude'] and bus['longitude']:
            dist = calculate_distance(lat, lon, bus['latitude'], bus['longitude'])
            if dist <= radius:
                row = dict(bus)
                row['distance'] = round(dist, 2)
                nearby.append(row)

    conn.close()
    return jsonify(nearby)

# ─── TRACKING ────────────────────────────────────────────────────────────────

@app.route('/api/track/<bus_id>', methods=['GET'])
def track_bus(bus_id):
    conn = get_db_connection()

    bus = conn.execute('''
        SELECT b.*, r.route_name, r.start_point, r.end_point
        FROM buses b
        JOIN routes r ON b.route_id = r.id
        WHERE b.bus_id = ?
    ''', (bus_id,)).fetchone()

    if bus is None:
        conn.close()
        return jsonify({'error': 'Bus not found'}), 404

    position = conn.execute('''
        SELECT * FROM bus_positions
        WHERE bus_id = ?
        ORDER BY timestamp DESC LIMIT 1
    ''', (bus_id,)).fetchone()

    # GROUP BY name so shared stops appear only once
    stops = conn.execute('''
        SELECT * FROM stops
        WHERE route_id = ?
        ORDER BY stop_order
    ''', (bus['route_id'],)).fetchall()

    # Fetch today's schedule for this bus
    schedules = conn.execute('''
        SELECT departure FROM bus_schedules
        WHERE bus_id = ?
        ORDER BY departure
    ''', (bus_id,)).fetchall()

    conn.close()

    bus_dict             = dict(bus)
    bus_dict['position'] = dict(position) if position else None
    bus_dict['stops']    = [dict(s) for s in stops]
    bus_dict['schedule'] = [s['departure'] for s in schedules]

    if position:
        lat   = position['latitude']
        lon   = position['longitude']
        speed = position['speed'] if position['speed'] > 0 else 25

        bus_dict['eta'] = [
            {
                'stop_id':     stop['id'],
                'stop_name':   stop['name'],
                'eta_minutes': calculate_eta(
                    calculate_distance(lat, lon, stop['latitude'], stop['longitude']),
                    speed
                ),
                'distance_km': round(
                    calculate_distance(lat, lon, stop['latitude'], stop['longitude']), 2
                ),
            }
            for stop in stops
        ]

    return jsonify(bus_dict)

# ─── ETA FOR STOP ─────────────────────────────────────────────────────────────

@app.route('/api/eta/<int:stop_id>', methods=['GET'])
def get_eta_for_stop(stop_id):
    conn = get_db_connection()
    stop = conn.execute('SELECT * FROM stops WHERE id = ?', (stop_id,)).fetchone()
    if stop is None:
        conn.close()
        return jsonify({'error': 'Stop not found'}), 404

    buses = conn.execute('''
        SELECT b.*, bp.latitude, bp.longitude, bp.speed
        FROM buses b
        LEFT JOIN bus_positions bp ON b.bus_id = bp.bus_id
        WHERE b.route_id = ?
    ''', (stop['route_id'],)).fetchall()

    eta_list = []
    for bus in buses:
        if bus['latitude'] and bus['longitude']:
            dist  = calculate_distance(bus['latitude'], bus['longitude'],
                                       stop['latitude'], stop['longitude'])
            speed = bus['speed'] if bus['speed'] and bus['speed'] > 0 else 25
            eta_list.append({
                'bus_id':      bus['bus_id'],
                'bus_name':    bus['bus_name'],
                'bus_number':  bus['bus_number'],
                'eta_minutes': calculate_eta(dist, speed),
                'distance_km': round(dist, 2),
            })

    eta_list.sort(key=lambda x: x['eta_minutes'])
    conn.close()
    return jsonify({'stop': dict(stop), 'buses': eta_list})

# ─── WEBSOCKET ────────────────────────────────────────────────────────────────

def simulate_bus_movement():
    while True:
        socketio.sleep(10)
        conn      = get_db_connection()
        positions = conn.execute('SELECT * FROM bus_positions').fetchall()

        for pos in positions:
            bus = conn.execute(
                'SELECT route_id FROM buses WHERE bus_id = ?', (pos['bus_id'],)
            ).fetchone()
            if bus:
                stops = conn.execute(
                    'SELECT * FROM stops WHERE route_id = ? ORDER BY stop_order',
                    (bus['route_id'],)
                ).fetchall()
                current_order = pos['current_stop_id'] if pos['current_stop_id'] else 1
                next_order    = min(current_order + 1, len(stops))
                if next_order < len(stops):
                    nxt     = stops[next_order]
                    new_lat = pos['latitude']  + (nxt['latitude']  - pos['latitude'])  * 0.15
                    new_lon = pos['longitude'] + (nxt['longitude'] - pos['longitude']) * 0.15
                    conn.execute('''
                        UPDATE bus_positions
                        SET latitude = ?, longitude = ?, current_stop_id = ?,
                            speed = ?, timestamp = CURRENT_TIMESTAMP
                        WHERE bus_id = ?
                    ''', (new_lat, new_lon, nxt['id'], 20.0, pos['bus_id']))

        conn.commit()
        conn.close()
        socketio.emit('bus_update', {'message': 'Bus positions updated'})


@socketio.on('connect')
def handle_connect():
    emit('connected', {'data': 'Connected to NavBus server'})


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('track_bus')
def handle_track_bus(data):
    bus_id = data.get('bus_id')
    if bus_id:
        conn     = get_db_connection()
        position = conn.execute('''
            SELECT bp.*, b.bus_name, b.bus_number, r.route_name
            FROM bus_positions bp
            JOIN buses  b ON bp.bus_id   = b.bus_id
            JOIN routes r ON b.route_id  = r.id
            WHERE bp.bus_id = ?
            ORDER BY bp.timestamp DESC LIMIT 1
        ''', (bus_id,)).fetchone()
        conn.close()
        if position:
            emit('bus_position', dict(position))


# ─── MAIN ────────────────────────────────────────────────────────────────────


# ─── PUSH NOTIFICATION SUBSCRIPTION ─────────────────────────────────────────
# Store subscriptions in memory (use DB in production)
push_subscriptions = {}

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.json
    user_id = data.get('user_id', 'anonymous')
    subscription = data.get('subscription')
    stop_name    = data.get('stop_name')
    bus_id       = data.get('bus_id')
    if not subscription:
        return jsonify({'error': 'No subscription'}), 400
    push_subscriptions[user_id] = {
        'subscription': subscription,
        'stop_name':    stop_name,
        'bus_id':       bus_id,
    }
    return jsonify({'status': 'subscribed'})

@app.route('/api/unsubscribe', methods=['POST'])
def unsubscribe():
    data    = request.json
    user_id = data.get('user_id', 'anonymous')
    push_subscriptions.pop(user_id, None)
    return jsonify({'status': 'unsubscribed'})

@app.route('/api/check_nearby_notification', methods=['POST'])
def check_nearby_notification():
    """
    Called by client periodically. Returns True if bus is within
    ~500m of the user's chosen stop so the frontend can fire a notification.
    """
    data      = request.json
    bus_id    = data.get('bus_id')
    stop_name = data.get('stop_name')
    if not bus_id or not stop_name:
        return jsonify({'notify': False})

    conn = get_db_connection()
    pos  = conn.execute(
        'SELECT latitude, longitude FROM bus_positions WHERE bus_id = ? ORDER BY timestamp DESC LIMIT 1',
        (bus_id,)
    ).fetchone()
    stop = conn.execute(
        'SELECT latitude, longitude FROM stops WHERE name = ? LIMIT 1',
        (stop_name,)
    ).fetchone()
    conn.close()

    if not pos or not stop:
        return jsonify({'notify': False})

    dist = calculate_distance(pos['latitude'], pos['longitude'],
                              stop['latitude'], stop['longitude'])
    # Notify if within 0.5 km
    return jsonify({'notify': dist <= 0.5, 'distance_km': round(dist, 2)})

if __name__ == '__main__':
    print("Initialising database …")
    exec(open('database_init.py').read())
    print("Starting bus simulation …")
    socketio.start_background_task(target=simulate_bus_movement)
    print("NavBus server → http://0.0.0.0:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True,
                 allow_unsafe_werkzeug=True)