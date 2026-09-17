import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Topbar.css';

export default function Topbar({ user }) {
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  function handleProfileClick() {
    if (user?._id) {
      navigate(`/profile/${user._id}`);
    }
  }

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);

        const results = await api.searchUsers(query);

        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  function handleSearchProfileClick(id) {
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/profile/${id}`);
  }

  return (
    <div className="topbar">
      <div className="wordmark">
        <div className="wordmark-mark">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        Unsaid
      </div>

      {/* Search */}
      <div className="search-wrap">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>

        <input
          type="text"
          placeholder="Search Unsaid..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {searchQuery.trim() && (
          <div className="search-dropdown">
            {searching && (
              <div className="search-empty">
                Searching...
              </div>
            )}

            {!searching && searchResults.length === 0 && (
              <div className="search-empty">
                No users found
              </div>
            )}

            {!searching &&
              searchResults.map((result) => (
                <div
                  key={result._id}
                  className="search-profile"
                  onClick={() =>
                    handleSearchProfileClick(result._id)
                  }
                >
                  <div className="search-profile-avatar">
                    {result.initials ?? '?'}
                  </div>

                  <div className="search-profile-info">
                    <div className="search-profile-name">
                      {result.name}
                    </div>

                    <div className="search-profile-handle">
                      @{result.handle}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="top-spacer" />

      {/* Notifications */}
      <div className="notification-wrap">
        <button
          className="icon-btn"
          onClick={() =>
            setNotificationsOpen(!notificationsOpen)
          }
          aria-label="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>

          <span className="dot" />
        </button>

        {notificationsOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <span className="notification-title">
                Notifications
              </span>

              <span className="notification-mark">
                Mark all as read
              </span>
            </div>

            <div className="notification-item">
              <div className="notification-icon">↑</div>

              <div className="notification-content">
                <div className="notification-text">
                  Someone upvoted your post
                </div>

                <div className="notification-time">
                  Just now
                </div>
              </div>
            </div>

            <div className="notification-item">
              <div className="notification-icon">💬</div>

              <div className="notification-content">
                <div className="notification-text">
                  Someone commented on your post
                </div>

                <div className="notification-time">
                  10 minutes ago
                </div>
              </div>
            </div>

            <div className="notification-item">
              <div className="notification-icon">🛡</div>

              <div className="notification-content">
                <div className="notification-text">
                  Your post was reviewed
                </div>

                <div className="notification-time">
                  1 hour ago
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div
        className="avatar"
        title={user?.name}
        onClick={handleProfileClick}
        style={{ cursor: 'pointer' }}
      >
        {user?.initials ?? '?'}
      </div>
    </div>
  );
}