import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { artists as fallbackArtists, tracks as fallbackTracks, collabs as fallbackCollabs } from './data';
import {
  getToken,
  clearToken,
  registerApi,
  loginApi,
  fetchMeApi,
  fetchTracksApi,
  uploadTrackApi,
  updateTrackApi,
  deleteTrackApi,
  updateProfileApi,
  fetchArtistsApi,
  toggleFollowApi,
  fetchCollabsApi,
  createCollabApi,
  toggleInterestApi,
  fetchPlaylistsApi,
  createPlaylistApi,
  updatePlaylistApi,
  deletePlaylistApi,
  addTrackToPlaylistApi,
  removeTrackFromPlaylistApi,
  toggleLikeApi,
} from './api';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(new Set());
  const [following, setFollowing] = useState(new Set());
  const [interested, setInterested] = useState(new Set());
  const [myTracks, setMyTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  
  const [allTracks, setAllTracks] = useState(fallbackTracks);
  const [artists, setArtists] = useState(fallbackArtists);
  const [collabs, setCollabs] = useState(fallbackCollabs);

  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');

  const [queue, setQueue] = useState(fallbackTracks);
  const [upNext, setUpNext] = useState([]);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Initial Data Loading & Auth Restore
  const loadPublicData = async () => {
    setLoadingData(true);
    setDataError('');
    try {
      const [trks, arts, clbs] = await Promise.all([
        fetchTracksApi().catch(() => null),
        fetchArtistsApi().catch(() => null),
        fetchCollabsApi().catch(() => null),
      ]);
      if (trks && trks.length) {
        setAllTracks(trks);
        setQueue(trks);
      }
      if (arts && arts.length) setArtists(arts);
      if (clbs && clbs.length) setCollabs(clbs);
    } catch (err) {
      setDataError(err.message || 'Failed to load data.');
    } finally {
      setLoadingData(false);
    }
  };

  const loadUserData = async () => {
    if (!getToken()) return;
    try {
      const meData = await fetchMeApi();
      setUser(meData.user);
      if (meData.likedTrackIds) setLiked(new Set(meData.likedTrackIds));
      if (meData.followedArtistIds) setFollowing(new Set(meData.followedArtistIds));
      if (meData.playlists) setPlaylists(meData.playlists);

      // Fetch user's own uploaded tracks
      if (meData.user?.id) {
        const mine = await fetchTracksApi({ artistId: meData.user.id }).catch(() => []);
        setMyTracks(mine);
      }
    } catch (err) {
      console.log('Session expired or invalid token');
      clearToken();
      setUser(null);
    }
  };

  useEffect(() => {
    loadPublicData();
    loadUserData();
  }, []);

  const artistOf = (track) => {
    if (!track) return { id: 'unknown', name: 'Unknown', hue: 150 };
    if (track.owner && typeof track.owner === 'object') {
      const isMe = user && (track.owner.id === user.id || track.owner._id === user._id);
      return {
        id: isMe ? 'me' : (track.owner.id || track.owner._id),
        name: isMe ? (user.name || 'You') : track.owner.name,
        hue: track.owner.hue || 150,
      };
    }
    if (track.artistId === 'me' || (user && track.owner === user.id)) {
      return { id: 'me', name: user?.name || 'You', hue: 150 };
    }
    const found = artists.find((a) => a.id === track.artistId || a.id === track.owner);
    if (found) return found;
    return { id: track.artistId || 'artist', name: 'Artist', hue: 150 };
  };

  const authorOf = (collab) => {
    if (!collab) return { id: 'unknown', name: 'Unknown', hue: 150 };
    if (collab.owner && typeof collab.owner === 'object') {
      const isMe = user && (collab.owner.id === user.id || collab.owner._id === user._id);
      return {
        id: isMe ? 'me' : (collab.owner.id || collab.owner._id),
        name: isMe ? (user.name || 'You') : collab.owner.name,
        hue: collab.owner.hue || 150,
      };
    }
    if (collab.authorId === 'me' || (user && collab.owner === user.id)) {
      return { id: 'me', name: user?.name || 'You', hue: 150 };
    }
    const found = artists.find((a) => a.id === collab.authorId || a.id === collab.owner);
    if (found) return found;
    return { id: collab.authorId || 'artist', name: 'Artist', hue: 150 };
  };

  /* ---------- Auth ---------- */
  const login = async (credentials) => {
    const res = await loginApi(credentials);
    setUser(res.user);
    await loadUserData();
    return res.user;
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    setUser(res.user);
    await loadUserData();
    return res.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setLiked(new Set());
    setFollowing(new Set());
    setInterested(new Set());
    setPlaylists([]);
    setMyTracks([]);
  };

  /* ---------- Playback ---------- */
  const startTrack = (track) => {
    setCurrent(track);
    setElapsed(0);
    setPlaying(true);
  };

  const play = (track, list) => {
    if (current?.id === track.id) {
      setPlaying((p) => !p);
      return;
    }
    if (list) setQueue(list);
    startTrack(track);
  };

  const toggle = () => current && setPlaying((p) => !p);

  const step = (dir) => {
    if (!current) return;
    if (dir === 1 && upNext.length) {
      const [first, ...rest] = upNext;
      setUpNext(rest);
      startTrack(first);
      return;
    }
    if (!queue.length) return;
    const i = queue.findIndex((t) => t.id === current.id);
    const at = i === -1 ? (dir === 1 ? 0 : queue.length - 1) : (i + dir + queue.length) % queue.length;
    startTrack(queue[at]);
  };

  const next = () => step(1);
  const prev = () => (elapsed > 3 ? setElapsed(0) : step(-1));

  /* ---------- Queue ---------- */
  const addToQueue = (track) => setUpNext((p) => [...p, track]);
  const removeFromQueue = (index) => setUpNext((p) => p.filter((_, i) => i !== index));
  const clearQueue = () => setUpNext([]);

  /* ---------- Likes, Follows, Interests ---------- */
  const toggleLike = async (trackId) => {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });
    if (user) {
      try {
        await toggleLikeApi(trackId);
      } catch (err) {
        console.error('Like toggle failed:', err.message);
      }
    }
  };

  const toggleFollow = async (artistId) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      next.has(artistId) ? next.delete(artistId) : next.add(artistId);
      return next;
    });
    if (user) {
      try {
        const res = await toggleFollowApi(artistId);
        setArtists((prev) =>
          prev.map((a) => (a.id === artistId ? { ...a, followersCount: res.followersCount } : a))
        );
      } catch (err) {
        console.error('Follow toggle failed:', err.message);
      }
    }
  };

  const toggleInterest = async (collabId) => {
    setInterested((prev) => {
      const next = new Set(prev);
      next.has(collabId) ? next.delete(collabId) : next.add(collabId);
      return next;
    });
    if (user) {
      try {
        await toggleInterestApi(collabId);
      } catch (err) {
        console.error('Interest toggle failed:', err.message);
      }
    }
  };

  /* ---------- Playlists ---------- */
  const createPlaylist = async (name) => {
    const finalName = name?.trim() || `My playlist #${playlists.length + 1}`;
    if (user) {
      try {
        const newPl = await createPlaylistApi(finalName);
        setPlaylists((p) => [newPl, ...p]);
        return newPl.id;
      } catch (err) {
        console.error('Failed to create playlist on server:', err.message);
      }
    }
    const id = `p${Date.now()}`;
    const localPl = { id, name: finalName, trackIds: [] };
    setPlaylists((p) => [localPl, ...p]);
    return id;
  };

  const renamePlaylist = async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlaylists((p) => p.map((pl) => (pl.id === id ? { ...pl, name: trimmed } : pl)));
    if (user && !id.startsWith('p')) {
      try {
        await updatePlaylistApi(id, trimmed);
      } catch (err) {
        console.error('Failed to rename playlist on server:', err.message);
      }
    }
  };

  const deletePlaylist = async (id) => {
    setPlaylists((p) => p.filter((pl) => pl.id !== id));
    if (user && !id.startsWith('p')) {
      try {
        await deletePlaylistApi(id);
      } catch (err) {
        console.error('Failed to delete playlist on server:', err.message);
      }
    }
  };

  const togglePlaylistTrack = async (pid, tid) => {
    const targetPl = playlists.find((pl) => pl.id === pid);
    const has = targetPl?.trackIds?.includes(tid);

    setPlaylists((p) =>
      p.map((pl) => {
        if (pl.id !== pid) return pl;
        const trackIds = pl.trackIds || [];
        return {
          ...pl,
          trackIds: trackIds.includes(tid) ? trackIds.filter((x) => x !== tid) : [...trackIds, tid],
        };
      })
    );

    if (user && !pid.startsWith('p')) {
      try {
        if (has) {
          await removeTrackFromPlaylistApi(pid, tid);
        } else {
          await addTrackToPlaylistApi(pid, tid);
        }
      } catch (err) {
        console.error('Failed to update playlist tracks on server:', err.message);
      }
    }
  };

  /* ---------- Track Uploads & Modifications ---------- */
  const addTrack = async (formData) => {
    if (user) {
      const created = await uploadTrackApi(formData);
      setMyTracks((prev) => [created, ...prev]);
      setAllTracks((prev) => [created, ...prev]);
      return created;
    }
  };

  const updateTrack = async (id, patch) => {
    const apply = (t) => (t.id === id ? { ...t, ...patch } : t);
    setMyTracks((p) => p.map(apply));
    setAllTracks((p) => p.map(apply));
    setQueue((p) => p.map(apply));
    setUpNext((p) => p.map(apply));
    setCurrent((c) => (c ? apply(c) : c));

    if (user && !id.startsWith('u') && !id.startsWith('t')) {
      try {
        await updateTrackApi(id, patch);
      } catch (err) {
        console.error('Failed to update track on server:', err.message);
      }
    }
  };

  const deleteTrack = async (id) => {
    setMyTracks((p) => p.filter((t) => t.id !== id));
    setAllTracks((p) => p.filter((t) => t.id !== id));
    setQueue((p) => p.filter((t) => t.id !== id));
    setUpNext((p) => p.filter((t) => t.id !== id));

    if (current?.id === id) {
      setCurrent(null);
      setPlaying(false);
      setElapsed(0);
    }

    if (user && !id.startsWith('u') && !id.startsWith('t')) {
      try {
        await deleteTrackApi(id);
      } catch (err) {
        console.error('Failed to delete track on server:', err.message);
      }
    }
  };

  const addCollab = async (collabData) => {
    if (user) {
      try {
        const created = await createCollabApi(collabData);
        setCollabs((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Failed to create collab request on server:', err.message);
      }
    }
    const localCollab = {
      ...collabData,
      id: `c${Date.now()}`,
      authorId: 'me',
      posted: 'just now',
    };
    setCollabs((prev) => [localCollab, ...prev]);
    return localCollab;
  };

  const updateProfile = async (data) => {
    const updatedUser = await updateProfileApi(data);
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    loadingData,
    dataError,
    login,
    register,
    logout,
    updateProfile,
    liked,
    toggleLike,
    following,
    toggleFollow,
    interested,
    toggleInterest,
    myTracks,
    addTrack,
    updateTrack,
    deleteTrack,
    collabs,
    addCollab,
    playlists,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    togglePlaylistTrack,
    allTracks,
    artists,
    artistOf,
    authorOf,
    queue,
    upNext,
    addToQueue,
    removeFromQueue,
    clearQueue,
    current,
    playing,
    elapsed,
    setElapsed,
    play,
    toggle,
    next,
    prev,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
