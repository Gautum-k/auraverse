import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context';
import { compact } from '../data';
import Cover from '../components/Cover';
import Icon from '../components/Icon';
import TrackRow from '../components/TrackRow';

export default function Artist() {
  const { id } = useParams();
  const nav = useNavigate();
  const { artists, allTracks, play, current, playing, following, toggleFollow, user } = useApp();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState('');

  const artist = artists.find((a) => a.id === id);
  if (!artist) {
    return (
      <div className="view"><p className="empty">That artist doesn’t exist. <Link to="/search">Back to search</Link></p></div>
    );
  }

  const list = allTracks.filter((t) => t.artistId === artist.id).sort((a, b) => b.plays - a.plays);
  const isFollowing = following.has(artist.id);
  const playingHere = playing && list.some((t) => t.id === current?.id);
  const initials = artist.name.split(' ').map((w) => w[0]).join('').slice(0, 2);

  const startCollab = () => (user ? setOpen((o) => !o) : nav('/login'));
  const send = (e) => {
    e.preventDefault();
    setSent(true);
    setOpen(false);
  };

  return (
    <div className="view" style={{ '--tint': `hsl(${artist.hue} 45% 28%)` }}>
      <div className="hero">
        <div className="hero-art"><Cover seed={artist.id} hue={artist.hue} round><span className="initials big">{initials}</span></Cover></div>
        <div>
          <div className="hero-kind">Artist</div>
          <h1 className="hero-name">{artist.name}</h1>
          <div className="hero-meta">{compact(artist.followers)} followers · {artist.genre} · {artist.city}</div>
        </div>
      </div>

      <div className="actions">
        <button className="play-big" onClick={() => list[0] && play(list[0], list)} aria-label={playingHere ? 'Pause' : 'Play'}>
          <Icon name={playingHere ? 'pause' : 'play'} size={28} />
        </button>
        <button className="pill outline" onClick={() => toggleFollow(artist.id)} aria-pressed={isFollowing}>
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        <button className="pill outline" onClick={startCollab} disabled={sent}>
          {sent ? 'Request sent' : 'Request a collab'}
        </button>
      </div>

      {open && (
        <form className="panel-form" onSubmit={send}>
          <label htmlFor="msg">Message to {artist.name}</label>
          <textarea id="msg" required rows="3" value={msg} onChange={(e) => setMsg(e.target.value)}
            placeholder="Say what you play, what you have in mind and when you are free." />
          <div className="form-actions">
            <button type="button" className="txt-btn" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="pill green">Send request</button>
          </div>
        </form>
      )}

      <h2 className="sec">Popular</h2>
      <div className="list">
        {list.map((t, i) => <TrackRow key={t.id} track={t} index={i + 1} list={list} showPlays />)}
      </div>

      <div className="two-col">
        <div>
          <h2 className="sec">About</h2>
          <p className="about">{artist.bio}</p>
        </div>
        <div>
          <h2 className="sec">Open to collaborate</h2>
          <p className="about">{artist.looking}.</p>
        </div>
      </div>
    </div>
  );
}
