import { useAuth0 } from '@auth0/auth0-react';
import { Bird, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useCurrentUser } from './hooks/useCurrentUser.js';
import LoginButton from './components/LoginButton.jsx';
import LogoutButton from './components/LogoutButton.jsx';
import Profile from './components/Profile.jsx';
import PostForm from './components/PostForm.jsx';
import Stream from './components/Stream.jsx';
import UsernameSetup from './components/UsernameSetup.jsx';

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const { me, loading: meLoading, needsSetup, updateUsername } = useCurrentUser();
  const [reloadKey, setReloadKey] = useState(0);
  const handleNewPost = useCallback(() => setReloadKey((k) => k + 1), []);

  if (isLoading || (isAuthenticated && meLoading)) {
    return (
      <div className="container center">
        <Loader2 className="spin" size={28} aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Bird size={22} strokeWidth={2.25} />
          </span>
          <h1>Chirp</h1>
        </div>
        <div className="auth-controls">
          {isAuthenticated ? (
            <>
              <span className="hello">Hi, {me?.username || user?.name || user?.nickname}</span>
              <LogoutButton />
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </header>

      <main>
        {isAuthenticated && me && <Profile me={me} />}
        {isAuthenticated && me && !needsSetup && <PostForm onCreated={handleNewPost} />}
        <Stream reloadKey={reloadKey} />
      </main>

      <footer className="footer">
        <small>Secured by Auth0 · Spring Boot monolith + AWS Lambda microservices</small>
      </footer>

      {isAuthenticated && needsSetup && <UsernameSetup onSubmit={updateUsername} />}
    </div>
  );
}
