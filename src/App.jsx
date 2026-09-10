import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';

import FloatingBubbles from './components/FloatingBubbles';


export default function App() {

  return (

    <BrowserRouter>

      <FloatingBubbles />

      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={<LoginPage />}
        />


        {/* DASHBOARD / HOME */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* EXPLORE */}

        <Route
          path="/explore"
          element={<ExplorePage />}
        />


        {/* PROFILE */}

        <Route
          path="/profile/:id"
          element={<ProfilePage />}
        />


        {/* HISTORY */}

        <Route
          path="/history"
          element={<HistoryPage />}
        />


        {/* ANY UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}