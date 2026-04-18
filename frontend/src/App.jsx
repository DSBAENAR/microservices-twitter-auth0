import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './components/LoginButton.jsx';
import LogoutButton from './components/LogoutButton.jsx';
import Profile from './components/Profile.jsx';
import PostForm from './components/PostForm.jsx';
import Stream from './components/Stream.jsx';
import { useState, useCallback } from 'react';

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [reloadKey, setReloadKey] = useState(0);
  const handleNewPost = useCallback(() => setReloadKey((k) => k + 1), []);

  if (isLoading) return <div className="container"><p>Loading…</p></div>;

  return (
    <div className="container">
      <header className="header">
        <h1>🐦 Chirp</h1>
        <div className="auth-controls">
          {isAuthenticated ? (
            <>
              <span className="hello">Hi, {user?.name || user?.nickname}</span>
              <LogoutButton />
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </header>

      <main>
        {isAuthenticated && <Profile />}
        {isAuthenticated && <PostForm onCreated={handleNewPost} />}
        <Stream reloadKey={reloadKey} />
      </main>

      <footer className="footer">
        <small>Secured by Auth0 · Spring Boot monolith + AWS Lambda microservices</small>
      </footer>
    </div>
  );
}
