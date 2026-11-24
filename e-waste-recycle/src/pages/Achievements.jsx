import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Achievements.css';

const describeError = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.status === 404) {
    return 'API not found (404). Restart the backend and check that server.js has the achievements route.';
  }
  if (err.response) {
    return `Request failed (${err.response.status}). Check the backend terminal.`;
  }
  return 'Cannot reach the backend. Make sure it is running.';
};

function Achievements() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/achievements/me')
      .then((res) => setData(res.data))
      .catch((err) => setError(describeError(err)));
  }, []);

  return (
    <div className="ach-container">
      <h2>Achievements</h2>
      <p className="ach-hint">
        Earn Green Credits by recycling e-waste and unlock higher levels.{' '}
        <Link to="/submit">Submit e-waste</Link>
      </p>

      {error && <div className="ach-error">{error}</div>}

      {data && (
        <>
          <div className="ach-hero">
            <div className="ach-badge">
              <span className="ach-badge-label">LEVEL</span>
              <span className="ach-badge-number">
                {data.currentLevel.number}
              </span>
            </div>
            <div className="ach-hero-text">
              <h3>{data.currentLevel.name}</h3>
              <p>{data.currentLevel.description}</p>
            </div>
          </div>

          <div className="ach-stats">
            <div className="ach-stat">
              <div className="ach-stat-label">Total Green Credits</div>
              <div className="ach-stat-number">{data.greenCredits}</div>
            </div>
            <div className="ach-stat">
              <div className="ach-stat-label">Total Recycled Weight</div>
              <div className="ach-stat-number">{data.totalRecycledKg} kg</div>
            </div>
          </div>

          <div className="ach-section">
            <h3>Progress</h3>

            {data.nextLevel ? (
              <>
                <div className="ach-progress-text">
                  <span>{data.currentLevel.name}</span>
                  <span>{data.nextLevel.name}</span>
                </div>
                <div className="ach-bar">
                  <div
                    className="ach-bar-fill"
                    style={{ width: `${data.progressPercent}%` }}
                  />
                </div>
                <p className="ach-note">
                  {data.progressPercent}% complete. You need{' '}
                  <strong>{data.creditsToNextLevel} more Green Credits</strong>{' '}
                  to reach {data.nextLevel.name}.
                </p>
              </>
            ) : (
              <>
                <div className="ach-bar">
                  <div className="ach-bar-fill" style={{ width: '100%' }} />
                </div>
                <p className="ach-note">
                  You have reached the highest level. Thank you for recycling!
                </p>
              </>
            )}
          </div>

          <div className="ach-section">
            <h3>All Levels</h3>
            {data.levels.map((level) => {
              const isCurrent = level.number === data.currentLevel.number;
              let className = level.unlocked
                ? 'ach-level unlocked'
                : 'ach-level locked';
              if (isCurrent) className += ' current';

              return (
                <div className={className} key={level.number}>
                  <div>
                    <h4>
                      Level {level.number}: {level.name}
                    </h4>
                    <p>{level.description}</p>
                  </div>
                  <div className="ach-level-state">
                    {level.unlocked ? (
                      <span className="ach-state-unlocked">
                        {isCurrent ? 'Current level' : 'Unlocked'}
                      </span>
                    ) : (
                      <span className="ach-state-locked">Locked</span>
                    )}
                    <span className="ach-level-min">
                      {level.minCredits} credits
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Achievements;