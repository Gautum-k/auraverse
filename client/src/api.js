const API_BASE = '/api';
export const SERVER_BASE = '';

export const getToken = () => localStorage.getItem('auraverse_token');
export const setToken = (token) => localStorage.setItem('auraverse_token', token);
export const clearToken = () => localStorage.removeItem('auraverse_token');

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to Content-Type: application/json
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error("Can't reach the server. Try again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const normalize = (item) => {
  if (!item) return item;
  const normalized = { ...item, id: item._id ? item._id.toString() : item.id };
  if (normalized.owner && typeof normalized.owner === 'object') {
    normalized.owner = normalize(normalized.owner);
  }
  return normalized;
};

/* --- Auth APIs --- */
export async function registerApi(userData) {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (res.token) setToken(res.token);
  return { ...res, user: normalize(res.user) };
}

export async function loginApi(credentials) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (res.token) setToken(res.token);
  return { ...res, user: normalize(res.user) };
}

export async function fetchMeApi() {
  const res = await apiFetch('/auth/me');
  return {
    ...res,
    user: normalize(res.user),
    playlists: (res.playlists || []).map(normalize),
  };
}

/* --- Tracks APIs --- */
export async function fetchTracksApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/tracks${query ? `?${query}` : ''}`);
  return res.map(normalize);
}

export async function uploadTrackApi(formData) {
  const res = await apiFetch('/tracks', {
    method: 'POST',
    body: formData,
  });
  return normalize(res);
}

export async function updateTrackApi(id, updates) {
  const isFormData = updates instanceof FormData;
  const res = await apiFetch(`/tracks/${id}`, {
    method: 'PUT',
    body: isFormData ? updates : JSON.stringify(updates),
  });
  return normalize(res);
}

export async function deleteTrackApi(id) {
  return await apiFetch(`/tracks/${id}`, {
    method: 'DELETE',
  });
}

export async function updateProfileApi(data) {
  const isFormData = data instanceof FormData;
  const res = await apiFetch('/auth/profile', {
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
  });
  return normalize(res);
}

/* --- Artists APIs --- */
export async function fetchArtistsApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/artists${query ? `?${query}` : ''}`);
  return res.map(normalize);
}

export async function fetchArtistDetailsApi(id) {
  const res = await apiFetch(`/artists/${id}`);
  return {
    artist: normalize(res.artist),
    tracks: (res.tracks || []).map(normalize),
    collabs: (res.collabs || []).map(normalize),
  };
}

export async function toggleFollowApi(artistId) {
  return await apiFetch(`/artists/${artistId}/follow`, {
    method: 'POST',
  });
}

/* --- Collabs APIs --- */
export async function fetchCollabsApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/collabs${query ? `?${query}` : ''}`);
  return res.map(normalize);
}

export async function createCollabApi(collabData) {
  const res = await apiFetch('/collabs', {
    method: 'POST',
    body: JSON.stringify(collabData),
  });
  return normalize(res);
}

export async function toggleInterestApi(id) {
  const res = await apiFetch(`/collabs/${id}/interest`, {
    method: 'POST',
  });
  return normalize(res);
}

/* --- Playlists APIs --- */
export async function fetchPlaylistsApi() {
  const res = await apiFetch('/playlists');
  return res.map(normalize);
}

export async function createPlaylistApi(name) {
  const res = await apiFetch('/playlists', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return normalize(res);
}

export async function updatePlaylistApi(id, name) {
  const res = await apiFetch(`/playlists/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
  return normalize(res);
}

export async function deletePlaylistApi(id) {
  return await apiFetch(`/playlists/${id}`, {
    method: 'DELETE',
  });
}

export async function addTrackToPlaylistApi(playlistId, trackId) {
  const res = await apiFetch(`/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify({ trackId }),
  });
  return normalize(res);
}

export async function removeTrackFromPlaylistApi(playlistId, trackId) {
  const res = await apiFetch(`/playlists/${playlistId}/tracks/${trackId}`, {
    method: 'DELETE',
  });
  return normalize(res);
}

/* --- Likes APIs --- */
export async function toggleLikeApi(trackId) {
  return await apiFetch(`/likes/${trackId}`, {
    method: 'POST',
  });
}
