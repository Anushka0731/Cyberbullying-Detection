import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import Composer from '../components/Composer';
import PostCard from '../components/PostCard';

import { api } from '../services/api';

import './Dashboard.css';

function timeAgo(dateStr) {
  const diff = Math.floor(
    (Date.now() -
      new Date(dateStr).getTime()) /
      1000
  );

  if (diff < 60) return 'now';

  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h`;
  }

  return `${Math.floor(diff / 86400)}d`;
}

function toCard(p) {
  return {
    id: p._id,

    name: p.user?.name ?? 'Unknown',

    handle: p.user?.handle ?? '',

    initials: p.user?.initials ?? '?',

    time: timeAgo(p.createdAt),

    text: p.text,

    flagged: p.flagged,

    hits: p.flagged
      ? [{ category: p.category }]
      : [],

    ups: p.ups ?? p.likes ?? 0,

    upvoted: false,
  };
}

export default function Dashboard() {
const [posts, setPosts] = useState([]);
const [filter, setFilter] = useState('all');
const [loading, setLoading] = useState(true);

const composerRef = useRef(null);

  const [composerOpen, setComposerOpen] =
    useState(false);

  const navigate = useNavigate();

    function focusComposer() {
    const textarea = document.querySelector(
      '.composer textarea'
    );

    if (textarea) {
      textarea.focus();

      textarea.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  /* ---------- Authentication ---------- */

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
      return;
    }

    api.getPosts()
      .then((data) => {
        setPosts(data.map(toCard));
      })
      .catch((err) => {
        console.log(
          'Failed to load posts:',
          err.message
        );
      })
      .finally(() => {
        setLoading(false);
      });

  }, [navigate]);

  /* ---------- Stats ---------- */

  const stats = useMemo(() => {
    const total = posts.length;

    const flagged = posts.filter(
      (p) => p.flagged
    ).length;

    return {
      total,
      flagged,
      safe: total - flagged,
    };
  }, [posts]);

  /* ---------- Filter ---------- */

  const visiblePosts = posts.filter((p) => {
    if (filter === 'all') {
      return true;
    }

    if (filter === 'flagged') {
      return p.flagged;
    }

    if (filter === 'safe') {
      return !p.flagged;
    }

    return true;
  });

  /* ---------- Create Post ---------- */

  async function handleNewPost(text) {
    const tempId =
      'temp-' + Date.now();

    const scanningPost = {
      id: tempId,

      name: 'You',

      handle: '',

      initials: 'SW',

      time: 'now',

      text,

      scanning: true,

      flagged: false,

      hits: [],

      likes: 0,

      ups: 0,
    };

    setPosts((prev) => [
      scanningPost,
      ...prev,
    ]);

    try {
      const newPost =
        await api.createPost(text);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? toCard(newPost)
            : p
        )
      );

    } catch (err) {
      console.log(
        'Failed to create post:',
        err.message
      );

      setPosts((prev) =>
        prev.filter(
          (p) => p.id !== tempId
        )
      );
    }
  }


  return (
    <div className="dashboard">

      <Topbar />

      <div className="layout">
        <Sidebar
        onNewPost={() => {
          composerRef.current?.focus();
          }}
          />

        <div className="center-col">

          {/* Greeting */}

          <div className="greeting-card">

            <h2>
              How you feeling today?
            </h2>

            <p>
              Your feed is checked
              automatically — post freely.
            </p>

          </div>

          {/* Composer */}

          {composerOpen ? (
            <Composer
              open={true}
              onClose={() =>
                setComposerOpen(false)
              }
              onPost={handleNewPost}
            />
          ) : (
            <Composer
              open={false}
              onClose={() =>
                setComposerOpen(true)
              }
                ref={composerRef}
                onPost={handleNewPost}
            />
          )}

          {/* Filters */}

          <div className="filter-bar">

            <button
              className={`filter-chip ${
                filter === 'all'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setFilter('all')
              }
            >
              All posts
            </button>

            <button
              className={`filter-chip ${
                filter === 'flagged'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setFilter('flagged')
              }
            >
              Flagged
            </button>

            <button
              className={`filter-chip ${
                filter === 'safe'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setFilter('safe')
              }
            >
              Verified safe
            </button>

          </div>

          {/* Feed */}

          {loading && (
            <p className="feed-message">
              Loading feed...
            </p>
          )}

          {!loading &&
            visiblePosts.map((post) => (
              <PostCard
              key={post.id}
              post={post}
              />
            ))}

          {!loading &&
            visiblePosts.length === 0 && (
              <div className="empty-feed">
                No posts in this category yet.
              </div>
            )}

        </div>

        {/* ---------- RIGHT COLUMN ---------- */}

        <div className="right-col">

          {/* Safety Score */}

          <div className="widget">

            <h3>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z" />
              </svg>

              Community safety score

            </h3>

            <div className="score-row">

              <div className="score-num">
                {stats.total
                  ? Math.round(
                      (stats.safe /
                        stats.total) *
                        100
                    )
                  : 100}
                %
              </div>

              <div className="score-sub">
                of posts scanned today
                were verified safe on
                first check.
              </div>

            </div>

          </div>

          {/* Today's Activity */}

          <div className="widget">

            <h3>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                />

                <path d="M8 13v4M12 9v8M16 6v11" />
              </svg>

              Today's activity

            </h3>

            <div className="stat-row">
              <span>
                Posts scanned
              </span>

              <span className="n">
                {stats.total}
              </span>
            </div>

            <div className="stat-row">
              <span>
                Flagged for review
              </span>

              <span className="n flag">
                {stats.flagged}
              </span>
            </div>

            <div className="stat-row">
              <span>
                Verified safe
              </span>

              <span className="n safe">
                {stats.safe}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}