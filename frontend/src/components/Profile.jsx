import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function Profile() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await api.getMe(token);
        setMe(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (error) return <div className="card error">Profile error: {error}</div>;
  if (!me) return null;

  return (
    <div className="card profile">
      <img src={me.pictureUrl} alt="" className="avatar" onError={(e) => (e.target.style.display = 'none')} />
      <div>
        <strong>{me.username}</strong>
        <small>{me.email}</small>
        <small className="muted">sub: {me.auth0Subject}</small>
      </div>
    </div>
  );
}
