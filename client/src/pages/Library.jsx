import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { GENRES, LANGUAGES, MOODS, TYPES } from '../data';
import { ArtistCard, PlaylistCard } from '../components/Cards';
import Icon from '../components/Icon';
import TrackRow from '../components/TrackRow';

export default function Library() {
  const nav = useNavigate();
  const { user, allTracks, myTracks, liked, artists, following, playlists, createPlaylist, updateTrack, deleteTrack } = useApp();
  const [tab, setTab] = useState('playlists');
  const [editing, setEditing] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const likedList = allTracks.filter((t) => liked.has(t.id));
  const followed = artists.filter((a) => following.has(a.id));
  const tabs = [
    ['playlists', `Playlists (${playlists.length})`],
    ['liked', `Liked songs (${likedList.length})`],
    ['mine', `Your uploads (${myTracks.length})`],
    ['following', `Following (${followed.length})`],
  ];

  const newPlaylist = () => (user ? nav(`/playlist/${createPlaylist()}`) : nav('/login'));

  const handleStartEdit = (track) => {
    setEditing({
      id: track.id,
      title: track.title || '',
      genre: track.genre || GENRES[0],
      language: track.language || LANGUAGES[0],
      mood: track.mood || '',
      type: track.type || TYPES[0],
    });
    setCoverFile(null);
    setCoverPreview('');
    setError('');
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setCoverFile(null);
      setCoverPreview('');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Cover image is larger than 3 MB.');
      return;
    }
    setError('');
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      if (coverFile) {
        const formData = new FormData();
        formData.append('title', editing.title.trim() || 'Untitled');
        formData.append('genre', editing.genre);
        formData.append('language', editing.language);
        formData.append('mood', editing.mood);
        formData.append('type', editing.type);
        formData.append('cover', coverFile);
        await updateTrack(editing.id, formData);
      } else {
        await updateTrack(editing.id, {
          title: editing.title.trim() || 'Untitled',
          genre: editing.genre,
          language: editing.language,
          mood: editing.mood,
          type: editing.type,
        });
      }
      setEditing(null);
    } catch (err) {
      setError(err.message || 'Failed to update track.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this track? This action cannot be undone.')) {
      try {
        await deleteTrack(id);
        if (editing?.id === id) setEditing(null);
      } catch (err) {
        setError(err.message || 'Failed to delete track.');
      }
    }
  };

  return (
    <div className="view" style={{ '--tint': 'hsl(265 30% 26%)' }}>
      <div className="page-head">
        <h1>Your library</h1>
        <button className="pill green" onClick={newPlaylist}>
          <Icon name="plus" size={18} /> Create playlist
        </button>
      </div>
      <div className="chips">
        {tabs.map(([k, label]) => (
          <button key={k} className={`chip${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'playlists' &&
        (playlists.length ? (
          <div className="shelf-row open">
            {playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        ) : (
          <p className="empty">
            You don’t have any playlists yet. Use “Create playlist” or add a song from its ⋯ menu.
          </p>
        ))}

      {tab === 'liked' &&
        (likedList.length ? (
          <div className="list">
            {likedList.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i + 1} list={likedList} />
            ))}
          </div>
        ) : (
          <p className="empty">Tap the heart on any song and it will show up here.</p>
        ))}

      {tab === 'mine' && (
        <>
          {editing && (
            <form className="panel-form" onSubmit={save} style={{ marginBottom: '24px' }}>
              <h3>Edit Track Details</h3>
              {error && (
                <div style={{ color: '#ff5555', backgroundColor: '#2a1515', padding: '10px 14px', borderRadius: '4px', marginBottom: '12px' }}>
                  {error}
                </div>
              )}
              <div className="fields">
                <div className="field wide">
                  <label htmlFor="et">Track title</label>
                  <input
                    id="et"
                    autoFocus
                    required
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="eg">Genre</label>
                  <select
                    id="eg"
                    value={editing.genre}
                    onChange={(e) => setEditing({ ...editing, genre: e.target.value })}
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="el">Language</label>
                  <select
                    id="el"
                    value={editing.language}
                    onChange={(e) => setEditing({ ...editing, language: e.target.value })}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="em">Mood (optional)</label>
                  <select
                    id="em"
                    value={editing.mood}
                    onChange={(e) => setEditing({ ...editing, mood: e.target.value })}
                  >
                    <option value="">None</option>
                    {MOODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="etype">Type</label>
                  <select
                    id="etype"
                    value={editing.type}
                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field wide">
                  <label htmlFor="ec">New Cover Image (optional)</label>
                  <input id="ec" type="file" accept=".jpg,.jpeg,.png,.webp,image/*" onChange={handleCoverChange} />
                  {coverPreview && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={coverPreview} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button type="button" className="txt-btn" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button type="submit" className="pill green" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="txt-btn"
                  style={{ color: '#ff5555', marginLeft: 'auto' }}
                  onClick={() => handleDelete(editing.id)}
                >
                  Delete track
                </button>
              </div>
            </form>
          )}
          {myTracks.length ? (
            <div className="list">
              {myTracks.map((t, i) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  index={i + 1}
                  list={myTracks}
                  onEdit={handleStartEdit}
                  onDelete={() => handleDelete(t.id)}
                />
              ))}
            </div>
          ) : (
            <p className="empty">You haven’t uploaded anything yet. Use “Upload a track” in the sidebar.</p>
          )}
        </>
      )}

      {tab === 'following' &&
        (followed.length ? (
          <div className="shelf-row open">
            {followed.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        ) : (
          <p className="empty">Follow artists from their profile to keep track of them here.</p>
        ))}
    </div>
  );
}
