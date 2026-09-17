import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyPage.css';

export default function CheckEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';

  return (
    <div className="verify-page">
      <div className="verify-card">

        <div className="verify-icon">
          ✉
        </div>

        <h1>Account created!</h1>

        <p className="verify-main-text">
          Your Unsaid account has been created successfully.
        </p>

        {email && (
          <p className="verify-email">
            {email}
          </p>
        )}

        <p className="verify-subtext">
          We've sent a verification link to your email.
          Click the link to activate your account.
          The link will expire in 1 hour.
        </p>

        <button
          className="verify-back-btn"
          onClick={() => navigate('/')}
        >
          Go to Login
        </button>

      </div>
    </div>
  );
}