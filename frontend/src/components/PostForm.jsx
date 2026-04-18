import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { api } from '../api/client.js';

const MAX = 140;

export default function PostForm({ onCreated }) {
  const { getAccessTokenSilently } = useAuth0();
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const remaining = MAX - content.length;
  const overLimit = remaining < 0;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!content.trim() || overLimit) return;
    setBusy(true);
    try {
      const token = await getAccessTokenSilently();
      await api.createPost(content.trim(), token);
      setContent('');
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card post-form" onSubmit={submit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening? (140 chars max)"
        rows={3}
        aria-label="Post content"
      />
      <div className="post-form-row">
        <span className={`counter ${overLimit ? 'over' : ''}`}>{remaining}</span>
        <button className="btn primary" type="submit" disabled={busy || !content.trim() || overLimit}>
          {busy ? 'Posting…' : 'Chirp'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
