import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { GENRES } from '../data';
import { SERVER_BASE } from '../api';

export default function EditProfile() {
  const nav = useNavigate();
  const { user, updateProfile } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [genre, setGenre] = useState(user?.genre || GENRES[0]);
  const [city, setCity] = useState(user?.city || 'Chennai');
  const [bio, setBio] = useState(user?.bio || '');
  const [looking, setLooking] = useState(user?.looking || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const initialPreview = user?.avatarUrl
    ? user.avatarUrl.startsWith('http')
      ? user.avatarUrl
      : `${SERVER_BASE}${user.avatarUrl}`
    : '';
  const [avatarPreview, setAvatarPreview] = useState(initialPreview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <div className="view" style={{ '--tint': 'hsl(200 30% 20%)' }}>
        <div className="page-head">
          <h1>Edit profile</h1>
        </div>
        <p className="empty">Please log in to edit your profile.</p>
      </div>
    );
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAvatarFile(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile image is larger than 2 MB.');
      e.target.value = '';
      setAvatarFile(null);
      return;
    }
    setError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('genre', genre);
      formData.append('city', city);
      formData.append('bio', bio);
      formData.append('looking', looking);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await updateProfile(formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => nav('/library'), 1000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view" style={{ '--tint': 'hsl(200 30% 20%)' }}>
      <div className="page-head">
        <h1>Edit profile</h1>
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

      {message && (
        <div
          style={{
            color: '#1ed760',
            backgroundColor: '#152a1c',
            padding: '10px 14px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '0.9rem',
          }}
        >
          {message}
        </div>
      )}

      <form className="panel-form" onSubmit={submit}>
        <div className="fields">
          <div className="field wide" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--green)',
                color: '#000',
                fontWeight: 800,
                fontSize: '28px',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                name[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <label htmlFor="av">Profile Picture / Logo (jpg, png, webp - up to 2 MB)</label>
              <input
                id="av"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/*"
                onChange={handleAvatarChange}
                style={{ marginTop: '6px' }}
              />
            </div>
          </div>

          <div className="field wide">
            <label htmlFor="epn">Display Name</label>
            <input
              id="epn"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nila Raj"
            />
          </div>

          <div className="field">
            <label htmlFor="epg">Genre</label>
            <select id="epg" value={genre} onChange={(e) => setGenre(e.target.value)}>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="epc">City</label>
            <input
              id="epc"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Chennai"
            />
          </div>

          <div className="field wide">
            <label htmlFor="epb">Bio</label>
            <textarea
              id="epb"
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio..."
            />
          </div>

          <div className="field wide">
            <label htmlFor="epl">Looking for</label>
            <input
              id="epl"
              value={looking}
              onChange={(e) => setLooking(e.target.value)}
              placeholder="e.g. Looking for a lead guitarist"
            />
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <button type="submit" className="pill green" disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
