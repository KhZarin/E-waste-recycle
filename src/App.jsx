import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Identify from './pages/Identify';
import Analyze from './pages/Analyze';
import RecyclingPoints from './pages/RecyclingPoints';
import GreenCredits from './pages/GreenCredits';

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/identify"
          element={
            <ProtectedRoute>
              <Identify />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <Analyze />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recycling-points"
          element={
            <ProtectedRoute>
              <RecyclingPoints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/credits"
          element={
            <ProtectedRoute>
              <GreenCredits />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
