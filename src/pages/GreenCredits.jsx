import { useEffect, useState } from 'react';
import api from '../services/api';
import './GreenCredits.css';

function GreenCredits() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  const [weight, setWeight] = useState('');
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    api
      .get('/credits/summary')
      .then((res) => setSummary(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load Green Credits')
      );
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setPreviewError('');
    setPreview(null);

    try {
      const { data } = await api.get('/credits/calculate', {
        params: { weightKg: weight },
      });
      setPreview(data);
    } catch (err) {
      setPreviewError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="credits-container">
      <h2>Green Credits</h2>
      <p className="credits-hint">
        You earn Green Credits for every kilogram of e-waste you recycle.
      </p>

      {error && <div className="credits-error">{error}</div>}

      {summary && (
        <>
          <div className="credits-grid">
            <div className="credits-card">
              <div className="credits-label">Total Green Credits</div>
              <div className="credits-number">{summary.greenCredits}</div>
            </div>
            <div className="credits-card">
              <div className="credits-label">Total Recycled Weight</div>
              <div className="credits-number">{summary.totalRecycledKg} kg</div>
            </div>
            <div className="credits-card">
              <div className="credits-label">Credit Rate</div>
              <div className="credits-number">
                {summary.creditsPerKg} / kg
              </div>
            </div>
          </div>

          <div className="credits-section">
            <h3>Credit Calculator</h3>
            <form className="credits-calc-form" onSubmit={handleCalculate}>
              <label>
                E-waste weight (kg)
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Example: 2.5"
                  required
                />
              </label>
              <button type="submit">Calculate</button>
            </form>

            {previewError && (
              <div className="credits-error">{previewError}</div>
            )}

            {preview && (
              <div className="credits-result">
                Recycling <strong>{preview.weightKg} kg</strong> of e-waste
                earns you <strong>{preview.credits} Green Credits</strong>.
              </div>
            )}
          </div>

          <div className="credits-section">
            <h3>Credit History</h3>

            {summary.transactions.length === 0 ? (
              <div className="credits-empty">
                No credits yet. Credits are added when your recycled e-waste is
                confirmed.
              </div>
            ) : (
              <table className="credits-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Weight</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.transactions.map((item) => (
                    <tr key={item._id}>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>{item.description || 'Recycling'}</td>
                      <td>{item.weightKg} kg</td>
                      <td className="credits-plus">+{item.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default GreenCredits;