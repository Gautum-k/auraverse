import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { ArtistCard, Shelf, TrackCard } from '../components/Cards';
import Cover from '../components/Cover';
import { hash } from '../data';

export default function Home() {
  const { allTracks, artists, collabs, authorOf, playlists } = useApp();
  const h = new Date().getHours();
  const hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  const quick = [
    ...playlists.slice(0, 3).map((p) => ({ label: p.name, to: `/playlist/${p.id}`, seed: p.id, hue: hash(p.id) % 360 })),
    { label: 'Liked songs', to: '/library', seed: 'liked', hue: 265 },
    { label: 'Collab board', to: '/collabs', seed: 'board', hue: 150 },
    { label: 'Upload a track', to: '/upload', seed: 'upload', hue: 28 },
    ...artists.slice(0, 3).map((a) => ({ label: a.name, to: `/artist/${a.id}`, seed: a.id, hue: a.hue })),
  ].slice(0, 6);

  const trending = [...allTracks].sort((a, b) => b.plays - a.plays).slice(0, 8);

  return (
    <div className="view" style={{ '--tint': 'hsl(150 35% 24%)' }}>
      <h1 className="greet">{hello}</h1>
      <div className="quick">
        {quick.map((q) => (
          <Link to={q.to} className="quick-tile" key={q.label}>
            <div className="quick-cover"><Cover seed={q.seed} hue={q.hue} /></div>
            <span>{q.label}</span>
          </Link>
        ))}
      </div>

      <Shelf title="Trending on Auraverse" to="/search">
        {trending.map((t) => <TrackCard key={t.id} track={t} list={trending} />)}
      </Shelf>

      <Shelf title="Artists open to collaborating">
        {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
      </Shelf>

      <section className="shelf">
        <div className="shelf-head">
          <h2>Fresh on the collab board</h2>
          <Link to="/collabs">Show all</Link>
        </div>
        <div className="mini-list">
          {collabs.slice(0, 3).map((c) => {
            const a = authorOf(c);
            return (
              <Link to="/collabs" className="mini" key={c.id}>
                <div className="mini-cover"><Cover seed={c.id} hue={a.hue} /></div>
                <div>
                  <div className="mini-title">{c.title}</div>
                  <div className="mini-sub">{a.name} is looking for a {c.role.toLowerCase()}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
