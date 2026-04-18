import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

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
    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (loading) return <div className="card"><p>Loading stream…</p></div>;
  if (error) return <div className="card error">Stream error: {error}</div>;
  if (posts.length === 0) return <div className="card"><p className="muted">No posts yet. Be the first!</p></div>;

  return (
    <div className="stream">
      {posts.map((p) => (
        <article key={p.id} className="card post">
          <header>
            <img
              src={p.authorPictureUrl}
              alt=""
              className="avatar small"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <strong>@{p.authorUsername}</strong>
            <time dateTime={p.createdAt}>{new Date(p.createdAt).toLocaleString()}</time>
          </header>
          <p>{p.content}</p>
        </article>
      ))}
    </div>
  );
}
