import { useEffect, useState } from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { api } from '../api/client.js';
import { Avatar } from './Profile.jsx';

export default function Stream({ reloadKey }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getStream()
      .then((data) => active && setPosts(Array.isArray(data) ? data : []))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [reloadKey]);

  if (loading) {
    return (
      <div className="card center small-pad">
        <Loader2 size={22} className="spin" aria-label="Loading" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="card error-banner">
        <AlertCircle size={18} strokeWidth={2.25} />
        <span>Stream error: {error}</span>
      </div>
    );
  }
  if (posts.length === 0) {
    return (
      <div className="card empty-state">
        <Inbox size={36} strokeWidth={1.75} />
        <p className="muted">No posts yet. Be the first to chirp!</p>
      </div>
    );
  }

  return (
    <div className="stream">
      {posts.map((p) => (
        <article key={p.id} className="card post">
          <div className="post-header">
            <Avatar src={p.authorPictureUrl} name={p.authorUsername} size={36} />
            <div className="post-meta">
              <strong>@{p.authorUsername}</strong>
              <time dateTime={p.createdAt} title={new Date(p.createdAt).toLocaleString()}>
                {formatRelative(p.createdAt)}
              </time>
            </div>
          </div>
          <p className="post-content">{p.content}</p>
        </article>
      ))}
    </div>
  );
}

function formatRelative(iso) {
  const date = new Date(iso);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString();
}
