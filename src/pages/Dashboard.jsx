import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api
      .get('/credits/summary')
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user.name}</p>
      <p>Role: {user.role}</p>
      <p>Green Credits: {summary ? summary.greenCredits : '...'}</p>
      <p>
        Total Recycled Weight: {summary ? `${summary.totalRecycledKg} kg` : '...'}
      </p>
      <Link to="/credits">View credit history</Link>
    </div>
  );
}

export default Dashboard;