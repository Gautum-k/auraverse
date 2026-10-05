import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { SERVER_BASE } from '../api';
import Icon from './Icon';

export default function Topbar({ solid }) {
  const nav = useNavigate();
  const { user, logout } = useApp();
  const avatarSrc = user?.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${SERVER_BASE}${user.avatarUrl}`) : '';
  const initial = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <header className={`topbar${solid ? ' solid' : ''}`}>
      <div className="hist">
        <button onClick={() => nav(-1)} aria-label="Go back"><Icon name="left" /></button>
        <button onClick={() => nav(1)} aria-label="Go forward"><Icon name="right" /></button>
      </div>
      <div className="acct">
        {user ? (
          <>
            <Link to="/edit-profile" className="who" title="Edit Profile" style={{ overflow: 'hidden', padding: 0 }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                initial
              )}
            </Link>
            <Link to="/edit-profile" className="txt-btn">Edit profile</Link>
            <button className="pill white" onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login?mode=register" className="txt-btn">Sign up</Link>
            <Link to="/login" className="pill white">Log in</Link>
          </>
        )}
      </div>
    </header>
  );
}
