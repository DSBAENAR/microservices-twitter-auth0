import { useAuth0 } from '@auth0/auth0-react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const { logout } = useAuth0();
  return (
    <button
      className="btn ghost"
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      <LogOut size={16} strokeWidth={2.25} />
      <span>Log out</span>
    </button>
  );
}
