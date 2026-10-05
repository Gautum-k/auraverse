import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { fmt, compact } from '../data';
import Cover from './Cover';
import Icon from './Icon';
import TrackMenu from './TrackMenu';

export default function TrackRow({ track, index, list, showPlays, playlistId, onEdit }) {
  const { play, artistOf, current, playing, liked, toggleLike } = useApp();
  const a = artistOf(track);
  const isCurrent = current?.id === track.id;
  const on = isCurrent && playing;
  return (
    <div className={`row${isCurrent ? ' current' : ''}`} onDoubleClick={() => play(track, list)}>
      <div className="row-idx">
        <span className="num">{on ? '♪' : index}</span>
        <button onClick={() => play(track, list)} aria-label={on ? `Pause ${track.title}` : `Play ${track.title}`}>
          <Icon name={on ? 'pause' : 'play'} size={20} />
        </button>
      </div>
      <div className="row-main">
        <div className="row-cover"><Cover seed={track.id} hue={a.hue} url={track.artworkUrl} /></div>
        <div>
          <div className="row-title">{track.title}</div>
          {a.id === 'me' ? <div className="row-sub">{a.name}</div> : <Link className="row-sub" to={`/artist/${a.id}`}>{a.name}</Link>}
        </div>
      </div>
      <div className="row-extra">{showPlays ? compact(track.plays) : track.album}</div>
      <button className={`like${liked.has(track.id) ? ' on' : ''}`} onClick={() => toggleLike(track.id)} aria-label="Like" aria-pressed={liked.has(track.id)}>
        <Icon name="heart" size={18} />
      </button>
      <div className="row-time">{fmt(track.duration)}</div>
      <TrackMenu track={track} playlistId={playlistId} onEdit={onEdit} />
    </div>
  );
}
