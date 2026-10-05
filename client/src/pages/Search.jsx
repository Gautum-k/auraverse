import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { GENRES, LANGUAGES, MOODS, TYPES } from '../data';
import { ArtistCard } from '../components/Cards';
import TrackRow from '../components/TrackRow';

export default function Search() {
  const { allTracks, artists, artistOf } = useApp();
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();

  const foundTracks = allTracks.filter((t) =>
    [t.title, t.genre, t.language, t.mood, t.type, t.album, artistOf(t).name]
      .filter(Boolean)
      .some((s) => s.toLowerCase().includes(term))
  );

  const foundArtists = artists.filter((a) =>
    [a.name, a.genre, a.city].filter(Boolean).some((s) => s.toLowerCase().includes(term))
  );

  return (
    <div className="view" style={{ '--tint': 'hsl(265 20% 22%)' }}>
      <div className="searchbox">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to listen to?"
          aria-label="Search songs, artists and genres"
        />
      </div>

      {!term ? (
        <>
          <h2 className="sec">Browse by Genre</h2>
          <div className="genres" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {GENRES.map((g, idx) => (
              <Link
                key={g}
                to={`/category/genre/${encodeURIComponent(g)}`}
                className="genre"
                style={{
                  background: `hsl(${(idx * 35 + 150) % 360} 55% 32%)`,
                  padding: '16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                {g}
              </Link>
            ))}
          </div>

          <h2 className="sec" style={{ marginTop: '24px' }}>Browse by Language</h2>
          <div className="chips" style={{ marginBottom: '24px' }}>
            {LANGUAGES.map((lang) => (
              <Link
                key={lang}
                to={`/category/language/${encodeURIComponent(lang)}`}
                className="chip"
                style={{ textDecoration: 'none' }}
              >
                {lang}
              </Link>
            ))}
          </div>

          <h2 className="sec">Browse by Mood</h2>
          <div className="chips" style={{ marginBottom: '24px' }}>
            {MOODS.map((m) => (
              <Link
                key={m}
                to={`/category/mood/${encodeURIComponent(m)}`}
                className="chip"
                style={{ textDecoration: 'none' }}
              >
                {m}
              </Link>
            ))}
          </div>

          <h2 className="sec">Browse by Track Type</h2>
          <div className="chips">
            {TYPES.map((t) => (
              <Link
                key={t}
                to={`/category/type/${encodeURIComponent(t)}`}
                className="chip"
                style={{ textDecoration: 'none' }}
              >
                {t}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          {foundArtists.length > 0 && (
            <>
              <h2 className="sec">Artists</h2>
              <div className="shelf-row open">
                {foundArtists.map((a) => (
                  <ArtistCard key={a.id} artist={a} />
                ))}
              </div>
            </>
          )}
          <h2 className="sec">Songs</h2>
          {foundTracks.length ? (
            <div className="list">
              {foundTracks.map((t, i) => (
                <TrackRow key={t.id} track={t} index={i + 1} list={foundTracks} />
              ))}
            </div>
          ) : (
            <p className="empty">No results for “{q}”. Check the spelling or try searching for a genre like Lo-fi.</p>
          )}
        </>
      )}
    </div>
  );
}
