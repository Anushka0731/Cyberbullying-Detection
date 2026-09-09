import './StatusPill.css';

export default function StatusPill({ status }) {
  if (status === 'scanning') {
    return (
      <span className="status-pill scanning">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        </svg>
        Scanning...
      </span>
    );
  }

  if (status === 'flagged') {
    return (
      <span className="status-pill flagged">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1.5-2 5-2 5 2 8.5 2 3.5-1.5 3.5-1.5V4S19 5.5 17.5 5.5 12.5 4 9 4 4 5.5 4 5.5V21" />
        </svg>
        Flagged
      </span>
    );
  }

  return (
    <span className="status-pill safe">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      Safe
    </span>
  );
}