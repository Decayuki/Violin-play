/**
 * 🎵 VIOLIN PRACTICE APP - AUDIO SEED SCRIPT (Cloudflare R2)
 * 
 * Uploads backtracks and covers to Cloudflare R2
 * and updates the songs table in Supabase with URLs.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Supabase
  SUPABASE_URL: 'https://ypwdnjhptckffyxdwxko.supabase.co',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd2RuamhwdGNrZmZ5eGR3eGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMzNzc4NCwiZXhwIjoyMDc5OTEzNzg0fQ.211tYYtRtG4G3TE3P9sQNSnMXKigav46lDjaF-X1Aq4',

  // Cloudflare R2
  R2_ENDPOINT: 'https://e9513504300f3b2387e2eecdec7e5d41.r2.cloudflarestorage.com',
  R2_ACCESS_KEY_ID: '41ea647cf6e41bd88ddd5f2e26bab802',
  R2_SECRET_ACCESS_KEY: '47648585a22685b81cb6018d328d9037fb040e841a333a395fc59f9d1fc52142',
  R2_BUCKET: 'violin-bucket',
  R2_PUBLIC_URL: 'https://pub-c9694d87e5264f7796e4e2b186ad7ab7.r2.dev',

  // Audio folders
  BACKTRACKS_FOLDER: '/Users/yukimurra/Media/Violon/VIOLIN MP3 BACKING TRACKS',
  COVERS_FOLDER: "/Users/yukimurra/Media/Violon/VIOLIN PERFORMANCE MP3's",
};

// ============================================
// CLIENTS
// ============================================

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);

const r2 = new S3Client({
  region: 'auto',
  endpoint: CONFIG.R2_ENDPOINT,
  credentials: {
    accessKeyId: CONFIG.R2_ACCESS_KEY_ID,
    secretAccessKey: CONFIG.R2_SECRET_ACCESS_KEY,
  },
});

// ============================================
// HELPERS
// ============================================

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function extractTitle(filename) {
  let title = filename
    .replace(/\.(mp3|wav|m4a|flac)$/i, '')
    .replace(/\s*-\s*backing\s*track\.?$/i, '')
    .replace(/\s*-\s*violin\s*backing\s*track\.?$/i, '')
    .replace(/\s*-\s*piano\s*backing\.?$/i, '')
    .replace(/\s*\(backing\s*only\)\.?$/i, '')
    .replace(/_backing$/i, '')
    .replace(/\s*-\s*with\s*intro\.?$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s*-\s*8D\.?$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return title;
}

function findMatchingSong(filename, songs) {
  const extractedTitle = extractTitle(filename);
  const normalizedExtracted = normalize(extractedTitle);

  // Exact match
  for (const song of songs) {
    if (normalize(song.title) === normalizedExtracted) {
      return { song, confidence: 'exact' };
    }
  }

  // Contains match
  for (const song of songs) {
    const normalizedSong = normalize(song.title);
    if (normalizedSong.includes(normalizedExtracted) || normalizedExtracted.includes(normalizedSong)) {
      return { song, confidence: 'partial' };
    }
  }

  // Fuzzy match
  const prefix = normalizedExtracted.slice(0, 10);
  for (const song of songs) {
    if (normalize(song.title).startsWith(prefix)) {
      return { song, confidence: 'fuzzy' };
    }
  }

  return null;
}

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getAudioFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`   ❌ Directory not found: ${dir}`);
    return [];
  }

  const files = fs.readdirSync(dir);
  return files.filter(f => /\.(mp3|wav|m4a|flac)$/i.test(f));
}

function getContentType(ext) {
  const types = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',
  };
  return types[ext.toLowerCase()] || 'audio/mpeg';
}

async function uploadToR2(filePath, key) {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath);

  const command = new PutObjectCommand({
    Bucket: CONFIG.R2_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: getContentType(ext),
  });

  await r2.send(command);

  return `${CONFIG.R2_PUBLIC_URL}/${key}`;
}

// ============================================
// MAIN
// ============================================

async function seed() {
  console.log('\n🎵 VIOLIN PRACTICE APP - AUDIO SEED (Cloudflare R2)');
  console.log('='.repeat(60));

  // Load songs from DB
  console.log('\n📂 Loading songs from database...');
  const { data: songs, error: songsError } = await supabase
    .from('songs')
    .select('id, title');

  if (songsError) {
    console.error('   ❌ Error loading songs:', songsError.message);
    process.exit(1);
  }
  console.log(`   Found ${songs.length} songs in database`);

  // Get audio files
  console.log('\n📁 Scanning audio folders...');
  const backtracks = getAudioFiles(CONFIG.BACKTRACKS_FOLDER);
  const covers = getAudioFiles(CONFIG.COVERS_FOLDER);
  console.log(`   Backtracks: ${backtracks.length} files`);
  console.log(`   Covers: ${covers.length} files`);

  const results = {
    backtracks: { success: 0, noMatch: 0, errors: [] },
    covers: { success: 0, noMatch: 0, errors: [] }
  };

  // Process backtracks
  console.log('\n🎹 Processing BACKTRACKS...\n');

  for (let i = 0; i < backtracks.length; i++) {
    const filename = backtracks[i];
    const progress = `[${i + 1}/${backtracks.length}]`;

    process.stdout.write(`${progress} "${filename.slice(0, 40)}${filename.length > 40 ? '...' : ''}" `);

    const match = findMatchingSong(filename, songs);

    if (!match) {
      console.log('⚠️  No match');
      results.backtracks.noMatch++;
      continue;
    }

    try {
      const filePath = path.join(CONFIG.BACKTRACKS_FOLDER, filename);
      const ext = path.extname(filename).toLowerCase();
      const key = `backtracks/${slugify(match.song.title)}${ext}`;

      // Upload to R2
      const publicUrl = await uploadToR2(filePath, key);

      // Update song in Supabase
      const { error: updateError } = await supabase
        .from('songs')
        .update({ backtrack_url: publicUrl })
        .eq('id', match.song.id);

      if (updateError) throw new Error(updateError.message);

      console.log(`✅ → ${match.song.title}`);
      results.backtracks.success++;

    } catch (error) {
      console.log(`❌ ${error.message}`);
      results.backtracks.errors.push({ file: filename, error: error.message });
    }
  }

  // Process covers
  console.log('\n🎻 Processing COVERS (with violin)...\n');

  for (let i = 0; i < covers.length; i++) {
    const filename = covers[i];
    const progress = `[${i + 1}/${covers.length}]`;

    process.stdout.write(`${progress} "${filename.slice(0, 40)}${filename.length > 40 ? '...' : ''}" `);

    const match = findMatchingSong(filename, songs);

    if (!match) {
      console.log('⚠️  No match');
      results.covers.noMatch++;
      continue;
    }

    try {
      const filePath = path.join(CONFIG.COVERS_FOLDER, filename);
      const ext = path.extname(filename).toLowerCase();
      const key = `covers/${slugify(match.song.title)}${ext}`;

      // Upload to R2
      const publicUrl = await uploadToR2(filePath, key);

      // Update song in Supabase
      const { error: updateError } = await supabase
        .from('songs')
        .update({ cover_url: publicUrl })
        .eq('id', match.song.id);

      if (updateError) throw new Error(updateError.message);

      console.log(`✅ → ${match.song.title}`);
      results.covers.success++;

    } catch (error) {
      console.log(`❌ ${error.message}`);
      results.covers.errors.push({ file: filename, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log('\nBACKTRACKS:');
  console.log(`   ✅ Success: ${results.backtracks.success}`);
  console.log(`   ⚠️  No match: ${results.backtracks.noMatch}`);
  console.log(`   ❌ Errors: ${results.backtracks.errors.length}`);

  console.log('\nCOVERS:');
  console.log(`   ✅ Success: ${results.covers.success}`);
  console.log(`   ⚠️  No match: ${results.covers.noMatch}`);
  console.log(`   ❌ Errors: ${results.covers.errors.length}`);

  console.log('\n🎉 Audio seed complete!\n');
}

seed().catch(console.error);
