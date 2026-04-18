import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { AlertCircle, ArrowRight, Bird, Loader2 } from 'lucide-react';

const USERNAME_RE = /^[A-Za-z0-9_]{3,30}$/;

export default function UsernameSetup({ onSubmit }) {
  const { user } = useAuth0();
  const [value, setValue] = useState(suggest(user));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!USERNAME_RE.test(trimmed)) {
      setError('3–30 chars, letters, numbers or underscore only');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="setup-title">
      <div className="modal card">
        <div className="setup-hero">
          <span className="brand-mark large" aria-hidden="true">
            <Bird size={28} strokeWidth={2.25} />
          </span>
          <h2 id="setup-title">Welcome to Chirp</h2>
          <p className="muted">Pick a username — this is how others will see you.</p>
        </div>

        <form onSubmit={submit}>
          <label className="input-group">
            <span className="at">@</span>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="your_username"
              autoFocus
              autoComplete="off"
              maxLength={30}
              disabled={busy}
              aria-label="Username"
            />
          </label>

          {error && (
            <div className="error-inline">
              <AlertCircle size={14} strokeWidth={2.25} />
              <span>{error}</span>
            </div>
          )}

          <div className="setup-actions">
            <button className="btn primary full" type="submit" disabled={busy || !value.trim()}>
              {busy ? (
                <>
                  <Loader2 size={16} className="spin" strokeWidth={2.25} />
                  <span>Saving</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={16} strokeWidth={2.25} />
                </>
              )}
            </button>
          </div>

          <p className="muted small hint">You can change it later from your profile.</p>
        </form>
      </div>
    </div>
  );
}

function suggest(user) {
  if (!user) return '';
  const source = user.nickname || user.name || user.email?.split('@')[0] || '';
  return source.replace(/[^A-Za-z0-9_]/g, '').slice(0, 30);
}
