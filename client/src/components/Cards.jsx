import { Link } from 'react-router-dom';
import { useApp } from '../context';
import Cover from './Cover';
import Icon from './Icon';
import { hash } from '../data';

export function Shelf({ title, to, children }) {
  return (
    <section className="shelf">
      <div className="shelf-head">
        <h2>{title}</h2>
        {to && <Link to={to}>Show all</Link>}
      </div>
      <div className="shelf-row">{children}</div>
    </section>
  );
}

export function TrackCard({ track, list }) {
  const { play, artistOf, current, playing } = useApp();
  const a = artistOf(track);
  const on = current?.id === track.id && playing;
  return (
    <div className="card">
      <div className="card-art">
        <Cover seed={track.id} hue={a.hue} url={track.artworkUrl} />
        <button className={`fab${on ? ' on' : ''}`} onClick={() => play(track, list)} aria-label={on ? `Pause ${track.title}` : `Play ${track.title}`}>
          <Icon name={on ? 'pause' : 'play'} />
        </button>
      </div>
      <div className="card-title">{track.title}</div>
      <div className="card-sub">{a.name}</div>
    </div>
  );
}

export function ArtistCard({ artist }) {
  const initials = artist.name ? artist.name.split(' ').map((w) => w[0]).join('').slice(0, 2) : 'A';
  return (
    <Link to={`/artist/${artist.id}`} className="card">
      <div className="card-art">
        <Cover seed={artist.id} hue={artist.hue} url={artist.avatarUrl} round>
          {!artist.avatarUrl && <span className="initials">{initials}</span>}
        </Cover>
      </div>
      <div className="card-title">{artist.name}</div>
      <div className="card-sub">{artist.genre}</div>
    </Link>
  );
}

export function PlaylistCard({ playlist }) {
  const hue = hash(playlist.id) % 360;
  return (
    <Link to={`/playlist/${playlist.id}`} className="card">
      <div className="card-art">
        <Cover seed={playlist.id} hue={hue}>
          <span className="initials">{playlist.name[0].toUpperCase()}</span>
        </Cover>
      </div>
      <div className="card-title">{playlist.name}</div>
      <div className="card-sub">{playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'song' : 'songs'}</div>
    </Link>
  );
}
