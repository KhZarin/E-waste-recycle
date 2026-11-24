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
import PointDetails from './pages/PointDetails';
import GreenCredits from './pages/GreenCredits';
import Submit from './pages/Submit';
import MySubmissions from './pages/MySubmissions';
import ReviewSubmissions from './pages/ReviewSubmissions';
import Achievements from './pages/Achievements';
import Assistant from './pages/Assistant';

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
          path="/recycling-points/:id"
          element={
            <ProtectedRoute>
              <PointDetails />
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

        <Route
          path="/submit"
          element={
            <ProtectedRoute roles={['user']}>
              <Submit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-submissions"
          element={
            <ProtectedRoute>
              <MySubmissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review"
          element={
            <ProtectedRoute roles={['partner', 'admin']}>
              <ReviewSubmissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/achievements"
          element={
            <ProtectedRoute roles={['user']}>
              <Achievements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;