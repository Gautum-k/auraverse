export const artists = [
  { id: 'nila-raj', name: 'Nila Raj', genre: 'Indie Pop', city: 'Chennai', followers: 18420, hue: 150,
    bio: 'Bedroom-recorded songs about sea breeze, local trains and late-night tea. Writes in Tamil and English.',
    looking: 'Looking for a lead guitarist and someone to mix an EP' },
  { id: 'kavin-beats', name: 'Kavin Beats', genre: 'Hip-hop', city: 'Coimbatore', followers: 9310, hue: 28,
    bio: 'Producer and rapper from Kovai. Boom-bap drums, sampled nadaswaram, short punchy verses.',
    looking: 'Looking for a hook singer' },
  { id: 'ritu-menon', name: 'Ritu Menon', genre: 'Carnatic Fusion', city: 'Kochi', followers: 22150, hue: 330,
    bio: 'Trained vocalist blending Carnatic ragas with electronic textures. Open to live sessions.',
    looking: 'Looking for a producer who likes odd time signatures' },
  { id: 'echo-lane', name: 'Echo Lane', genre: 'Lo-fi', city: 'Bengaluru', followers: 40210, hue: 200,
    bio: 'Study beats and slow loops made after midnight. Mostly instrumental, always open to a vocal layer.',
    looking: 'Looking for vocalists and spoken-word artists' },
  { id: 'static-tide', name: 'Static Tide', genre: 'Rock', city: 'Madurai', followers: 6780, hue: 265,
    bio: 'Four college friends, two amps and a borrowed drum kit. Loud, honest, a little out of tune.',
    looking: 'Looking for a drummer for weekend gigs' },
  { id: 'dhruv-sen', name: 'Dhruv Sen', genre: 'Electronic', city: 'Kolkata', followers: 12950, hue: 175,
    bio: 'Synth-heavy tracks built around field recordings from trams, markets and rain.',
    looking: 'Looking for a visual artist for live sets' },
  { id: 'mira-jo', name: 'Mira Jo', genre: 'R&B', city: 'Hyderabad', followers: 15400, hue: 350,
    bio: 'Slow-tempo R&B with layered harmonies. Writes everything on a secondhand keyboard.',
    looking: 'Looking for a lyricist' },
  { id: 'anbu-strings', name: 'Anbu Strings', genre: 'Acoustic', city: 'Trichy', followers: 4120, hue: 45,
    bio: 'Fingerstyle guitar and soft vocals. Songs recorded on a phone in one take.',
    looking: 'Looking for a violinist' },
];

export const tracks = [
  { id: 't1', title: 'Marina at 6 a.m.', artistId: 'nila-raj', album: 'Salt Air', duration: 214, plays: 482310, genre: 'Indie Pop' },
  { id: 't2', title: 'Paper Boats', artistId: 'nila-raj', album: 'Salt Air', duration: 187, plays: 301442, genre: 'Indie Pop' },
  { id: 't3', title: 'Signal Lost', artistId: 'kavin-beats', album: 'Kovai Tapes', duration: 163, plays: 190220, genre: 'Hip-hop' },
  { id: 't4', title: 'Rooftop Cypher', artistId: 'kavin-beats', album: 'Kovai Tapes', duration: 201, plays: 144900, genre: 'Hip-hop' },
  { id: 't5', title: 'Raga in Reverse', artistId: 'ritu-menon', album: 'Sruti Box', duration: 258, plays: 612034, genre: 'Carnatic Fusion' },
  { id: 't6', title: 'Monsoon Alaap', artistId: 'ritu-menon', album: 'Sruti Box', duration: 232, plays: 398771, genre: 'Carnatic Fusion' },
  { id: 't7', title: 'Rainy Hostel Nights', artistId: 'echo-lane', album: 'Room 204', duration: 142, plays: 1203887, genre: 'Lo-fi' },
  { id: 't8', title: 'Quiet Library', artistId: 'echo-lane', album: 'Room 204', duration: 156, plays: 954120, genre: 'Lo-fi' },
  { id: 't9', title: 'Last Bus to Madurai', artistId: 'static-tide', album: 'Loud Wires', duration: 244, plays: 88230, genre: 'Rock' },
  { id: 't10', title: 'Loud Wires', artistId: 'static-tide', album: 'Loud Wires', duration: 198, plays: 61004, genre: 'Rock' },
  { id: 't11', title: 'Night Metro', artistId: 'dhruv-sen', album: 'Tram Lines', duration: 276, plays: 233410, genre: 'Electronic' },
  { id: 't12', title: 'Soft Static', artistId: 'dhruv-sen', album: 'Tram Lines', duration: 221, plays: 170562, genre: 'Electronic' },
  { id: 't13', title: 'Slow Burn', artistId: 'mira-jo', album: 'Second Hand Keys', duration: 207, plays: 402318, genre: 'R&B' },
  { id: 't14', title: 'Say It Slower', artistId: 'mira-jo', album: 'Second Hand Keys', duration: 193, plays: 276003, genre: 'R&B' },
  { id: 't15', title: 'Two Chords Home', artistId: 'anbu-strings', album: 'One Take', duration: 175, plays: 52810, genre: 'Acoustic' },
  { id: 't16', title: 'Porch Light', artistId: 'anbu-strings', album: 'One Take', duration: 189, plays: 44190, genre: 'Acoustic' },
];

export const collabs = [
  { id: 'c1', authorId: 'nila-raj', title: 'Lead guitar for a monsoon-themed EP', role: 'Guitarist', genre: 'Indie Pop', bpm: 96,
    description: 'Four songs, clean tones with a bit of reverb. I have the chords and vocals recorded, need melodic lead lines.', posted: '2 days ago' },
  { id: 'c2', authorId: 'kavin-beats', title: 'Hook singer for "Rooftop Cypher" remix', role: 'Vocalist', genre: 'Hip-hop', bpm: 88,
    description: 'Need a 16-bar hook, Tamil or English. Stems and a reference vocal will be shared.', posted: '3 days ago' },
  { id: 'c3', authorId: 'ritu-menon', title: 'Producer for odd-meter Carnatic fusion', role: 'Producer', genre: 'Carnatic Fusion', bpm: 110,
    description: 'Looking for someone comfortable with 7/8 and 9/8 grooves. I will bring the vocals and tanpura.', posted: '5 days ago' },
  { id: 'c4', authorId: 'echo-lane', title: 'Spoken word over a rainy-day loop', role: 'Vocalist', genre: 'Lo-fi', bpm: 72,
    description: 'Two-minute instrumental ready. Looking for a calm voice, any language.', posted: '1 week ago' },
  { id: 'c5', authorId: 'static-tide', title: 'Drummer for weekend gigs in Madurai', role: 'Drummer', genre: 'Rock', bpm: 140,
    description: 'We play covers and originals every second Saturday. Own kit preferred, practice space provided.', posted: '1 week ago' },
  { id: 'c6', authorId: 'mira-jo', title: 'Lyricist for a slow R&B single', role: 'Lyricist', genre: 'R&B', bpm: 68,
    description: 'Melody and chords are done. Theme is long-distance friendships. Credit and royalties split equally.', posted: '9 days ago' },
  { id: 'c7', authorId: 'anbu-strings', title: 'Violin layer for an acoustic single', role: 'Keys', genre: 'Acoustic', bpm: 84,
    description: 'Simple guitar and vocal track, needs a warm string line in the second verse.', posted: '2 weeks ago' },
];

export const genres = [
  { name: 'Indie Pop', hue: 150 },
  { name: 'Lo-fi', hue: 200 },
  { name: 'Hip-hop', hue: 28 },
  { name: 'Carnatic Fusion', hue: 330 },
  { name: 'Electronic', hue: 175 },
  { name: 'Rock', hue: 265 },
  { name: 'R&B', hue: 350 },
  { name: 'Acoustic', hue: 45 },
  { name: 'Folk', hue: 80 },
  { name: 'Devotional', hue: 50 },
  { name: 'Film Songs', hue: 310 },
];

export const GENRES = [
  'Indie Pop', 'Lo-fi', 'Hip-hop', 'Carnatic Fusion', 'Electronic', 'Rock', 'R&B', 'Acoustic', 'Folk', 'Devotional', 'Film Songs'
];

export const LANGUAGES = [
  'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'English', 'Punjabi', 'Instrumental'
];

export const MOODS = [
  'Chill', 'Energetic', 'Romantic', 'Sad', 'Workout', 'Focus'
];

export const TYPES = [
  'Original', 'Cover', 'Remix', 'Instrumental', 'Demo'
];

export const ROLES = ['Vocalist', 'Guitarist', 'Producer', 'Lyricist', 'Drummer', 'Mixing engineer', 'Keys'];

export const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));
export const hash = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

