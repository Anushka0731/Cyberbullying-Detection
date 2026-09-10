import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  {
    label: 'Home',
    path: '/dashboard',
    icon: (
      <path d="M3 11l9-8 9 8M5 10v10h14V10" />
    ),
  },
  {
    label: 'Explore',
    path: '/explore',
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
  },
  {
    label: 'History',
    path: '/history',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
];

export default function Sidebar({ onNewPost }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [settingsOpen, setSettingsOpen] = useState(false);

  function getUserId() {
    try {
      const token = localStorage.getItem('token');

      if (!token) return null;

      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      return payload.userId || payload.id || payload._id;
    } catch (error) {
      console.error('Could not read user ID:', error);
      return null;
    }
  }

  function handleProfile() {
    const userId = getUserId();

    if (userId) {
      setSettingsOpen(false);
      navigate(`/profile/${userId}`);
    } else {
      console.error('No user ID found in token');
    }
  }

  function handleFlaggedContent() {
    setSettingsOpen(false);
    navigate('/history?filter=flagged');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setSettingsOpen(false);
    navigate('/', { replace: true });
  }

  return (
    <div className="left-col">

      <div className="sidebar-nav">

        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path;

          return (
            <a
              key={item.label}
              href={item.path}
              className={`nav-item ${
                isActive ? 'active' : ''
              }`}
              onClick={(event) => {
                event.preventDefault();
                navigate(item.path);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {item.icon}
              </svg>

              <span className="nav-label">
                {item.label}
              </span>
            </a>
          );
        })}

        <div className="nav-divider" />


        {/* SETTINGS */}

        <div className="settings-wrapper">

          <button
            type="button"
            className={`nav-item settings-button ${
              settingsOpen ? 'active' : ''
            }`}
            onClick={() =>
              setSettingsOpen((current) => !current)
            }
          >

            {/* ORIGINAL SETTINGS GEAR — UNCHANGED */}

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.5 1.5-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2v-.4a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.5-1.5.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-2h.4a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L8 7.5l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V6h2v.4a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.5 1.5-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.4v2h-.4a1.7 1.7 0 0 0-1.5 1z" />
            </svg>

            <span className="nav-label">
              Settings
            </span>

          </button>


          {/* SETTINGS POPUP */}

          {settingsOpen && (
            <div className="settings-popup">

              <button
                type="button"
                onClick={handleProfile}
              >
                <span className="settings-popup-icon">
                  👤
                </span>

                <span>
                  Your profile
                </span>
              </button>


              <button
                type="button"
                onClick={handleFlaggedContent}
              >
                <span className="settings-popup-icon">
                  ⚑
                </span>

                <span>
                  Flagged content
                </span>
              </button>


              <div className="settings-popup-divider" />


              <button
                type="button"
                className="logout-option"
                onClick={handleLogout}
              >
                <span className="settings-popup-icon">
                  ↪
                </span>

                <span>
                  Log out
                </span>
              </button>

            </div>
          )}

        </div>

      </div>


      {/* NEW POST */}

      <button
        className="compose-mini"
        onClick={onNewPost}
      >
        + New post
      </button>

    </div>
  );
}