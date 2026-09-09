import { useMemo, useState } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import Composer from '../components/Composer';
import PostCard from '../components/PostCard';
import { analyzeText } from '../services/moderationService';
import { seedPosts, suggestedUsers } from '../data/seedPosts';
import './Dashboard.css';

function withAnalysis(post) {
  const result = analyzeText(post.text);
  return {
    ...post,
    ...result,
    likes: Math.floor(Math.random() * 40) + 3,
    ups: Math.floor(Math.random() * 60) + 5,
  };
}

export default function Dashboard() {
  const [posts, setPosts] = useState(() => seedPosts.map(withAnalysis));
  const [filter, setFilter] = useState('all');

  const stats = useMemo(() => {
    const total = posts.filter((p) => !p.scanning).length;
    const flagged = posts.filter((p) => p.flagged && !p.scanning).length;
    return { total, flagged, safe: total - flagged };
  }, [posts]);

  const visiblePosts = posts.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'flagged') return p.flagged;
    if (filter === 'safe') return !p.flagged && !p.scanning;
    return true;
  });

  function handleNewPost(text) {
    const id = 'p-' + Date.now();
    const scanningPost = {
      id, name: 'Swikriti', handle: '@swikriti', initials: 'SW', time: 'now',
      text, scanning: true, flagged: false, hits: [], likes: 0, ups: 0,
    };
    setPosts((prev) => [scanningPost, ...prev]);

    setTimeout(() => {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...withAnalysis(p), scanning: false } : p))
      );
    }, 900);
  }

  return (
    <div className="dashboard">
      <Topbar />

      <div className="layout">
        <Sidebar />

        <div className="center-col">
          <div className="greeting-card">
            <h2>How you feeling today?</h2>
            <p>Your feed is checked automatically — post freely.</p>
          </div>

          <Composer onPost={handleNewPost} />

          <div className="filter-bar">
            <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All posts
            </button>
            <button className={`filter-chip ${filter === 'flagged' ? 'active' : ''}`} onClick={() => setFilter('flagged')}>
              Flagged
            </button>
            <button className={`filter-chip ${filter === 'safe' ? 'active' : ''}`} onClick={() => setFilter('safe')}>
              Verified safe
            </button>
          </div>

          {visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="right-col">
          <div className="widget">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z" />
              </svg>
              Community safety score
            </h3>
            <div className="score-row">
              <div className="score-num">
                {stats.total ? Math.round((stats.safe / stats.total) * 100) : 100}%
              </div>
              <div className="score-sub">of posts scanned today were verified safe on first check.</div>
            </div>
          </div>

          <div className="widget">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 13v4M12 9v8M16 6v11" />
              </svg>
              Today's activity
            </h3>
            <div className="stat-row"><span>Posts scanned</span><span className="n">{stats.total}</span></div>
            <div className="stat-row"><span>Flagged for review</span><span className="n flag">{stats.flagged}</span></div>
            <div className="stat-row"><span>Verified safe</span><span className="n safe">{stats.safe}</span></div>
          </div>

          <div className="widget">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
              </svg>
              Suggested for you
            </h3>
            {suggestedUsers.map((u) => (
              <div className="suggest-row" key={u.handle}>
                <div className="suggest-avatar" />
                <div>
                  <div className="suggest-name">{u.name}</div>
                  <div className="suggest-sub">{u.handle}</div>
                </div>
                <button className="suggest-follow">Follow</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}