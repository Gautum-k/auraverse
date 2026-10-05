import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context';
import { hash } from '../data';
import Cover from '../components/Cover';
import Icon from '../components/Icon';
import TrackRow from '../components/TrackRow';

export default function Playlist() {
  const { id } = useParams();
  const nav = useNavigate();
  const { playlists, allTracks, renamePlaylist, deletePlaylist, play, current, playing } = useApp();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState(false);

  const pl = playlists.find((p) => p.id === id);
  if (!pl) {
    return <div className="view"><p className="empty">That playlist doesn’t exist. <Link to="/library">Go to your library</Link></p></div>;
  }

  const hue = hash(pl.id) % 360;
  const list = pl.trackIds.map((tid) => allTracks.find((t) => t.id === tid)).filter(Boolean);
  const playingHere = playing && list.some((t) => t.id === current?.id);

  const save = (e) => {
    e.preventDefault();
    renamePlaylist(pl.id, name);
    setRenaming(false);
  };
  const remove = () => {
    if (!confirm) return setConfirm(true);
    deletePlaylist(pl.id);
    nav('/library');
  };

  return (
    <div className="view" style={{ '--tint': `hsl(${hue} 40% 26%)` }}>
      <div className="hero">
        <div className="hero-art sq"><Cover seed={pl.id} hue={hue}><span className="initials big">{pl.name[0].toUpperCase()}</span></Cover></div>
        <div className="grow">
          <div className="hero-kind">Playlist</div>
          {renaming ? (
            <form onSubmit={save} className="rename">
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} aria-label="Playlist name" maxLength="60" />
              <button type="submit" className="pill green">Save</button>
              <button type="button" className="txt-btn" onClick={() => setRenaming(false)}>Cancel</button>
            </form>
          ) : (
            <h1 className="hero-name editable">
              <button onClick={() => { setName(pl.name); setRenaming(true); }} title="Rename playlist">{pl.name}</button>
            </h1>
          )}
          <div className="hero-meta">{list.length} {list.length === 1 ? 'song' : 'songs'}</div>
        </div>
      </div>

      <div className="actions">
        <button className="play-big" onClick={() => list[0] && play(list[0], list)} disabled={!list.length} aria-label={playingHere ? 'Pause' : 'Play'}>
          <Icon name={playingHere ? 'pause' : 'play'} size={28} />
        </button>
        <button className="pill outline" onClick={() => { setName(pl.name); setRenaming(true); }}>Rename</button>
        <button className={`pill outline${confirm ? ' danger-pill' : ''}`} onClick={remove} onBlur={() => setConfirm(false)}>
          {confirm ? 'Click again to delete' : 'Delete playlist'}
        </button>
      </div>

      {list.length ? (
        <div className="list">
          {list.map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={list} playlistId={pl.id} />)}
        </div>
      ) : (
        <p className="empty">This playlist is empty. Find songs in <Link to="/search">Search</Link>, then use the ⋯ menu on a song and pick “Add to playlist”.</p>
      )}
    </div>
  );
}
