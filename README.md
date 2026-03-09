# NavBus - Real-Time Bus Tracking Application

A modern, clean, and user-friendly mobile application for tracking local buses in Vellore. This app works similar to "Where is My Train" but is specifically designed for tracking local buses.

## Features

- **Live Bus Tracking**: Track real-time bus locations on a map
- **ETA Calculation**: View accurate Estimated Time of Arrival for each stop
- **Route Information**: Check bus routes and stops
- **Nearby Buses**: Find buses near your location
- **Search**: Search by route name, bus number, or stop name

## Technology Stack

- **Backend**: Flask (Python REST API + WebSocket for real-time updates)
- **Frontend**: React.js
- **Database**: SQLite
- **Maps**: Google Maps API

## Project Structure

```
NavBus/
├── app.py                 # Flask backend with API endpoints
├── database_init.py       # Database initialization script
├── requirements.txt       # Python dependencies
├── README.md             # This file
└── frontend/             # React frontend
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        └── App.js
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google Maps API Key

### Backend Setup

1. Navigate to the project directory:
```bash
cd NavBus
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will start at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update Google Maps API Key:
   - Open `frontend/src/App.js`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API key

4. Start the React development server:
```bash
npm start
```

The frontend will start at `http://localhost:3000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/routes` | GET | Get all routes |
| `/api/routes/<id>` | GET | Get specific route |
| `/api/routes/<id>/stops` | GET | Get stops for a route |
| `/api/buses` | GET | Get all buses |
| `/api/buses/<bus_id>` | GET | Get specific bus |
| `/api/buses/route/<route_id>` | GET | Get buses by route |
| `/api/search?q=<query>` | GET | Search routes, buses, stops |
| `/api/nearby?lat=<lat>&lon=<lon>` | GET | Get nearby buses |
| `/api/track/<bus_id>` | GET | Track specific bus with ETA |
| `/api/eta/<stop_id>` | GET | Get ETA for a stop |

## Bus Routes (Vellore)

### Route 1: Bagayam - Katpadi (Via Old Bus Stand)
- 23 stops
- Operates: 5:30 AM - 9:30 PM
- Interval: 15 minutes

### Route 2: Bagayam - Katpadi (Via Eye Hospital)
- 20 stops
- Operates: 5:30 AM - 9:30 PM
- Interval: 15 minutes

### Route 3: Katpadi - Bagayam (Via Toll Gate)
- 17 stops
- Operates: 5:30 AM - 9:30 PM
- Interval: 15 minutes

### Route 4: Katpadi - Bagayam (Via DKM College)
- 18 stops
- Operates: 5:30 AM - 9:30 PM
- Interval: 15 minutes

## Available Buses

| Bus ID | Bus Name | Bus Number | Route |
|--------|----------|------------|-------|
| TN23 2034 | VVD | 1 | 1, 3 |
| TN23 1098 | VVD | 2 | 1, 2 |
| TN16 1098 | VVD | 2 | 4 |
| TN23 2345 | Govt Bus | GB1 | 1 |
| TN23 2345 | Govt Bus | GB2 | 3 |

## Design

The app features:
- **Splash Screen**: Centered app logo with "NavBus" name on a clean blue-teal gradient background
- **Home Screen**: App name at top left, profile icon at top right, search bar with placeholder text
- **Find Buses Near Me**: Button to locate nearby buses using device GPS

## Notes

- For production use, replace SQLite with a more robust database (PostgreSQL, MySQL)
- Add proper authentication and authorization
- Implement driver GPS data collection
- Add push notifications for bus arrivals
- Consider offline caching for better user experience
