#!/usr/bin/env node

/**
 * VIOLIN PRACTICE APP - SEED SCRIPT
 * 
 * Ce script :
 * 1. Lit le catalogue JSON
 * 2. Upload chaque PDF vers Supabase Storage
 * 3. Insère les songs dans la table `songs`
 * 
 * Usage:
 *   node scripts/seed-songs.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ============================================
// CONFIGURATION - MODIFIE CES CHEMINS SI BESOIN
// ============================================

const CONFIG = {
  // Chemin vers le fichier JSON catalogue
  CATALOG_JSON: '/Users/yukimurra/Media/Violon/songs_catalog_full.json',

  // Chemin vers le dossier contenant les PDFs
  PDF_FOLDER: '/Users/yukimurra/Media/Violon/Violin partition',

  // Supabase
  SUPABASE_URL: 'https://ypwdnjhptckffyxdwxko.supabase.co',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd2RuamhwdGNrZmZ5eGR3eGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMzNzc4NCwiZXhwIjoyMDc5OTEzNzg0fQ.211tYYtRtG4G3TE3P9sQNSnMXKigav46lDjaF-X1Aq4',

  // Bucket name dans Supabase Storage
  STORAGE_BUCKET: 'sheets',

  // Dossier dans le bucket
  STORAGE_FOLDER: 'partitions',
};

// ============================================
// INIT SUPABASE CLIENT
// ============================================

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);

// ============================================
// HELPER FUNCTIONS
// ============================================

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '');        // Trim leading/trailing -
}

function findPdfFile(pdfFilename, pdfFolder) {
  // Cherche le fichier exact
  const exactPath = path.join(pdfFolder, pdfFilename);
  if (fs.existsSync(exactPath)) {
    return exactPath;
  }

  // Cherche dans les sous-dossiers
  const items = fs.readdirSync(pdfFolder, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      const subPath = path.join(pdfFolder, item.name, pdfFilename);
      if (fs.existsSync(subPath)) {
        return subPath;
      }
    }
  }

  // Cherche avec un nom similaire (sans extension comparison)
  const baseName = path.basename(pdfFilename, '.pdf').toLowerCase();
  for (const item of items) {
    if (item.isFile() && item.name.toLowerCase().includes(baseName)) {
      return path.join(pdfFolder, item.name);
    }
  }

  return null;
}

async function uploadPdf(filePath, storagePath) {
  const fileBuffer = fs.readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from(CONFIG.STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true, // Overwrite if exists
    });

  if (error) {
    throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(CONFIG.STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

async function insertSong(song) {
  const { data, error } = await supabase
    .from('songs')
    .insert(song)
    .select()
    .single();

  if (error) {
    throw new Error(`Insert failed for "${song.title}": ${error.message}`);
  }

  return data;
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seed() {
  console.log('🎻 VIOLIN PRACTICE APP - SEED SCRIPT\n');
  console.log('='.repeat(50));

  // 1. Load catalog JSON
  console.log('\n📂 Loading catalog JSON...');

  if (!fs.existsSync(CONFIG.CATALOG_JSON)) {
    console.error(`❌ Catalog file not found: ${CONFIG.CATALOG_JSON}`);
    process.exit(1);
  }

  const catalogData = JSON.parse(fs.readFileSync(CONFIG.CATALOG_JSON, 'utf-8'));
  const songs = catalogData.songs;

  console.log(`   Found ${songs.length} songs in catalog`);

  // 2. Check PDF folder
  console.log('\n📁 Checking PDF folder...');

  if (!fs.existsSync(CONFIG.PDF_FOLDER)) {
    console.error(`❌ PDF folder not found: ${CONFIG.PDF_FOLDER}`);
    process.exit(1);
  }

  const pdfFiles = fs.readdirSync(CONFIG.PDF_FOLDER).filter(f => f.endsWith('.pdf'));
  console.log(`   Found ${pdfFiles.length} PDF files`);

  // 3. Process each song
  console.log('\n🚀 Processing songs...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const progress = `[${i + 1}/${songs.length}]`;

    try {
      // Find PDF file
      const pdfPath = findPdfFile(song.pdfFilename, CONFIG.PDF_FOLDER);

      if (!pdfPath) {
        console.log(`${progress} ⚠️  SKIP: "${song.title}" - PDF not found: ${song.pdfFilename}`);
        skipCount++;
        continue;
      }

      // Generate storage path
      const storageName = slugify(song.title) + '.pdf';
      const storagePath = `${CONFIG.STORAGE_FOLDER}/${storageName}`;

      // Upload PDF
      process.stdout.write(`${progress} 📤 Uploading "${song.title}"...`);
      const pdfUrl = await uploadPdf(pdfPath, storagePath);

      // Insert into database
      const dbSong = {
        title: song.title,
        composer: song.composer || null,
        base_difficulty: song.baseDifficulty,
        tags: song.tags || [],
        pdf_url: pdfUrl,
        backtrack_url: null,
        cover_url: null,
      };

      await insertSong(dbSong);

      console.log(` ✅`);
      successCount++;

    } catch (err) {
      console.log(` ❌ ${err.message}`);
      errors.push({ song: song.title, error: err.message });
      errorCount++;
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY\n');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⚠️  Skipped: ${skipCount} (PDF not found)`);
  console.log(`   ❌ Errors:  ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(e => console.log(`   - ${e.song}: ${e.error}`));
  }

  console.log('\n🎉 Seed complete!\n');
}

// ============================================
// RUN
// ============================================

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
