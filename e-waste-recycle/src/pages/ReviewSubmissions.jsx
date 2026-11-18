import { useEffect, useState } from 'react';
import api from '../services/api';
import './Submission.css';

function ReviewSubmissions() {
  const [status, setStatus] = useState('pending');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Kon submission e kon action chalu: { id, type: 'confirm' | 'reject' }
  const [activeAction, setActiveAction] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/submissions', { params: { status: status || undefined } })
      .then((res) => {
        if (!cancelled) {
          setSubmissions(res.data.submissions);
          setError('');
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Could not load submissions');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleStatusChange = (e) => {
    setLoading(true);
    setMessage('');
    setActiveAction(null);
    setStatus(e.target.value);
  };

  const startAction = (id, type) => {
    setError('');
    setMessage('');
    setReason('');
    setActiveAction({ id, type });
  };

  const stopAction = () => {
    setActiveAction(null);
    setReason('');
  };

  const handleConfirm = async (id) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch(`/submissions/${id}/confirm`);
      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                status: data.submission.status,
                creditsAwarded: data.submission.creditsAwarded,
              }
            : item
        )
      );
      setMessage(
        `Confirmed. ${data.submission.creditsAwarded} Green Credits were added to the user.`
      );
      stopAction();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not confirm submission');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (id) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.patch(`/submissions/${id}/reject`, {
        reason: reason.trim() || undefined,
      });
      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                status: data.status,
                rejectionReason: data.rejectionReason,
              }
            : item
        )
      );
      setMessage('Submission rejected.');
      stopAction();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject submission');
    } finally {
      setBusy(false);
    }
  };

  const renderActions = (item) => {
    if (item.status !== 'pending') return null;

    const isActive = activeAction && activeAction.id === item._id;

    if (isActive && activeAction.type === 'confirm') {
      return (
        <div className="sub-actions">
          <span className="sub-line">Confirm that you received this e-waste?</span>
          <button
            className="sub-button small"
            disabled={busy}
            onClick={() => handleConfirm(item._id)}
          >
            {busy ? 'Confirming...' : 'Yes, confirm'}
          </button>
          <button
            className="sub-button danger small"
            disabled={busy}
            onClick={stopAction}
          >
            No
          </button>
        </div>
      );
    }

    if (isActive && activeAction.type === 'reject') {
      return (
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            maxLength={200}
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
          <div className="sub-actions">
            <button
              className="sub-button danger small"
              disabled={busy}
              onClick={() => handleReject(item._id)}
            >
              {busy ? 'Rejecting...' : 'Reject submission'}
            </button>
            <button
              className="sub-button small"
              disabled={busy}
              onClick={stopAction}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="sub-actions">
        <button
          className="sub-button small"
          onClick={() => startAction(item._id, 'confirm')}
        >
          Confirm
        </button>
        <button
          className="sub-button danger small"
          onClick={() => startAction(item._id, 'reject')}
        >
          Reject
        </button>
      </div>
    );
  };

  return (
    <div className="sub-container">
      <h2>Review Submissions</h2>
      <p className="sub-hint">
        Confirm submissions when you receive the e-waste. Confirming adds Green
        Credits to the user automatically.
      </p>

      <div className="sub-toolbar">
        <label htmlFor="statusFilter">Show</label>
        <select id="statusFilter" value={status} onChange={handleStatusChange}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="">All</option>
        </select>
      </div>

      {message && <div className="sub-success">{message}</div>}
      {error && <div className="sub-error">{error}</div>}

      {loading && <p>Loading...</p>}

      {!loading && submissions.length === 0 && (
        <div className="sub-empty">No submissions found.</div>
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
                From: <strong>{item.user?.name}</strong> ({item.user?.email})
              </p>
              <p className="sub-line">
                Recycling point: {item.recyclingPoint?.name}
              </p>
              <p className="sub-line">Total weight: {item.weightKg} kg</p>
              <p className="sub-line">
                Submitted: {new Date(item.createdAt).toLocaleString()}
              </p>
              {item.notes && <p className="sub-line">Notes: {item.notes}</p>}
              {item.status === 'confirmed' && (
                <p className="sub-line">
                  Credits awarded: <strong>+{item.creditsAwarded}</strong>
                </p>
              )}
              {item.status === 'rejected' && item.rejectionReason && (
                <p className="sub-line">Reason: {item.rejectionReason}</p>
              )}
            </div>
            <span className={`sub-status ${item.status}`}>{item.status}</span>
          </div>

          {renderActions(item)}
        </div>
      ))}
    </div>
  );
}

export default ReviewSubmissions;