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

    /* Bubble background */
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

    /* Text */
    ctx.fillStyle = '#F3C7C7';
    ctx.font = '13.5px Inter, sans-serif';
    ctx.textBaseline = 'middle';

    const paddingX = 16;
    const maxWidth = w - paddingX * 2;

    const words = text.split(' ');
    const lines = [];

    let current = '';

    for (let i = 0; i < words.length; i++) {
      const test = current
        ? current + ' ' + words[i]
        : words[i];

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

    const startY =
      h / 2 -
      totalHeight / 2 +
      lineHeight / 2;

    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        paddingX,
        startY + index * lineHeight
      );
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

    /*
      Hide the original text immediately.

      This is the important fix for the "double text /
      ghost text" glitch during disintegration.
    */
    setDisintegrating(true);

    const rect = bubble.getBoundingClientRect();

    const originX = e.clientX - rect.left;
    const originY = e.clientY - rect.top;

    const snap = buildSnapshot(bubble);

    const { w, h } = snap;

    /* Create tile layer */
    const layer = document.createElement('div');

    layer.className = 'tile-layer';

    bubble.appendChild(layer);

    const tileSize = 9;

    const cols = Math.ceil(w / tileSize);
    const rows = Math.ceil(h / tileSize);

    const maxDist = Math.sqrt(
      w * w + h * h
    );

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

        tile.style.backgroundImage =
          `url(${snap.dataUrl})`;

        tile.style.backgroundPosition =
          `${-x}px ${-y}px`;

        tile.style.backgroundSize =
          `${w}px ${h}px`;

        tile.style.opacity = '1';

        tile.style.transform =
          'translate3d(0, 0, 0) rotate(0deg)';

        layer.appendChild(tile);

        /* Tile center */
        const cx = x + tileSize / 2;
        const cy = y + tileSize / 2;

        const dx = cx - originX;
        const dy = cy - originY;

        const dist =
          Math.sqrt(dx * dx + dy * dy) || 1;

        /*
          Tiles farther from the cursor start
          slightly later.
        */
        const delay =
          (dist / maxDist) * 180 +
          Math.random() * 80;

        const duration =
          480 +
          Math.random() * 280;

        /*
          Push pieces away from cursor.
        */
        const driftX =
          (dx / dist) *
            (28 + Math.random() * 46) +
          (Math.random() - 0.5) * 18;

        const driftY =
          (dy / dist) *
            (28 + Math.random() * 46) -
          (8 + Math.random() * 18);

        const rotation =
          (Math.random() - 0.5) * 130;

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

    /*
      Wait until the pieces have disappeared,
      then replace them with the caught state.
    */
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

      <span className="bubble-text">
        {text}
      </span>

      <div className="caught-badge">
        <span className="badge-dot" />

        <span className="badge-text">
          Flagged &amp; held back
        </span>
      </div>

    </div>
  );
}

export default function LoginPage() {

  const [mode, setMode] = useState('login');

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const navigate = useNavigate();

  const isSignup = mode === 'signup';

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');

    try {

      const data = isSignup
        ? await api.register(
            name,
            handle,
            email,
            password
          )
        : await api.login(
            email,
            password
          );

      localStorage.setItem(
        'token',
        data.token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">

      {/* ================= LEFT BRAND PANEL ================= */}

      <div className="brand-panel">
        <div className="wordmark">
          <img
          src="/logo.png"
          alt="Unsaid"
          className="unsaid-logo"
          />

          <span>Unsaid</span>
          </div>


        {/* Main left-side content */}

        <div className="brand-copy">

          <h1 className="tagline">
            Say what you mean.
            <br />
            Not what <em>hurts</em>.
          </h1>


          <div className="trail">

            {CAUGHT_COMMENTS.map((text) => (
              <CommentBubble
                key={text}
                text={text}
              />
            ))}

            <p className="trail-hint">
              Hover a comment to see it caught.
            </p>

          </div>

        </div>


        <div className="brand-foot">
          A safer space to say what matters.
        </div>

      </div>


      {/* ================= RIGHT FORM PANEL ================= */}

      <div className="form-panel">

        <div className="form-card">

          <div className="form-head">

            {isSignup ? (
              <>
                <h2>Create your account</h2>

                <p>
                  Join Unsaid — post freely,
                  flagged responsibly.
                </p>
              </>
            ) : (
              <>
                <h2>Welcome back</h2>

                <p>
                  Sign in to keep your feed
                  checked and safe.
                </p>
              </>
            )}

          </div>


          {/* Login / Signup toggle */}

          <div className="toggle-row">

            <button
              type="button"
              className={`toggle-btn ${
                !isSignup ? 'active' : ''
              }`}
              onClick={() => setMode('login')}
            >
              Log in
            </button>

            <button
              type="button"
              className={`toggle-btn ${
                isSignup ? 'active' : ''
              }`}
              onClick={() => setMode('signup')}
            >
              Sign up
            </button>

          </div>


          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            {/* Name */}

            {isSignup && (
              <div className="field">

                <label htmlFor="name">
                  Full name
                </label>

                <input
                  type="text"
                  id="name"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />

              </div>
            )}


            {/* Handle */}

            {isSignup && (
              <div className="field">

                <label htmlFor="handle">
                  Handle
                </label>

                <input
                  type="text"
                  id="handle"
                  placeholder="@thecooldood"
                  value={handle}
                  onChange={(e) =>
                    setHandle(e.target.value)
                  }
                  required
                />

              </div>
            )}


            {/* Email */}

            <div className="field">

              <label htmlFor="email">
                Email
              </label>

              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>


            {/* Password */}

            <div className="field">

              <label htmlFor="password">
                Password
              </label>

              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              {isSignup && (
                <div className="field-hint">
                  Use 8+ characters with a
                  number and a symbol.
                </div>
              )}

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="submit-btn"
            >
              {isSignup
                ? 'Create account'
                : 'Log in'}
            </button>

          </form>


          {/* Bottom switch */}

          {!isSignup ? (

            <div className="switch-line">

              New to Unsaid?{' '}

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMode('signup');
                }}
              >
                Create an account
              </a>

            </div>

          ) : (

            <div className="switch-line">

              Already have an account?{' '}

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMode('login');
                }}
              >
                Log in
              </a>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}