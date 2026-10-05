import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { hash } from '../data';
import Cover from './Cover';
import Icon from './Icon';

export default function Sidebar() {
  const nav = useNavigate();
  const { user, playlists, createPlaylist } = useApp();

  const addPlaylist = () => {
    if (!user) return nav('/login');
    nav(`/playlist/${createPlaylist()}`);
  };

  return (
    <aside className="side">
      <nav className="panel nav" aria-label="Main">
        <NavLink to="/" end className="brand">
          <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="#1ed760" />
            <path d="M8 12c5-2 11-1.5 16 1.2M9 17c4-1.5 9-1 13 1M11 21.5c3-.9 6-.6 9 .7" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </svg>
          <span>Auraverse</span>
        </NavLink>
        <NavLink to="/" end className="navlink"><Icon name="home" /><span>Home</span></NavLink>
        <NavLink to="/search" className="navlink"><Icon name="search" /><span>Search</span></NavLink>
      </nav>
      <nav className="panel lib" aria-label="Library">
        <div className="lib-head">
          <Icon name="library" /><span className="grow">Your library</span>
          <button className="lib-add" onClick={addPlaylist} aria-label="Create playlist" title="Create playlist"><Icon name="plus" size={20} /></button>
        </div>
        <NavLink to="/library" className="navlink"><Icon name="library" /><span>Library</span></NavLink>
        <NavLink to="/collabs" className="navlink"><Icon name="collab" /><span>Collab board</span></NavLink>
        <NavLink to="/upload" className="navlink"><Icon name="upload" /><span>Upload a track</span></NavLink>
        {playlists.length > 0 && (
          <div className="pl-list">
            {playlists.map((p) => (
              <NavLink to={`/playlist/${p.id}`} className="pl-item" key={p.id}>
                <div className="pl-cover"><Cover seed={p.id} hue={hash(p.id) % 360} /></div>
                <div className="pl-text">
                  <div className="pl-name">{p.name}</div>
                  <div className="pl-sub">Playlist · {p.trackIds.length} {p.trackIds.length === 1 ? 'song' : 'songs'}</div>
                </div>
              </NavLink>
            ))}
          </div>
        )}
        <div style={{ padding: '16px 12px 4px', fontSize: '11px', color: 'var(--sub)' }}>
          Previews and artwork from Apple
        </div>
      </nav>
    </aside>
  );
}
