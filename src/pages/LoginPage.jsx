import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './LoginPage.css';

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
        ? await api.register(name, handle, email, password)
        : await api.login(email, password);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="brand-panel">
        <div className="wordmark">
          <div className="wordmark-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          Unsaid
        </div>

        <div className="brand-copy">
          <h1 className="tagline">
            Say what you mean.<br />Not what <em>hurts</em>.
          </h1>
          <p className="subcopy">
            Unsaid reads every post and comment before it reaches anyone else — catching
            cyberbullying and unsafe language, quietly, before it does damage.
          </p>

          <div className="trail">
            <div className="trail-bubble caught">
              <span className="tag">Caught before posting</span>
              "you're so stupid, nobody wants you here"
            </div>
            <div className="trail-arrow">↓ flagged &amp; held back</div>
            <div className="trail-bubble rewritten">
              <span className="tag">Feed stays clear</span>
              Only checked, safe posts reach your friends.
            </div>
          </div>
        </div>

        <div className="brand-foot">© 2026 Unsaid — a safer space to post.</div>
      </div>

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
            <button type="button" className={`toggle-btn ${!isSignup ? 'active' : ''}`} onClick={() => setMode('login')}>
              Log in
            </button>
            <button type="button" className={`toggle-btn ${isSignup ? 'active' : ''}`} onClick={() => setMode('signup')}>
              Sign up
            </button>
          </div>

          {error && <div style={{ color: '#e5484d', fontSize: '13px', marginBottom: '10px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input type="text" id="name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}

            {isSignup && (
              <div className="field">
                <label htmlFor="handle">Handle</label>
                <input type="text" id="handle" placeholder="@thecooldood" value={handle} onChange={(e) => setHandle(e.target.value)} required />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {isSignup && <div className="field-hint">Use 8+ characters with a number and a symbol.</div>}
            </div>

            <button type="submit" className="submit-btn">
              {isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          {!isSignup ? (
            <div className="switch-line">
              New to Unsaid?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }}>
                Create an account
              </a>
            </div>
          ) : (
            <div className="switch-line">
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>
                Log in
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}