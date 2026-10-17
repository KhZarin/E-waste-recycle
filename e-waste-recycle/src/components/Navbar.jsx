import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Smart E-Waste Network
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>

        {user ? (
          <>
            <Link to="/identify">Identify</Link>
            <Link to="/analyze">Analyze</Link>
            <Link to="/dashboard">Dashboard</Link>
            <span className="navbar-user">Hi, {user.name}</span>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;