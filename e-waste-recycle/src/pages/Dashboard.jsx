import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: 40 }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user.name}</p>
      <p>Role: {user.role}</p>
      <p>Green Credits: {user.greenCredits}</p>
    </div>
  );
}

export default Dashboard;