import { useAuth0 } from '@auth0/auth0-react';
import { LogIn } from 'lucide-react';

export default function LoginButton() {
  const { loginWithRedirect } = useAuth0();
  return (
    <button className="btn primary" onClick={() => loginWithRedirect()}>
      <LogIn size={16} strokeWidth={2.25} />
      <span>Log in</span>
    </button>
  );
}
