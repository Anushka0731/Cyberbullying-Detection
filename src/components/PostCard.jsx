import StatusPill from './StatusPill';
import './PostCard.css';

export default function PostCard({ post, onLike }) {
  const status = post.scanning ? 'scanning' : post.flagged ? 'flagged' : 'safe';
  const categories = post.hits ? [...new Set(post.hits.map((h) => h.category))] : [];

  return (
    <div className={`post ${post.flagged ? 'flagged' : ''}`}>
      <div className="post-head">
        <div className="post-avatar">{post.initials}</div>
        <div className="post-meta">
          <div className="post-name-row">
            <div className="post-name-left">
              <span className="post-name">{post.name}</span>
              <span className="post-time">{post.time}</span>
            </div>
            <StatusPill status={status} />
          </div>

          <p className="post-text">{post.text}</p>

          {post.flagged && categories.length > 0 && (
            <div className="flag-detail">
              <b>Why it was flagged:</b> classified as {categories.join(', ')} language.
            </div>
          )}

          {!post.scanning && (
            <div className="post-actions">
              <button>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                {post.ups ?? 0}
              </button>
              <button>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Comment
              </button>
              <button onClick={() => onLike(post.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
                {post.likes ?? 0}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}