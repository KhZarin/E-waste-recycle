import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Identify.css';

const MAX_IMAGE_MB = 4;

function Identify() {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState(null); // { base64, mimeType, preview }
  const [dbResult, setDbResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_IMAGE_MB} MB`);
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImage({
        base64: dataUrl.split(',')[1],
        mimeType: file.type,
        preview: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDbResult(null);
    setAiResult(null);
    setLoading(true);

    try {
      // Shudhu text hole age database e khuji
      if (!image && query.trim()) {
        const { data } = await api.post('/devices/identify', { query });
        setDbResult(data);
        if (data.found) {
          setLoading(false);
          return;
        }
      }

      // Image thakle ba database e na pele AI diye recognize kori
      const { data } = await api.post('/devices/ai-identify', {
        query,
        imageBase64: image?.base64,
        mimeType: image?.mimeType,
      });
      setAiResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const analyzeLink = (deviceId, weight) =>
    `/analyze?deviceId=${deviceId}${weight ? `&weight=${weight}` : ''}`;

  return (
    <div className="identify-container">
      <h2>E-Waste Identification</h2>
      <p className="identify-hint">
        Enter a device name or model, upload a photo, or both.
      </p>

      <form className="identify-form" onSubmit={handleSubmit}>
        <div className="identify-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Device name or model (example: iPhone 13)"
          />
          <button type="submit" disabled={loading || (!query.trim() && !image)}>
            {loading ? 'Identifying...' : 'Identify'}
          </button>
        </div>

        <div className="image-upload">
          <input type="file" accept="image/*" onChange={handleImage} />
          {image && (
            <>
              <img src={image.preview} alt="Preview" className="image-preview" />
              <button
                type="button"
                className="link-button"
                onClick={() => setImage(null)}
              >
                Remove
              </button>
            </>
          )}
        </div>
      </form>

      {error && <div className="identify-error">{error}</div>}

      {dbResult && dbResult.found && (
        <>
          <div className="result-card">
            <h3>Device Identified</h3>
            <div className="result-row">
              <span className="result-label">Name</span>
              <span>{dbResult.device.name}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Brand</span>
              <span>{dbResult.device.brand}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Model</span>
              <span>{dbResult.device.model}</span>
            </div>
            <div className="result-row">
              <span className="result-label">E-Waste Type</span>
              <span className="result-value">{dbResult.device.category}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Typical Weight</span>
              <span>{dbResult.device.weightKg} kg</span>
            </div>
            <div className="result-row">
              <span className="result-label">Match Confidence</span>
              <span>{dbResult.device.confidence}%</span>
            </div>
            <Link
              className="action-link"
              to={analyzeLink(dbResult.device._id)}
            >
              Estimate value and recoverable materials
            </Link>
          </div>

          {dbResult.otherMatches.length > 0 && (
            <div className="other-matches">
              <h4>Other possible matches</h4>
              <ul>
                {dbResult.otherMatches.map((item) => (
                  <li key={item._id}>
                    {item.brand} {item.name} ({item.confidence}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {dbResult && !dbResult.found && !aiResult && !loading && (
        <div className="result-card not-found">
          <h3>Device not found in database</h3>
        </div>
      )}

      {aiResult && !aiResult.identified && (
        <div className="result-card not-found">
          <h3>Could not recognize a device</h3>
          <p>{aiResult.message}</p>
        </div>
      )}

      {aiResult && aiResult.identified && (
        <div className="result-card ai-card">
          <span className="badge">AI Recognition</span>
          <h3>
            {aiResult.inDatabase
              ? 'Device found in database'
              : 'Unknown device, category recognized'}
          </h3>

          <div className="result-row">
            <span className="result-label">Name</span>
            <span>{aiResult.ai.name || '-'}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Brand</span>
            <span>{aiResult.ai.brand || '-'}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Model</span>
            <span>{aiResult.ai.model || '-'}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Device Category</span>
            <span className="result-value">{aiResult.ai.category}</span>
          </div>
          <div className="result-row">
            <span className="result-label">AI Confidence</span>
            <span>{aiResult.ai.confidence}%</span>
          </div>
          {aiResult.ai.estimatedWeightKg && (
            <div className="result-row">
              <span className="result-label">Estimated Weight</span>
              <span>{aiResult.ai.estimatedWeightKg} kg</span>
            </div>
          )}

          {aiResult.ai.reasoning && (
            <p className="ai-note">{aiResult.ai.reasoning}</p>
          )}

          {aiResult.matchedDevice && (
            <Link
              className="action-link"
              to={analyzeLink(aiResult.matchedDevice._id)}
            >
              Estimate value and recoverable materials
            </Link>
          )}

          {!aiResult.inDatabase && aiResult.typicalDevice && (
            <>
              <p className="ai-note">
                This exact model is not in our database. You can still get a
                rough estimate using the typical {aiResult.ai.category}{' '}
                material composition.
              </p>
              <Link
                className="action-link"
                to={analyzeLink(
                  aiResult.typicalDevice._id,
                  aiResult.ai.estimatedWeightKg
                )}
              >
                Estimate using typical {aiResult.ai.category}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Identify;