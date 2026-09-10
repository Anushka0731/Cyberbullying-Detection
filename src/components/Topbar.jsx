import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';

import './Topbar.css';

export default function Topbar() {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef(null);

  const navigate = useNavigate();


  /* =========================
     OPEN YOUR PROFILE
     ========================= */

  function handleProfileClick() {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      const userId =
        payload.userId ||
        payload.id ||
        payload._id;

      if (userId) {
        navigate(`/profile/${userId}`);
      } else {
        console.error('No user ID found in token');
      }

    } catch (error) {
      console.error(
        'Could not open profile:',
        error
      );
    }
  }


  /* =========================
     CLOSE SEARCH ON OUTSIDE CLICK
     ========================= */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);


  /* =========================
     SEARCH USERS
     ========================= */

  useEffect(() => {
    if (!showSearch) {
      return;
    }

    async function loadAccounts() {
      try {
        setLoading(true);

        const users =
          await api.searchUsers(search);

        setAccounts(users);

      } catch (err) {
        console.error(
          'SEARCH USERS ERROR:',
          err
        );

        setAccounts([]);

      } finally {
        setLoading(false);
      }
    }

    loadAccounts();

  }, [search, showSearch]);


  function handleAccountClick(account) {
    setShowSearch(false);
    setSearch('');

    navigate(`/profile/${account._id}`);
  }


  return (
    <div className="topbar">

      {/* LOGO */}

      <div className="wordmark">

        <div className="wordmark-mark">

          <img
            src="/logo.png"
            alt="Unsaid"
          />

        </div>

        Unsaid

      </div>


      {/* SEARCH */}

      <div
        className="search-wrap"
        ref={searchRef}
      >

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
          />

          <path d="M20 20l-3.5-3.5" />
        </svg>


        <input
          type="text"
          placeholder="Search Unsaid..."
          value={search}

          onFocus={() => {
            setShowSearch(true);
          }}

          onChange={(e) => {
            setSearch(e.target.value);
            setShowSearch(true);
          }}
        />


        {showSearch && (

          <div className="search-dropdown">

            {loading ? (

              <div className="search-empty">
                Searching...
              </div>

            ) : accounts.length > 0 ? (

              accounts.map((account) => (

                <div
                  className="search-profile"
                  key={account._id}
                  onClick={() =>
                    handleAccountClick(account)
                  }
                >

                  <div className="search-profile-avatar">

                    {account.initials ||
                      account.name
                        ?.split(' ')
                        .map(
                          (word) => word[0]
                        )
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}

                  </div>


                  <div className="search-profile-info">

                    <div className="search-profile-name">
                      {account.name}
                    </div>

                    <div className="search-profile-handle">
                      @{account.handle.replace(
                        /^@/,
                        ''
                      )}
                    </div>

                  </div>

                </div>

              ))

            ) : (

              <div className="search-empty">
                No accounts found
              </div>

            )}

          </div>

        )}

      </div>


      <div className="top-spacer" />


      {/* CLICKABLE PROFILE AVATAR */}

      <button
        type="button"
        className="avatar"
        onClick={handleProfileClick}
        aria-label="Open your profile"
      >
        SW
      </button>

    </div>
  );
}