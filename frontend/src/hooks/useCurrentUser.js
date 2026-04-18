import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';


export function useCurrentUser() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await api.getMe(token);
        if (active) setMe(data);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [isAuthenticated, getAccessTokenSilently]);

  const updateUsername = useCallback(async (username) => {
    const token = await getAccessTokenSilently();
    const updated = await api.updateUsername(username, token);
    setMe(updated);
    return updated;
  }, [getAccessTokenSilently]);

  const needsSetup = Boolean(me && !me.onboarded);

  return { me, loading, error, needsSetup, updateUsername };
}
