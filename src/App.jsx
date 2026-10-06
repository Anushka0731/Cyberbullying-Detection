import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import VerifyPage from './pages/VerifyPage';
import CheckEmailPage from './pages/CheckEmailPage';
import Dashboard from './pages/Dashboard';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* After successful signup */}
        <Route
          path="/check-email"
          element={<CheckEmailPage />}
        />

        {/* Link opened from verification email */}
        <Route
          path="/verify-email"
          element={<VerifyPage />}
        />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/history" element={<HistoryPage />} />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

    </BrowserRouter>
  );
}