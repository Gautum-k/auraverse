import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Track from './models/Track.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auraverse';

const SEARCH_TERMS = [
  'Tamil',
  'Tamil hits',
  'Tamil melody',
  'Tamil kuthu',
  'Tamil indie',
  'Anirudh',
  'A. R. Rahman',
  'Yuvan Shankar Raja',
  'G. V. Prakash',
  'Sid Sriram',
  'Hindi',
  'Bollywood',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Punjabi',
];

function getLanguageFromTerm(term) {
  const lower = term.toLowerCase();
  if (lower.includes('hindi') || lower.includes('bollywood')) return 'Hindi';
  if (lower.includes('telugu')) return 'Telugu';
  if (lower.includes('malayalam')) return 'Malayalam';
  if (lower.includes('kannada')) return 'Kannada';
  if (lower.includes('punjabi')) return 'Punjabi';
  return 'Tamil'; // Default for Tamil terms and Tamil artists (Anirudh, AR Rahman, Yuvan, GV Prakash, Sid Sriram)
}

function cleanSlug(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'artist';
}

async function importCatalog() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const defaultPasswordHash = await bcrypt.hash('catalogPassword123', 10);
    const artistCache = new Map();

    let totalImported = 0;
    let totalSkipped = 0;

    for (const term of SEARCH_TERMS) {
      console.log(`\nFetching catalog for term: "${term}"...`);
      const language = getLanguageFromTerm(term);
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=IN&media=music&entity=song&limit=50`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to fetch term "${term}": ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const results = data.results || [];
        console.log(`Found ${results.length} songs for term "${term}".`);

        for (const item of results) {
          if (!item.trackId || !item.trackName || !item.previewUrl) {
            continue;
          }

          const externalId = String(item.trackId);

          // Check duplicate track by externalId
          const existingTrack = await Track.findOne({ externalId });
          if (existingTrack) {
            totalSkipped++;
            continue;
          }

          const artistName = item.artistName || 'Unknown Artist';
          let artistUser = artistCache.get(artistName.toLowerCase());

          if (!artistUser) {
            artistUser = await User.findOne({ name: artistName, isCatalogArtist: true });
          }

          if (!artistUser) {
            const emailSlug = cleanSlug(artistName);
            let email = `${emailSlug}@catalog.auraverse.in`;
            let existingEmailUser = await User.findOne({ email });
            if (existingEmailUser) {
              email = `${emailSlug}_${Date.now()}@catalog.auraverse.in`;
            }

            artistUser = await User.create({
              name: artistName,
              email,
              passwordHash: defaultPasswordHash,
              genre: item.primaryGenreName || 'Indian',
              city: 'India',
              bio: `Catalog artist on Auraverse`,
              hue: Math.floor(Math.random() * 360),
              isArtist: true,
              isCatalogArtist: true,
            });
          }

          artistCache.set(artistName.toLowerCase(), artistUser);

          const artworkUrl = item.artworkUrl100
            ? item.artworkUrl100.replace('100x100bb', '600x600bb')
            : '';

          const durationSeconds = Math.round((item.trackTimeMillis || 30000) / 1000);

          await Track.create({
            title: item.trackName,
            album: item.collectionName || 'Single',
            genre: item.primaryGenreName || 'Indian',
            language,
            durationSeconds,
            duration: durationSeconds,
            artworkUrl,
            previewUrl: item.previewUrl,
            audioUrl: item.previewUrl,
            externalId,
            source: 'itunes',
            owner: artistUser._id,
            plays: Math.floor(Math.random() * 50000) + 1000,
          });

          totalImported++;
        }
      } catch (termErr) {
        console.error(`Error processing term "${term}":`, termErr.message);
      }

      // 1 second delay between API requests
      console.log('Waiting 1 second before next request...');
      await new Promise((res) => setTimeout(res, 1000));
    }

    console.log(`\nCatalog import finished!`);
    console.log(`Total new tracks imported: ${totalImported}`);
    console.log(`Total duplicate tracks skipped: ${totalSkipped}`);

    process.exit(0);
  } catch (err) {
    console.error('Fatal error during catalog import:', err);
    process.exit(1);
  }
}

importCatalog();
