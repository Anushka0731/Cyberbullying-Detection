import { useEffect, useState } from 'react';
import StatusPill from './StatusPill';
import { api } from '../services/api';
import './PostCard.css';

export default function PostCard({ post }) {
  const status = post.scanning
    ? 'scanning'
    : post.flagged
      ? 'flagged'
      : 'safe';

  const categories = post.hits
    ? [...new Set(post.hits.map((h) => h.category))]
    : [];

  // =====================================================
  // UPVOTE — FRONTEND ONLY
  // Every tap adds exactly +1
  // =====================================================

  const [ups, setUps] = useState(post.ups ?? 0);
  const [upvoted, setUpvoted] = useState(false);

  function handleUpvote() {
    setUps((current) => current + 1);
    setUpvoted(true);
  }

  // =====================================================
  // LIKE — FRONTEND ONLY
  // Tap = like
  // Tap again = unlike
  // No counter
  // =====================================================

  const [liked, setLiked] = useState(false);

  function handleLike() {
    setLiked((current) => !current);
  }

  // =====================================================
  // COMMENTS
  // =====================================================

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // =====================================================
  // LOAD EXISTING COMMENTS
  // =====================================================

  async function loadComments() {
    try {
      setCommentsLoading(true);

      const data = await api.getComments(post.id);

      setComments(
        data.map((comment) => ({
          id: comment._id,

          text: comment.text,

          flagged: comment.flagged === true,

          category:
            comment.category ??
            'not_cyberbullying',

          bullyingProbability:
            comment.bullyingProbability ??
            0,

          categoryConfidence:
            comment.categoryConfidence ??
            0,

          name:
            comment.user?.name ??
            'Unknown',

          initials:
            comment.user?.initials ??
            comment.user?.name
              ?.split(' ')
              .map((word) => word[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() ??
            '?',

          handle:
            comment.user?.handle ??
            '',

          time: formatTime(comment.createdAt),

          reason:
            comment.flagged === true
              ? `classified as ${
                  comment.category ??
                  'cyberbullying'
                } language.`
              : '',
        }))
      );

    } catch (err) {
      console.error(
        '❌ FAILED TO LOAD COMMENTS:',
        err
      );

      setComments([]);

    } finally {
      setCommentsLoading(false);
    }
  }

  // =====================================================
  // OPEN COMMENTS
  // =====================================================

  async function openComments() {
    setShowComments(true);

    await loadComments();
  }

  // =====================================================
  // CLOSE COMMENTS
  // =====================================================

  function closeComments() {
    setShowComments(false);
    setCommentText('');
  }

  // =====================================================
  // ESCAPE KEY CLOSES MODAL
  // =====================================================

  useEffect(() => {
    if (!showComments) {
      return;
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeComments();
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [showComments]);

  // =====================================================
  // SUBMIT COMMENT
  // =====================================================

  async function handleCommentSubmit() {
    const trimmed = commentText.trim();

    if (!trimmed || commentLoading) {
      return;
    }

    setCommentLoading(true);

    try {
      console.log('');
      console.log(
        '📤 SENDING COMMENT TO BACKEND'
      );
      console.log(
        'Comment:',
        trimmed
      );
      console.log(
        'Post ID:',
        post.id
      );

      const result =
        await api.addComment(
          post.id,
          trimmed
        );

      console.log('');
      console.log(
        '📥 COMMENT RESPONSE FROM BACKEND'
      );
      console.log(result);

      console.log(
        'FLAGGED:',
        result.flagged,
        typeof result.flagged
      );

      console.log(
        'CATEGORY:',
        result.category
      );

      console.log(
        'BULLYING PROBABILITY:',
        result.bullyingProbability
      );

      console.log(
        'CATEGORY CONFIDENCE:',
        result.categoryConfidence
      );

      const isFlagged =
        result.flagged === true; //true = flagged

      const newComment = {
        id:
          result._id ??
          Date.now(),

        text:
          result.text ??
          trimmed,

        flagged:
          isFlagged,

        category:
          result.category ??
          'not_cyberbullying',

        bullyingProbability:
          result.bullyingProbability ??
          0,

        categoryConfidence:
          result.categoryConfidence ??
          0,

        name:
          result.user?.name ??
          'Swikriti Gupta',

        initials:
          result.user?.initials ??
          'SG',

        handle:
          result.user?.handle ??
          '',

        time: 'now',

        reason: isFlagged
          ? `classified as ${
              result.category ??
              'cyberbullying'
            } language.`
          : '',
      };

      console.log('');
      console.log(
        '🧠 COMMENT UI OBJECT'
      );
      console.log(newComment);

      setComments((current) => [
        ...current,
        newComment,
      ]);

      setCommentText('');

    } catch (err) {
      console.error(
        '❌ FAILED TO ADD COMMENT:',
        err
      );

      alert(
        err.message ||
        'Could not check the comment.'
      );

    } finally {
      setCommentLoading(false);
    }
  }

  return (
    <>
      <div
        className={`post ${
          post.flagged ? 'flagged' : ''
        }`}
      >
        <div className="post-head">

          <div className="post-avatar">
            {post.initials}
          </div>


          <div className="post-meta">
            <div className="post-name-row">

              <div className="post-name-left">

                <span className="post-name">
                  {post.name}
                </span>

                <span className="post-time">
                  {post.time}
                </span>

              </div>


              <StatusPill
                status={status}
              />

            </div>
            <p className="post-text">
              {post.text}
            </p>
            {post.flagged &&
              categories.length > 0 && (

                <div className="flag-detail">

                  <b>
                    Why it was flagged:
                  </b>{' '}

                  classified as{' '}

                  {categories.join(', ')}

                  {' '}language.

                </div>
            )}
            {!post.scanning && (

              <div className="post-actions">

                <button
                  type="button"
                  className={
                    upvoted
                      ? 'upvote-btn active'
                      : 'upvote-btn'
                  }
                  onClick={handleUpvote}
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path d="M12 19V5M5 12l7-7 7 7" />

                  </svg>

                  {ups}

                </button>

                <button
                  type="button"
                  onClick={openComments}
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />

                  </svg>

                  Comment

                </button>
                <button
                  type="button"
                  className={`like-btn ${
                    liked ? 'liked' : ''
                  }`}
                  onClick={handleLike}
                  aria-label={
                    liked
                      ? 'Unlike'
                      : 'Like'
                  }
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill={
                      liked
                        ? 'currentColor'
                        : 'none'
                    }
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />

                  </svg>

                </button>

              </div>

            )}

          </div>

        </div>

      </div>

      {showComments && !post.scanning && (

        <div
          className="comments-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeComments();
            }

          }}
        >

          <div
            className="comments-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="comments-modal-header">

              <div>

                <h2>
                  Comments
                </h2>

                <span>
                  {comments.length}{' '}
                  {comments.length === 1
                    ? 'comment'
                    : 'comments'}
                </span>

              </div>


              <button
                type="button"
                className="comments-close"
                onClick={closeComments}
                aria-label="Close comments"
              >

                ×

              </button>

            </div>

            <div className="comments-modal-body">

              {commentsLoading ? (

                <div className="comments-loading">
                  Loading comments...
                </div>

              ) : (

                comments.map(
                  (comment) => (
                    <div
                    className={`comment-item ${
                      comment.flagged ? 'comment-flagged' : ''
                    } ${
                      comment.isNew ? 'comment-new' : ''
                      }`}
                      >

                      <div className="comment-avatar">

                        {comment.initials}

                      </div>


                      <div className="comment-content">

                        <div className="comment-header">

                          <span className="comment-name">
                            {comment.name}
                          </span>

                          {comment.handle && (

                            <span className="comment-time">
                              @
                              {comment.handle.replace(
                                /^@/,
                                ''
                              )}
                            </span>

                          )}

                          <span className="comment-time">
                            · {comment.time}
                          </span>

                          <span
                            className={
                              comment.flagged
                                ? 'comment-status flagged'
                                : 'comment-status safe'
                            }
                          >

                            {comment.flagged
                              ? '⚑ Flagged'
                              : '✓ Safe'}

                          </span>

                        </div>

                        <div className="comment-text">

                          {comment.text}

                        </div>

                        {comment.flagged && (

                          <div className="comment-flag-detail">

                            <b>
                              Why it was flagged:
                            </b>{' '}

                            {comment.reason}

                          </div>

                        )}

                      </div>

                    </div>

                  )
                )

              )}

            </div>
            <div className="comment-input-row">

              <div className="comment-avatar">
                SG
              </div>


              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) =>
                  setCommentText(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key === 'Enter'
                  ) {

                    handleCommentSubmit();

                  }

                }}
                disabled={
                  commentLoading
                }
              />


              <button
                type="button"
                className="comment-submit"
                disabled={
                  !commentText.trim() ||
                  commentLoading
                }
                onClick={
                  handleCommentSubmit
                }
              >

                {commentLoading
                  ? 'Checking...'
                  : 'Comment'}

              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

function formatTime(dateStr) {

  if (!dateStr) {
    return 'now';
  }

  const diff = Math.floor(
    (
      Date.now() -
      new Date(dateStr).getTime()
    ) / 1000
  );

  if (diff < 60) {
    return 'now';
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h`;
  }

  return `${Math.floor(diff / 86400)}d`;
}