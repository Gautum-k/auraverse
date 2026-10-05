import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import Icon from './Icon';

export default function TrackMenu({ track, playlistId, onEdit }) {
  const { user, playlists, togglePlaylistTrack, createPlaylist, addToQueue, deleteTrack } = useApp();
  const [pos, setPos] = useState(null);
  const [view, setView] = useState('main');
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState('');
  const btn = useRef(null);
  const menu = useRef(null);
  const open = pos !== null;
  const mine = track.artistId === 'me';

  const close = () => {
    setPos(null);
    setView('main');
    setConfirm(false);
    setName('');
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!menu.current?.contains(e.target) && !btn.current?.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        btn.current?.focus();
      }
    };
    const onScroll = (e) => {
      if (!menu.current?.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggleOpen = () => {
    if (open) return close();
    const r = btn.current.getBoundingClientRect();
    const right = window.innerWidth - r.right;
    setPos(window.innerHeight - r.bottom > 320 ? { top: r.bottom + 4, right } : { bottom: window.innerHeight - r.top + 4, right });
  };

  const create = (e) => {
    e.preventDefault();
    const id = createPlaylist(name);
    togglePlaylistTrack(id, track.id);
    setName('');
  };

  return (
    <>
      <button ref={btn} className="more" onClick={toggleOpen} aria-label={`More options for ${track.title}`} aria-haspopup="menu" aria-expanded={open}>
        <Icon name="more" size={20} />
      </button>
      {open && (
        <div ref={menu} className="menu" role="menu" style={pos}>
          {view === 'main' && (
            <>
              <button role="menuitem" onClick={() => { addToQueue(track); close(); }}>Add to queue</button>
              {user ? (
                <button role="menuitem" onClick={() => setView('playlists')}>Add to playlist <span className="chev">›</span></button>
              ) : (
                <Link role="menuitem" to="/login">Log in to use playlists</Link>
              )}
              {playlistId && (
                <button role="menuitem" onClick={() => { togglePlaylistTrack(playlistId, track.id); close(); }}>Remove from this playlist</button>
              )}
              {mine && onEdit && (
                <button role="menuitem" onClick={() => { onEdit(track); close(); }}>Edit details</button>
              )}
              {mine && (
                <button role="menuitem" className="danger" onClick={() => (confirm ? (deleteTrack(track.id), close()) : setConfirm(true))}>
                  {confirm ? 'Click again to delete for good' : 'Delete track'}
                </button>
              )}
            </>
          )}
          {view === 'playlists' && (
            <>
              <button role="menuitem" className="back" onClick={() => setView('main')}>‹ Add to playlist</button>
              <form className="menu-new" onSubmit={create}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New playlist name" aria-label="New playlist name" />
                <button type="submit" aria-label="Create playlist and add track"><Icon name="plus" size={18} /></button>
              </form>
              <div className="menu-scroll">
                {playlists.length === 0 && <div className="menu-note">No playlists yet. Name one above.</div>}
                {playlists.map((pl) => {
                  const has = pl.trackIds.includes(track.id);
                  return (
                    <button role="menuitemcheckbox" aria-checked={has} key={pl.id} onClick={() => togglePlaylistTrack(pl.id, track.id)}>
                      <span className="grow">{pl.name}</span>
                      {has && <Icon name="check" size={16} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
