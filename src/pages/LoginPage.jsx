import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './LoginPage.css';

const CAUGHT_COMMENTS = [
  "you're so stupid, nobody wants you here",
  "nobody even likes you, just leave already",
  "you'll never be good enough for this",
];

function CommentBubble({ text }) {
  const bubbleRef = useRef(null);
  const [caught, setCaught] = useState(false);
  const [disintegrating, setDisintegrating] = useState(false);
  const busyRef = useRef(false);

  function buildSnapshot(bubble) {
    const rect = bubble.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const dpr = window.devicePixelRatio || 1;

    const canvas = document.createElement('canvas');
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cs = getComputedStyle(bubble);
    const r = parseFloat(cs.borderRadius) || 12;

    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();

    ctx.fillStyle = 'rgba(220, 90, 90, 0.16)';
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(220, 120, 120, 0.35)';
    ctx.stroke();

    ctx.fillStyle = '#F3C7C7';
    ctx.font = '13.5px Inter, sans-serif';
    ctx.textBaseline = 'middle';

    const paddingX = 16;
    const maxWidth = w - paddingX * 2;

    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (let i = 0; i < words.length; i++) {
      const test = current ? current + ' ' + words[i] : words[i];

      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = words[i];
      } else {
        current = test;
      }
    }

    if (current) {
      lines.push(current);
    }

    const lineHeight = 18;
    const totalHeight = lines.length * lineHeight;
    const startY = h / 2 - totalHeight / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, paddingX, startY + index * lineHeight);
    });

    return {
      dataUrl: canvas.toDataURL(),
      w,
      h,
    };
  }

  function handleMouseEnter(e) {
    if (busyRef.current || caught) return;

    busyRef.current = true;

    const bubble = bubbleRef.current;

    if (!bubble) {
      busyRef.current = false;
      return;
    }

    setDisintegrating(true);

    const rect = bubble.getBoundingClientRect();

    const originX = e.clientX - rect.left;
    const originY = e.clientY - rect.top;

    const snap = buildSnapshot(bubble);
    const { w, h } = snap;

    const layer = document.createElement('div');
    layer.className = 'tile-layer';
    bubble.appendChild(layer);

    const tileSize = 9;

    const cols = Math.ceil(w / tileSize);
    const rows = Math.ceil(h / tileSize);

    const maxDist = Math.sqrt(w * w + h * h);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * tileSize;
        const y = row * tileSize;

        const tile = document.createElement('div');

        tile.className = 'tile';

        tile.style.left = `${x}px`;
        tile.style.top = `${y}px`;
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;

        tile.style.backgroundImage = `url(${snap.dataUrl})`;
        tile.style.backgroundPosition = `${-x}px ${-y}px`;
        tile.style.backgroundSize = `${w}px ${h}px`;

        tile.style.opacity = '1';
        tile.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';

        layer.appendChild(tile);

        const cx = x + tileSize / 2;
        const cy = y + tileSize / 2;

        const dx = cx - originX;
        const dy = cy - originY;

        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const delay = (dist / maxDist) * 180 + Math.random() * 80;
        const duration = 480 + Math.random() * 280;

        const driftX =
          (dx / dist) * (28 + Math.random() * 46) +
          (Math.random() - 0.5) * 18;

        const driftY =
          (dy / dist) * (28 + Math.random() * 46) -
          (8 + Math.random() * 18);

        const rotation = (Math.random() - 0.5) * 130;

        setTimeout(() => {
          tile.style.transition =
            `transform ${duration}ms cubic-bezier(.2,.7,.2,1),
             opacity ${duration}ms ease-out`;

          tile.style.transform =
            `translate3d(${driftX}px, ${driftY}px, 0)
             rotate(${rotation}deg)`;

          tile.style.opacity = '0';
        }, delay);
      }
    }

    setTimeout(() => {
      if (layer && layer.parentNode) {
        layer.remove();
      }

      setCaught(true);
      setDisintegrating(false);
      busyRef.current = false;
    }, 720);
  }

  return (
    <div
      className={[
        'comment-bubble',
        disintegrating ? 'disintegrating' : '',
        caught ? 'show-badge' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      ref={bubbleRef}
      onMouseEnter={handleMouseEnter}
    >
      <span className="bubble-text">{text}</span>

      <div className="caught-badge">
        <span className="badge-dot" />
        <span className="badge-text">Flagged &amp; held back</span>
      </div>
    </div>
  );
}

export { CommentBubble, CAUGHT_COMMENTS };




export default function LoginPage() {
  const [mode, setMode] = useState('login');

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const isSignup = mode === 'signup';

  function validateSignup() {
    const cleanName = name.trim();
    const cleanHandle = handle.trim().replace(/^@+/, '');
    const cleanEmail = email.trim();

    if (cleanName.length < 2) {
      return 'Please enter your full name.';
    }

    if (!/^[A-Za-zÀ-ÿ\s.'-]+$/.test(cleanName)) {
      return 'Name can only contain letters, spaces, apostrophes or hyphens.';
    }

    if (cleanHandle.length < 3) {
      return 'Handle must be at least 3 characters.';
    }

    if (cleanHandle.length > 20) {
      return 'Handle must be 20 characters or less.';
    }

    if (!/^[A-Za-z0-9_]+$/.test(cleanHandle)) {
      return 'Handle can only contain letters, numbers and underscores.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(cleanEmail)) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.';
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Password must contain at least one special character.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setError('');

    if (isSignup) {
      const validationError = validateSignup();

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSubmitting(true);

    try {
      if (isSignup) {
        const cleanName = name.trim();
        const cleanHandle = handle.trim().replace(/^@+/, '');
        const cleanEmail = email.trim();

        await api.register(cleanName, cleanHandle, cleanEmail, password);

        setSubmitting(false);

        navigate('/check-email', {
          state: {
            email: cleanEmail,
          },
        });

        return;
      }

      const data = await api.login(email.trim(), password);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function switchMode(next) {
    if (submitting) return;
    setMode(next);
    setError('');
  }

  return (
    <div className="auth-page">
      <div className="form-panel">
        <div className="form-card">
          <div className="form-head">
            {isSignup ? (
              <>
                <h2>Create your account</h2>
                <p>Join Unsaid — post freely, flagged responsibly.</p>
              </>
            ) : (
              <>
                <h2>Welcome back</h2>
                <p>Sign in to keep your feed checked and safe.</p>
              </>
            )}
          </div>


          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-btn ${!isSignup ? 'active' : ''}`}
              onClick={() => switchMode('login')}
              disabled={submitting}
            >
              Log in
            </button>

            <button
              type="button"
              className={`toggle-btn ${isSignup ? 'active' : ''}`}
              onClick={() => switchMode('signup')}
              disabled={submitting}
            >
              Sign up
            </button>
          </div>

          {/* ERROR */}

          {error && <div className="error-message">{error}</div>}

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="field">
                <label htmlFor="name">Full name</label>

                <input
                  type="text"
                  id="name"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  disabled={submitting}
                />
              </div>
            )}

            {isSignup && (
              <div className="field">
                <label htmlFor="handle">Handle</label>

                <input
                  type="text"
                  id="handle"
                  placeholder="@thecooldood"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  disabled={submitting}
                />

                <div className="field-hint">
                  3–20 characters. Letters, numbers and underscores only.
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>

              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>

              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignup ? 8 : 1}
                disabled={submitting}
              />

              {isSignup && (
                <div className="field-hint">
                  Use 8+ characters with a number and a special character.
                </div>
              )}
            </div>

            {isSignup && (
              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>

                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={submitting}
                />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting
                ? isSignup
                  ? 'Creating account...'
                  : 'Logging in...'
                : isSignup
                  ? 'Create account'
                  : 'Log in'}
            </button>
          </form>

          {/* SWITCH */}

          {!isSignup ? (
            <div className="switch-line">
              New to Unsaid?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchMode('signup')}
              >
                Create an account
              </button>
            </div>
          ) : (
            <div className="switch-line">
              Already have an account?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchMode('login')}
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}