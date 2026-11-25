import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import './PointDetails.css';

const statusClass = (status) => {
  if (status === 'open') return 'open';
  if (status === 'closed') return 'closed';
  return 'temp';
};

function PointDetails() {
  const { id } = useParams();
  const [point, setPoint] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/recycling-points/${id}`)
      .then((res) => setPoint(res.data))
      .catch((err) =>
        setError(
          err.response?.data?.message || 'Could not load recycling point'
        )
      );
  }, [id]);

  return (
    <div className="details-container">
      <Link to="/recycling-points" className="details-back">
        &larr; Back to Recycling Points
      </Link>

      {error && <div className="details-error">{error}</div>}

      {point && (
        <div className="details-card">
          <h2>{point.name}</h2>

          <div className="details-row">
            <span className="details-label">Address</span>
            <span>{point.address}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Accepted E-Waste</span>
            <span className="details-types">
              {point.acceptedTypes.length > 0 ? (
                point.acceptedTypes.map((item) => (
                  <span className="type-chip" key={item}>
                    {item}
                  </span>
                ))
              ) : (
                <span>Not specified</span>
              )}
            </span>
          </div>

          <div className="details-row">
            <span className="details-label">Opening Hours</span>
            <span>{point.openingHours || 'Not specified'}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Current Status</span>
            <span className={`detail-status ${statusClass(point.status)}`}>
              {point.status}
            </span>
          </div>

          <a
            className="details-map-link"
            href={`https://www.google.com/maps?q=${point.coordinates.lat},${point.coordinates.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

export default PointDetails;