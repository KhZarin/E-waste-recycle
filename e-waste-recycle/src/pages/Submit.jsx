
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Submission.css';

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

const describeError = (err, fallback) => {
  if (err.response?.data?.message) return err.response.data.message;

  if (err.response?.status === 404) {
    return 'API not found (404). Check the recycling points route in server.js.';
  }

  if (err.response) {
    return `Request failed (${err.response.status}). Check the backend terminal.`;
  }

  return `${fallback}: cannot reach the backend. Make sure it is running.`;
};

function Submit() {
  const navigate = useNavigate();

  const [points, setPoints] = useState([]);
  const [pointsLoading, setPointsLoading] = useState(true);

  const [form, setForm] = useState({
    deviceType: '',
    recyclingPointId: '',
    deviceName: '',
    quantity: 1,
    weightKg: '',
    notes: '',
  });

  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load recycling points from backend
  useEffect(() => {
    let cancelled = false;

    const loadPoints = async () => {
      try {
        setPointsLoading(true);

        const res = await api.get('/recycling-points');

        console.log('Recycling Points Response:', res.data);

        const receivedPoints = Array.isArray(res.data.points)
          ? res.data.points
          : [];

        if (!cancelled) {
          setPoints(receivedPoints);
        }
      } catch (err) {
        console.error('Recycling Points Error:', err);

        if (!cancelled) {
          setError(
            describeError(err, 'Could not load recycling points')
          );
        }
      } finally {
        if (!cancelled) {
          setPointsLoading(false);
        }
      }
    };

    loadPoints();

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate estimated Green Credits
  const weightNumber = parseFloat(form.weightKg);
  const weightIsValid =
    Number.isFinite(weightNumber) && weightNumber > 0;

  useEffect(() => {
    if (!weightIsValid) {
      setEstimate(null);
      return undefined;
    }

    let cancelled = false;

    api
      .get('/credits/calculate', {
        params: { weightKg: weightNumber },
      })
      .then((res) => {
        if (!cancelled) {
          setEstimate(res.data.credits);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEstimate(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [weightIsValid, weightNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset recycling point when device type changes
  const handleTypeChange = (e) => {
    const selectedType = e.target.value;

    setForm((prev) => ({
      ...prev,
      deviceType: selectedType,
      recyclingPointId: '',
    }));
  };

  // Filter points according to selected device type
  const availablePoints = points.filter((point) => {
    if (!form.deviceType) return true;

    return (
      Array.isArray(point.acceptedTypes) &&
      point.acceptedTypes.includes(form.deviceType)
    );
  });

  const pointPlaceholder = () => {
    if (pointsLoading) return 'Loading recycling points...';

    if (!form.deviceType) return 'Select device type first';

    if (availablePoints.length === 0) {
      return 'No recycling point accepts this type';
    }

    return 'Select recycling point';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!form.deviceType) {
      setError('Please select a device type.');
      return;
    }

    if (!form.recyclingPointId) {
      setError('Please select a recycling point.');
      return;
    }

    if (Number(form.quantity) < 1) {
      setError('Quantity must be at least 1.');
      return;
    }

    if (!weightIsValid) {
      setError('Please enter a valid weight.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/submissions', {
        recyclingPointId: form.recyclingPointId,
        deviceType: form.deviceType,
        deviceName: form.deviceName || undefined,
        quantity: Number(form.quantity),
        weightKg: Number(form.weightKg),
        notes: form.notes || undefined,
      });

      navigate('/my-submissions', {
        state: {
          message:
            'Submission sent. You will get Green Credits after the recycling point confirms it.',
        },
      });
    } catch (err) {
      setError(describeError(err, 'Submission failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sub-container">
      <h2>Submit E-Waste for Recycling</h2>

      <p className="sub-hint">
        Tell us what you are recycling and where you will hand it over.
      </p>

      {error && <div className="sub-error">{error}</div>}

      <form className="sub-form" onSubmit={handleSubmit}>
        <label className="sub-field">
          Device type

          <select
            name="deviceType"
            value={form.deviceType}
            onChange={handleTypeChange}
            required
          >
            <option value="">Select type</option>

            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="sub-field">
          Recycling point

          <select
            name="recyclingPointId"
            value={form.recyclingPointId}
            onChange={handleChange}
            required
            disabled={!form.deviceType || pointsLoading}
          >
            <option value="">
              {pointPlaceholder()}
            </option>

            {availablePoints.map((point) => (
              <option
                key={point._id}
                value={point._id}
                disabled={point.status !== 'open'}
              >
                {point.name} ({point.area})
                {point.status !== 'open'
                  ? ` - ${point.status}`
                  : ''}
              </option>
            ))}
          </select>

          <small>
            {pointsLoading
              ? 'Loading recycling points...'
              : form.deviceType
                ? `${availablePoints.length} recycling points accept ${form.deviceType}.`
                : `${points.length} recycling points loaded.`}
          </small>
        </label>

        <label className="sub-field">
          Device name (optional)

          <input
            type="text"
            name="deviceName"
            value={form.deviceName}
            onChange={handleChange}
            placeholder="Example: iPhone 13"
            maxLength={100}
          />
        </label>

        <label className="sub-field">
          Quantity

          <input
            type="number"
            name="quantity"
            min="1"
            step="1"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </label>

        <label className="sub-field">
          Total weight (kg)

          <input
            type="number"
            name="weightKg"
            min="0.001"
            step="any"
            value={form.weightKg}
            onChange={handleChange}
            placeholder="Example: 0.35"
            required
          />
        </label>

        <label className="sub-field full">
          Notes (optional)

          <textarea
            name="notes"
            rows="3"
            maxLength={300}
            value={form.notes}
            onChange={handleChange}
            placeholder="Anything the recycling point should know"
          />
        </label>

        {weightIsValid && estimate !== null && (
          <div className="sub-estimate">
            Estimated credits: about{' '}
            <strong>{estimate} Green Credits</strong>.

            Credits are added to your account only after the recycling point
            confirms your submission.
          </div>
        )}

        <div className="sub-field full">
          <button
            className="sub-button"
            type="submit"
            disabled={loading || pointsLoading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Submit;
