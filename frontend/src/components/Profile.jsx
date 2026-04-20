import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { User as UserIcon } from 'lucide-react';

export default function Profile({ me }) {
  const { user: auth0User } = useAuth0();
  if (!me) return null;
  const displayName = me.username;
  const email = me.email || auth0User?.email;
  const picture = me.pictureUrl || auth0User?.picture;

  return (
    <div className="card profile">
      <Avatar src={picture} name={displayName} />
      <div className="profile-info">
        <strong className="profile-name">@{displayName}</strong>
        {email && <span className="muted">{email}</span>}
      </div>
    </div>
  );
}

function Avatar({ src, name, size = 44 }) {
  const [broken, setBroken] = useState(!src);
  if (broken) {
    return (
      <span className="avatar placeholder" style={{ width: size, height: size }} aria-hidden="true">
        <UserIcon size={size * 0.55} strokeWidth={2} />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name ? `${name}'s avatar` : ''}
      className="avatar"
      style={{ width: size, height: size }}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}

export { Avatar };
