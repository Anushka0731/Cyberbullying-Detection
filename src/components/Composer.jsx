import { useState } from 'react';
import './Composer.css';

export default function Composer({ onPost }) {
  const [text, setText] = useState('');

  function handlePost() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onPost(trimmed);
    setText('');
  }

  return (
    <div className="composer">
      <div className="composer-row">
        <div className="post-avatar">SW</div>
        <textarea
          placeholder="Share something with the community..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="composer-footer">
        <div className="scan-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z" />
          </svg>
          Scanned automatically on post
        </div>
        <button className="post-btn" disabled={!text.trim()} onClick={handlePost}>
          Post
        </button>
      </div>
    </div>
  );
}