import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { GENRES, LANGUAGES, MOODS, TYPES } from '../data';

export default function Upload() {
  const nav = useNavigate();
  const { user, addTrack } = useApp();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [mood, setMood] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [duration, setDuration] = useState(180);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="view" style={{ '--tint': 'hsl(175 30% 22%)' }}>
        <div className="page-head">
          <h1>Upload a track</h1>
        </div>
        <p className="empty">
          You need an account to upload. <Link to="/login">Log in</Link> or{' '}
          <Link to="/login?mode=register">sign up</Link>.
        </p>
      </div>
    );
  }

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAudioFile(null);
      return;
    }

    const validExts = ['.mp3', '.m4a', '.wav'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext) && !file.type.includes('audio')) {
      setError('Audio must be mp3, m4a or wav.');
      e.target.value = '';
      setAudioFile(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Audio file is larger than 20 MB.');
      e.target.value = '';
      setAudioFile(null);
      return;
    }
    setError('');
    setAudioFile(file);

    // Read real duration from Audio element
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio(objectUrl);
    audio.onloadedmetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setCoverFile(null);
      setCoverPreview('');
      return;
    }

    const validImgExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validImgExts.includes(ext) && !file.type.startsWith('image/')) {
      setError('Cover must be jpg, png or webp.');
      e.target.value = '';
      setCoverFile(null);
      setCoverPreview('');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Cover image is larger than 3 MB.');
      e.target.value = '';
      setCoverFile(null);
      setCoverPreview('');
      return;
    }
    setError('');
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Please select an audio file to upload.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('genre', genre);
      formData.append('language', language);
      formData.append('mood', mood);
      formData.append('type', type);
      formData.append('duration', duration);
      formData.append('audio', audioFile);
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      await addTrack(formData);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Track upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view" style={{ '--tint': 'hsl(175 30% 22%)' }}>
      <div className="page-head">
        <h1>Upload a track</h1>
      </div>

      {error && (
        <div
          style={{
            color: '#ff5555',
            backgroundColor: '#2a1515',
            padding: '10px 14px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {done ? (
        <div className="panel-form">
          <p className="about">
            <strong>{title}</strong> is now live on your profile and library!
          </p>
          <div className="form-actions">
            <button
              className="txt-btn"
              onClick={() => {
                setDone(false);
                setTitle('');
                setAudioFile(null);
                setCoverFile(null);
                setCoverPreview('');
              }}
            >
              Upload another
            </button>
            <button className="pill green" onClick={() => nav('/library')}>
              Go to library
            </button>
          </div>
        </div>
      ) : (
        <form className="panel-form" onSubmit={submit}>
          <div className="fields">
            <div className="field wide">
              <label htmlFor="ut">Track title *</label>
              <input
                id="ut"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Marina at 6 a.m."
              />
            </div>
            <div className="field">
              <label htmlFor="ug">Genre *</label>
              <select id="ug" required value={genre} onChange={(e) => setGenre(e.target.value)}>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ul">Language *</label>
              <select id="ul" required value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="um">Mood (optional)</label>
              <select id="um" value={mood} onChange={(e) => setMood(e.target.value)}>
                <option value="">Select mood (optional)</option>
                {MOODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="utype">Type *</label>
              <select id="utype" required value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field wide">
              <label htmlFor="uf">Audio file (mp3, m4a, wav - max 20 MB) *</label>
              <input
                id="uf"
                type="file"
                accept=".mp3,.m4a,.wav,audio/*"
                required
                onChange={handleAudioChange}
              />
              {audioFile && (
                <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--green)' }}>
                  Selected file: {audioFile.name} (Duration: {Math.floor(duration / 60)}:
                  {String(duration % 60).padStart(2, '0')})
                </div>
              )}
            </div>

            <div className="field wide">
              <label htmlFor="uc">Cover image (jpg, png, webp - max 3 MB, optional)</label>
              <input
                id="uc"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/*"
                onChange={handleCoverChange}
              />
              {coverPreview && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--sub)' }}>{coverFile?.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="submit" className="pill green" disabled={loading}>
              {loading ? 'Uploading...' : 'Publish track'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
