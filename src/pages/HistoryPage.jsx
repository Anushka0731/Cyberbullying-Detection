import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';

import { api } from '../services/api';

import './HistoryPage.css';


function timeAgo(dateStr) {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );

  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

  return `${Math.floor(diff / 86400)}d`;
}


function toCard(post) {
  return {
    id: post._id,

    name: post.user?.name ?? 'You',

    handle: post.user?.handle ?? '',

    initials: post.user?.initials ?? 'SW',

    time: timeAgo(post.createdAt),

    text: post.text,

    flagged: post.flagged === true,

    hits:
      post.flagged === true
        ? [
            {
              category: post.category,
            },
          ]
        : [],

    ups: post.ups ?? post.likes ?? 0,

    upvoted: false,
  };
}


export default function HistoryPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
      return;
    }


    async function loadHistory() {
      try {
        setLoading(true);
        setError('');

        const data = await api.getHistory();

        setPosts(data.map(toCard));

      } catch (err) {
        console.error(
          'HISTORY LOAD ERROR:',
          err
        );

        setError(
          err.message ||
          'Could not load your history.'
        );

      } finally {
        setLoading(false);
      }
    }


    loadHistory();

  }, [navigate]);


  const flaggedCount =
    posts.filter(
      (post) => post.flagged
    ).length;


  const safeCount =
    posts.length - flaggedCount;


  return (
    <div className="history-page">

      <Topbar />


      <div className="history-layout">
        <Sidebar
        onNewPost={() => navigate('/dashboard')}
        />

        <main className="history-main">

          {/* =========================================
              HEADER
          ========================================= */}

          <div className="history-header">

            <div className="history-title">

              <h1>
                History
              </h1>

              <p>
                Everything you've posted,
                checked for safety.
              </p>

            </div>


            <div className="history-summary">

              <div className="history-stat">

                <strong>
                  {posts.length}
                </strong>

                <span>
                  Posts
                </span>

              </div>


              <div className="history-stat safe">

                <strong>
                  {safeCount}
                </strong>

                <span>
                  Safe
                </span>

              </div>


              <div className="history-stat flagged">

                <strong>
                  {flaggedCount}
                </strong>

                <span>
                  Flagged
                </span>

              </div>

            </div>

          </div>


          {/* =========================================
              LOADING
          ========================================= */}

          {loading && (

            <div className="history-message">
              Loading your history...
            </div>

          )}


          {/* =========================================
              ERROR
          ========================================= */}

          {!loading && error && (

            <div className="history-message history-error">

              <h3>
                Could not load history
              </h3>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* =========================================
              EMPTY
          ========================================= */}

          {!loading &&
            !error &&
            posts.length === 0 && (

              <div className="history-empty">

                <div className="history-empty-icon">
                  ✓
                </div>

                <h2>
                  No posts yet
                </h2>

                <p>
                  Posts you make will
                  appear here after
                  they're checked.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/dashboard')
                  }
                >
                  Create a post
                </button>

              </div>

          )}


          {/* =========================================
              HISTORY FEED
          ========================================= */}

          {!loading &&
            !error &&
            posts.length > 0 && (

              <div className="history-feed">

                {posts.map((post) => (

                  <PostCard
                    key={post.id}
                    post={post}
                  />

                ))}

              </div>

          )}

        </main>

      </div>

    </div>
  );
}