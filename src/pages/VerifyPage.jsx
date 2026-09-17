import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './VerifyPage.css';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  // Prevent React StrictMode from sending the verification request twice
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing or invalid.');
      return;
    }

    api.verifyEmail(token)
      .then((data) => {
        setStatus('success');
        setMessage(
          data.message ||
            'Your email has been verified successfully!'
        );
      })
      .catch((error) => {
        setStatus('error');
        setMessage(
          error.message ||
            'This verification link is invalid or has expired.'
        );
      });
  }, [searchParams]);

  return (
    <div className="verify-page">
      <div className="verify-card">

        {status === 'verifying' && (
          <>
            <div className="verify-icon">
              ✉
            </div>

            <h1>Verifying your email...</h1>

            <p className="verify-main-text">
              Please wait while we verify your Unsaid account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verify-icon">
              ✓
            </div>

            <h1>Email verified!</h1>

            <p className="verify-main-text">
              {message}
            </p>

            <p className="verify-subtext">
              Your Unsaid account is now active. You can log in
              using the credentials you used when signing up.
            </p>

            <button
              className="verify-back-btn"
              onClick={() => navigate('/')}
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-icon">
              !
            </div>

            <h1>Verification failed</h1>

            <p className="verify-main-text">
              {message}
            </p>

            <p className="verify-subtext">
              Please make sure you are using the latest
              verification email.
            </p>

            <button
              className="verify-back-btn"
              onClick={() => navigate('/')}
            >
              Back to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}