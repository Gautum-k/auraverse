import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { fmt } from '../data';
import { SERVER_BASE } from '../api';
import Cover from './Cover';
import Icon from './Icon';

export default function PlayerBar() {
  const { current, playing, toggle, next, prev, elapsed, setElapsed, artistOf, liked, toggleLike } = useApp();
  const [vol, setVol] = useState(70);
  const audioRef = useRef(null);
  const playCountLoggedRef = useRef(null);

  const a = current ? artistOf(current) : null;
  const rawUrl = current?.source === 'itunes' ? (current?.previewUrl || current?.audioUrl || '') : (current?.audioUrl || current?.previewUrl || '');
  const audioSrc = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${SERVER_BASE}${rawUrl}`) : '';
  const isPreview = current?.source === 'itunes' || !!current?.previewUrl;
  const dur = current?.durationSeconds || current?.duration || 180;
  const pct = current && dur ? Math.min(100, (elapsed / dur) * 100) : 0;

  // Handle play/pause toggle & source change on audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (current && audioSrc) {
      if (audio.src !== audioSrc) {
        audio.src = audioSrc;
        audio.currentTime = 0;
        playCountLoggedRef.current = null;
      }
      if (playing) {
        audio.play().catch((err) => console.log('Audio playback notice:', err.message));
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }
  }, [current, playing, audioSrc]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
  }, [vol]);

  // Handle timeupdate and track ending
  const handleTimeUpdate = (e) => {
    const curTime = Math.floor(e.target.currentTime);
    setElapsed(curTime);

    // Track play count increment after 10 seconds of play
    if (curTime >= 10 && current?.id && playCountLoggedRef.current !== current.id) {
      playCountLoggedRef.current = current.id;
      // fire silent play count API call
      fetch(`${SERVER_BASE}/api/tracks/${current.id}/play`, { method: 'POST' }).catch(() => {});
    }
  };

  const handleEnded = () => {
    next();
  };

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    setElapsed(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  return (
    <footer className="player">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      <div className="np">
        {current ? (
          <>
            <div className="np-cover"><Cover seed={current.id} hue={a?.hue || 150} url={current.artworkUrl} /></div>
            <div className="np-text">
              <div className="np-title">
                {current.title}
                {isPreview && (
                  <span style={{ marginLeft: '8px', fontSize: '10px', background: '#333', color: '#b3b3b3', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Preview
                  </span>
                )}
              </div>
              {a?.id === 'me' ? (
                <div className="np-artist">{a?.name || 'You'}</div>
              ) : (
                <Link to={`/artist/${a?.id}`} className="np-artist">{a?.name || 'Artist'}</Link>
              )}
            </div>
            <button
              className={`like${liked.has(current.id) ? ' on' : ''}`}
              onClick={() => toggleLike(current.id)}
              aria-label="Like"
              aria-pressed={liked.has(current.id)}
            >
              <Icon name="heart" size={18} />
            </button>
          </>
        ) : (
          <div className="np-idle">Pick a track to start listening</div>
        )}
      </div>

      <div className="ctrl">
        <div className="btns">
          <button onClick={prev} aria-label="Previous" disabled={!current}><Icon name="prev" /></button>
          <button className="go" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} disabled={!current}>
            <Icon name={playing ? 'pause' : 'play'} />
          </button>
          <button onClick={next} aria-label="Next" disabled={!current}><Icon name="next" /></button>
        </div>
        <div className="scrub">
          <span>{fmt(elapsed)}</span>
          <input
            type="range" className="bar" min="0" max={dur} value={elapsed}
            disabled={!current} aria-label="Seek"
            style={{ '--p': `${pct}%` }}
            onChange={handleSeek}
          />
          <span>{current ? fmt(dur) : '0:00'}</span>
        </div>
      </div>

      <div className="vol">
        <Link to="/queue" className="qbtn" aria-label="Queue" title="Queue"><Icon name="queue" size={20} /></Link>
        <Icon name="volume" size={20} />
        <input type="range" className="bar" min="0" max="100" value={vol} aria-label="Volume"
          style={{ '--p': `${vol}%` }} onChange={(e) => setVol(Number(e.target.value))} />
      </div>
    </footer>
  );
}
