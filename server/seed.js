import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import User from './models/User.js';
import Track from './models/Track.js';
import Collab from './models/Collab.js';
import Playlist from './models/Playlist.js';
import Follow from './models/Follow.js';
import Like from './models/Like.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auraverse';

// Create a small valid silent WAV/MP3 file if not exists
const createDemoAudioFile = () => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, 'demo.mp3');
  if (!fs.existsSync(filePath)) {
    // 1-second silent MP3 binary buffer (ID3 + frame header)
    const silentMp3Buffer = Buffer.from(
      'FFF3E20400000000000000000000000000000000000000000000000000000000' +
      '5354415453000000020000000100000000000000000000000000000000000000',
      'hex'
    );
    fs.writeFileSync(filePath, silentMp3Buffer);
  }
};

const artistsData = [
  { name: 'Nila Raj', email: 'nila@auraverse.in', genre: 'Indie Pop', city: 'Chennai', followersCount: 18420, hue: 150,
    bio: 'Bedroom-recorded songs about sea breeze, local trains and late-night tea. Writes in Tamil and English.',
    looking: 'Looking for a lead guitarist and someone to mix an EP' },
  { name: 'Kavin Beats', email: 'kavin@auraverse.in', genre: 'Hip-hop', city: 'Coimbatore', followersCount: 9310, hue: 28,
    bio: 'Producer and rapper from Kovai. Boom-bap drums, sampled nadaswaram, short punchy verses.',
    looking: 'Looking for a hook singer' },
  { name: 'Ritu Menon', email: 'ritu@auraverse.in', genre: 'Carnatic Fusion', city: 'Kochi', followersCount: 22150, hue: 330,
    bio: 'Trained vocalist blending Carnatic ragas with electronic textures. Open to live sessions.',
    looking: 'Looking for a producer who likes odd time signatures' },
  { name: 'Echo Lane', email: 'echolane@auraverse.in', genre: 'Lo-fi', city: 'Bengaluru', followersCount: 40210, hue: 200,
    bio: 'Study beats and slow loops made after midnight. Mostly instrumental, always open to a vocal layer.',
    looking: 'Looking for vocalists and spoken-word artists' },
  { name: 'Static Tide', email: 'statictide@auraverse.in', genre: 'Rock', city: 'Madurai', followersCount: 6780, hue: 265,
    bio: 'Four college friends, two amps and a borrowed drum kit. Loud, honest, a little out of tune.',
    looking: 'Looking for a drummer for weekend gigs' },
  { name: 'Dhruv Sen', email: 'dhruv@auraverse.in', genre: 'Electronic', city: 'Kolkata', followersCount: 12950, hue: 175,
    bio: 'Synth-heavy tracks built around field recordings from trams, markets and rain.',
    looking: 'Looking for a visual artist for live sets' },
  { name: 'Mira Jo', email: 'mirajo@auraverse.in', genre: 'R&B', city: 'Hyderabad', followersCount: 15400, hue: 350,
    bio: 'Slow-tempo R&B with layered harmonies. Writes everything on a secondhand keyboard.',
    looking: 'Looking for a lyricist' },
  { name: 'Anbu Strings', email: 'anbu@auraverse.in', genre: 'Acoustic', city: 'Trichy', followersCount: 4120, hue: 45,
    bio: 'Fingerstyle guitar and soft vocals. Songs recorded on a phone in one take.',
    looking: 'Looking for a violinist' },
];

const tracksData = [
  { title: 'Marina at 6 a.m.', artistEmail: 'nila@auraverse.in', album: 'Salt Air', duration: 214, plays: 482310, genre: 'Indie Pop' },
  { title: 'Paper Boats', artistEmail: 'nila@auraverse.in', album: 'Salt Air', duration: 187, plays: 301442, genre: 'Indie Pop' },
  { title: 'Signal Lost', artistEmail: 'kavin@auraverse.in', album: 'Kovai Tapes', duration: 163, plays: 190220, genre: 'Hip-hop' },
  { title: 'Rooftop Cypher', artistEmail: 'kavin@auraverse.in', album: 'Kovai Tapes', duration: 201, plays: 144900, genre: 'Hip-hop' },
  { title: 'Raga in Reverse', artistEmail: 'ritu@auraverse.in', album: 'Sruti Box', duration: 258, plays: 612034, genre: 'Carnatic Fusion' },
  { title: 'Monsoon Alaap', artistEmail: 'ritu@auraverse.in', album: 'Sruti Box', duration: 232, plays: 398771, genre: 'Carnatic Fusion' },
  { title: 'Rainy Hostel Nights', artistEmail: 'echolane@auraverse.in', album: 'Room 204', duration: 142, plays: 1203887, genre: 'Lo-fi' },
  { title: 'Quiet Library', artistEmail: 'echolane@auraverse.in', album: 'Room 204', duration: 156, plays: 954120, genre: 'Lo-fi' },
  { title: 'Last Bus to Madurai', artistEmail: 'statictide@auraverse.in', album: 'Loud Wires', duration: 244, plays: 88230, genre: 'Rock' },
  { title: 'Loud Wires', artistEmail: 'statictide@auraverse.in', album: 'Loud Wires', duration: 198, plays: 61004, genre: 'Rock' },
  { title: 'Night Metro', artistEmail: 'dhruv@auraverse.in', album: 'Tram Lines', duration: 276, plays: 233410, genre: 'Electronic' },
  { title: 'Soft Static', artistEmail: 'dhruv@auraverse.in', album: 'Tram Lines', duration: 221, plays: 170562, genre: 'Electronic' },
  { title: 'Slow Burn', artistEmail: 'mirajo@auraverse.in', album: 'Second Hand Keys', duration: 207, plays: 402318, genre: 'R&B' },
  { title: 'Say It Slower', artistEmail: 'mirajo@auraverse.in', album: 'Second Hand Keys', duration: 193, plays: 276003, genre: 'R&B' },
  { title: 'Two Chords Home', artistEmail: 'anbu@auraverse.in', album: 'One Take', duration: 175, plays: 52810, genre: 'Acoustic' },
  { title: 'Porch Light', artistEmail: 'anbu@auraverse.in', album: 'One Take', duration: 189, plays: 44190, genre: 'Acoustic' },
];

const collabsData = [
  { artistEmail: 'nila@auraverse.in', title: 'Lead guitar for a monsoon-themed EP', role: 'Guitarist', genre: 'Indie Pop', bpm: 96,
    description: 'Four songs, clean tones with a bit of reverb. I have the chords and vocals recorded, need melodic lead lines.' },
  { artistEmail: 'kavin@auraverse.in', title: 'Hook singer for "Rooftop Cypher" remix', role: 'Vocalist', genre: 'Hip-hop', bpm: 88,
    description: 'Need a 16-bar hook, Tamil or English. Stems and a reference vocal will be shared.' },
  { artistEmail: 'ritu@auraverse.in', title: 'Producer for odd-meter Carnatic fusion', role: 'Producer', genre: 'Carnatic Fusion', bpm: 110,
    description: 'Looking for someone comfortable with 7/8 and 9/8 grooves. I will bring the vocals and tanpura.' },
  { artistEmail: 'echolane@auraverse.in', title: 'Spoken word over a rainy-day loop', role: 'Vocalist', genre: 'Lo-fi', bpm: 72,
    description: 'Two-minute instrumental ready. Looking for a calm voice, any language.' },
  { artistEmail: 'statictide@auraverse.in', title: 'Drummer for weekend gigs in Madurai', role: 'Drummer', genre: 'Rock', bpm: 140,
    description: 'We play covers and originals every second Saturday. Own kit preferred, practice space provided.' },
  { artistEmail: 'mirajo@auraverse.in', title: 'Lyricist for a slow R&B single', role: 'Lyricist', genre: 'R&B', bpm: 68,
    description: 'Melody and chords are done. Theme is long-distance friendships. Credit and royalties split equally.' },
  { artistEmail: 'anbu@auraverse.in', title: 'Violin layer for an acoustic single', role: 'Keys', genre: 'Acoustic', bpm: 84,
    description: 'Simple guitar and vocal track, needs a warm string line in the second verse.' },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    createDemoAudioFile();

    console.log('Clearing database collections...');
    await User.deleteMany({});
    await Track.deleteMany({});
    await Collab.deleteMany({});
    await Playlist.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});

    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // Create student demo user
    const studentUser = await User.create({
      name: 'Auraverse Student',
      email: 'student@auraverse.in',
      passwordHash: defaultPasswordHash,
      genre: 'Indie Pop',
      city: 'Bengaluru',
      bio: 'College student exploring music production.',
      looking: 'Looking to collaborate on indie pop tracks.',
      hue: 140,
      isArtist: true,
    });

    console.log('Seeding artists...');
    const userMap = {};
    userMap['student@auraverse.in'] = studentUser;

    for (const a of artistsData) {
      const u = await User.create({
        ...a,
        passwordHash: defaultPasswordHash,
        isArtist: true,
      });
      userMap[a.email] = u;
    }

    console.log('Seeding tracks...');
    for (const t of tracksData) {
      const owner = userMap[t.artistEmail];
      if (owner) {
        await Track.create({
          title: t.title,
          genre: t.genre,
          audioUrl: '/uploads/demo.mp3',
          duration: t.duration,
          plays: t.plays,
          album: t.album,
          owner: owner._id,
        });
      }
    }

    console.log('Seeding collabs...');
    for (const c of collabsData) {
      const owner = userMap[c.artistEmail];
      if (owner) {
        await Collab.create({
          title: c.title,
          role: c.role,
          genre: c.genre,
          bpm: c.bpm,
          description: c.description,
          owner: owner._id,
          interested: [],
        });
      }
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
