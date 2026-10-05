import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { fmt } from '../data';
import Cover from '../components/Cover';
import Icon from '../components/Icon';

function Line({ track, onRemove, onPlay }) {
  const { artistOf } = useApp();
  const a = artistOf(track);
  return (
    <div className="row q-row">
      <div className="row-main">
        <div className="row-cover"><Cover seed={track.id} hue={a.hue} /></div>
        <div>
          <div className="row-title">{track.title}</div>
          <div className="row-sub">{a.name}</div>
        </div>
      </div>
      <div className="row-time">{fmt(track.duration)}</div>
      {onPlay && <button className="more" style={{ opacity: 1 }} onClick={onPlay} aria-label={`Play ${track.title}`}><Icon name="play" size={20} /></button>}
      {onRemove && <button className="txt-btn sm" onClick={onRemove}>Remove</button>}
    </div>
  );
}

export default function Queue() {
  const { current, upNext, queue, removeFromQueue, clearQueue, play } = useApp();
  const i = current ? queue.findIndex((t) => t.id === current.id) : -1;
  const following = i === -1 ? [] : [...queue.slice(i + 1), ...queue.slice(0, i)].slice(0, 12);

  return (
    <div className="view" style={{ '--tint': 'hsl(200 30% 24%)' }}>
      <div className="page-head"><h1>Queue</h1></div>

      <h2 className="sec">Now playing</h2>
      {current ? <Line track={current} /> : <p className="empty">Nothing is playing. Pick a song from <Link to="/">Home</Link> or <Link to="/search">Search</Link>.</p>}

      {upNext.length > 0 && (
        <>
          <div className="shelf-head sec-head">
            <h2 className="sec">Next in queue</h2>
            <button className="txt-btn" onClick={clearQueue}>Clear queue</button>
          </div>
          {upNext.map((t, idx) => <Line key={`${t.id}-${idx}`} track={t} onRemove={() => removeFromQueue(idx)} />)}
        </>
      )}

      {following.length > 0 && (
        <>
          <h2 className="sec">Next from this list</h2>
          {following.map((t) => <Line key={t.id} track={t} onPlay={() => play(t, queue)} />)}
        </>
      )}
      {current && upNext.length === 0 && following.length === 0 && <p className="empty">Nothing else is lined up. Use “Add to queue” from the ⋯ menu on any song.</p>}
    </div>
  );
}
