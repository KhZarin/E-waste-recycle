import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import './Submission.css';

function MySubmissions() {
  const location = useLocation();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const successMessage = location.state?.message;

  useEffect(() => {
    api
      .get('/submissions/mine')
      .then((res) => setSubmissions(res.data.submissions))
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load submissions')
      )
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.patch(`/submissions/${id}/cancel`);
      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: data.status } : item
        )
      );
      setCancelingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel submission');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sub-container">
      <h2>My Submissions</h2>
      <p className="sub-hint">
        Track the e-waste you have submitted for recycling.{' '}
        <Link to="/submit">Submit new e-waste</Link>
      </p>

      {successMessage && <div className="sub-success">{successMessage}</div>}
      {error && <div className="sub-error">{error}</div>}

      {loading && <p>Loading...</p>}

      {!loading && submissions.length === 0 && (
        <div className="sub-empty">
          You have not submitted any e-waste yet.
        </div>
      )}

      {submissions.map((item) => (
        <div className="sub-card" key={item._id}>
          <div className="sub-card-top">
            <div>
              <h3>
                {item.quantity} x {item.deviceType}
                {item.deviceName ? ` (${item.deviceName})` : ''}
              </h3>
              <p className="sub-line">
                Recycling point: <strong>{item.recyclingPoint?.name}</strong>
                {item.recyclingPoint?.area ? `, ${item.recyclingPoint.area}` : ''}
              </p>
              <p className="sub-line">Total weight: {item.weightKg} kg</p>
              <p className="sub-line">
                Submitted: {new Date(item.createdAt).toLocaleString()}
              </p>
              {item.notes && <p className="sub-line">Notes: {item.notes}</p>}
              {item.status === 'confirmed' && (
                <p className="sub-line">
                  Green Credits earned: <strong>+{item.creditsAwarded}</strong>
                </p>
              )}
              {item.status === 'rejected' && item.rejectionReason && (
                <p className="sub-line">Reason: {item.rejectionReason}</p>
              )}
            </div>
            <span className={`sub-status ${item.status}`}>{item.status}</span>
          </div>

          {item.status === 'pending' && (
            <div className="sub-actions">
              {cancelingId === item._id ? (
                <>
                  <span className="sub-line">Cancel this submission?</span>
                  <button
                    className="sub-button danger small"
                    disabled={busy}
                    onClick={() => handleCancel(item._id)}
                  >
                    {busy ? 'Cancelling...' : 'Yes, cancel'}
                  </button>
                  <button
                    className="sub-button small"
                    disabled={busy}
                    onClick={() => setCancelingId(null)}
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  className="sub-button danger small"
                  onClick={() => setCancelingId(item._id)}
                >
                  Cancel submission
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default MySubmissions;