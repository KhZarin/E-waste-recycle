import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './RecyclingPoints.css';

// Approximate area coordinates (Dhaka er kachhakachhi)
const AREAS = [
  { name: 'Savar', lat: 23.8583, lng: 90.2667 },
  { name: 'Ashulia', lat: 23.9, lng: 90.29 },
  { name: 'Hemayetpur', lat: 23.782, lng: 90.259 },
  { name: 'Uttara', lat: 23.8759, lng: 90.3795 },
  { name: 'Mirpur', lat: 23.8069, lng: 90.3687 },
  { name: 'Mohammadpur', lat: 23.7662, lng: 90.3589 },
  { name: 'Dhanmondi', lat: 23.7461, lng: 90.3742 },
  { name: 'Gulshan', lat: 23.7925, lng: 90.4078 },
  { name: 'Motijheel', lat: 23.733, lng: 90.4172 },
  { name: 'Tongi', lat: 23.89, lng: 90.403 },
];

const TYPES = [
  'smartphone',
  'laptop',
  'tablet',
  'television',
  'desktop',
  'monitor',
  'battery',
  'charger',
  'other',
];

const RADIUS_OPTIONS = [5, 10, 25, 50];

const statusClass = (status) => {
  if (status === 'open') return 'open';
  if (status === 'closed') return 'closed';
  return 'temp';
};

function RecyclingPoints() {
  const [locationKey, setLocationKey] = useState('Savar');
  const [myLocation, setMyLocation] = useState(null);
  const [maxKm, setMaxKm] = useState(25);
  const [type, setType] = useState('');
  const [result, setResult] = useState(null);
  const [searchedFrom, setSearchedFrom] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const getSelectedLocation = () => {
    if (locationKey === 'current') {
      return myLocation
        ? { name: 'your current location', ...myLocation }
        : null;
    }
    return AREAS.find((area) => area.name === locationKey);
  };

  const handleUseMyLocation = () => {
    setError('');

    if (!navigator.geolocation) {
      setError('Your browser does not support location access');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationKey('current');
        setLocating(false);
      },
      () => {
        setError(
          'Could not get your location. Allow location access in the browser or choose an area.'
        );
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const location = getSelectedLocation();
    if (!location) {
      setError('Please choose a location');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/recycling-points/nearby', {
        params: {
          lat: location.lat,
          lng: location.lng,
          maxKm,
          type: type || undefined,
        },
      });
      setResult(data);
      setSearchedFrom(location.name);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="points-container">
      <h2>Find Recycling Points</h2>
      <p className="points-hint">
        Choose your location to see the nearest recycling points, sorted by
        distance.
      </p>

      <form className="points-form" onSubmit={handleSubmit}>
        <label className="points-field grow">
          Your location
          <select
            value={locationKey}
            onChange={(e) => setLocationKey(e.target.value)}
          >
            {myLocation && <option value="current">My current location</option>}
            {AREAS.map((area) => (
              <option key={area.name} value={area.name}>
                {area.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="secondary"
          onClick={handleUseMyLocation}
          disabled={locating}
        >
          {locating ? 'Locating...' : 'Use my current location'}
        </button>

        <label className="points-field">
          Within
          <select
            value={maxKm}
            onChange={(e) => setMaxKm(Number(e.target.value))}
          >
            {RADIUS_OPTIONS.map((km) => (
              <option key={km} value={km}>
                {km} km
              </option>
            ))}
          </select>
        </label>

        <label className="points-field">
          E-waste type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Any type</option>
            {TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Find Points'}
        </button>
      </form>

      {error && <div className="points-error">{error}</div>}

      {result && result.count === 0 && (
        <div className="points-empty">
          No recycling points found within {result.maxKm} km of {searchedFrom}.
          Try a larger distance or a different type.
        </div>
      )}

      {result && result.count > 0 && (
        <>
          <p className="points-summary">
            {result.count} recycling point{result.count > 1 ? 's' : ''} found
            near {searchedFrom} (nearest first)
          </p>

          {result.points.map((point) => (
            <div className="point-card" key={point._id}>
              <div className="point-info">
                <h3>{point.name}</h3>
                <p className="point-address">{point.address}</p>
                <span className={`status-badge ${statusClass(point.status)}`}>
                  {point.status}
                </span>
                <div style={{ marginTop: 8 }}>
                  <Link
                    to={`/recycling-points/${point._id}`}
                    style={{
                      color: '#1b5e20',
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}
                  >
                    View details
                  </Link>
                </div>
              </div>

              <div className="point-distance">
                <div className="distance-number">{point.distanceKm}</div>
                <div className="distance-label">km away</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default RecyclingPoints;