import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context';
import TrackRow from '../components/TrackRow';
import { fetchTracksApi } from '../api';

export default function Category() {
  const { type, value } = useParams();
  const { allTracks } = useApp();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchTracksApi({ [type]: value })
      .then((res) => {
        if (active) {
          setTracks(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          // Fallback to filtering allTracks locally
          const valLower = value.toLowerCase();
          const filtered = allTracks.filter((t) => {
            const fieldVal = (t[type] || '').toString().toLowerCase();
            return fieldVal === valLower;
          });
          setTracks(filtered);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [type, value, allTracks]);

  const displayTitle = value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Category';

  return (
    <div className="view" style={{ '--tint': 'hsl(210 30% 20%)' }}>
      <div className="page-head">
        <div>
          <span style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--sub)', letterSpacing: '0.05em' }}>
            {type}
          </span>
          <h1 style={{ margin: '4px 0 0' }}>{displayTitle}</h1>
        </div>
      </div>

      {loading ? (
        <p className="empty">Loading tracks...</p>
      ) : tracks.length === 0 ? (
        <p className="empty">
          No tracks found in {displayTitle}. Explore more on <Link to="/search">Search</Link>.
        </p>
      ) : (
        <div className="track-list" style={{ marginTop: '20px' }}>
          {tracks.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} list={tracks} />
          ))}
        </div>
      )}
    </div>
  );
}
