# 🎻 Violin Practice App - Récap Technique Backend

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│                    (Next.js App)                        │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────────┐     ┌─────────────────────┐
│    SUPABASE       │     │   CLOUDFLARE R2     │
│  - PostgreSQL DB  │     │   - Audio files     │
│  - Auth           │     │   - Backtracks      │
│  - Storage (PDFs) │     │   - Covers          │
└───────────────────┘     └─────────────────────┘
```

---

## Supabase

### Credentials
```env
NEXT_PUBLIC_SUPABASE_URL=https://ypwdnjhptckffyxdwxko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd2RuamhwdGNrZmZ5eGR3eGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMzc3ODQsImV4cCI6MjA3OTkxMzc4NH0.p0o5SeHDEEhjtNk0ZxnTocFAm1LrStPxP-ay0jWKLus
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd2RuamhwdGNrZmZ5eGR3eGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMzNzc4NCwiZXhwIjoyMDc5OTA3NTYwfQ.211tYYtRtG4G3TE3P9sQNSnMXKigav46lDjaF-X1Aq4
```

### Tables principales

#### `songs` (418 morceaux)
```sql
id              UUID PRIMARY KEY
title           TEXT NOT NULL UNIQUE
composer        TEXT
base_difficulty INTEGER (1-4) -- 1=Easy, 2=Medium, 3=Hard, 4=Expert
tags            TEXT[] -- ['anime', 'film', 'classique', 'pop', 'noel', etc.]
pdf_url         TEXT -- URL Supabase Storage
backtrack_url   TEXT -- URL Cloudflare R2 (peut être null)
cover_url       TEXT -- URL Cloudflare R2 (peut être null)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `students`
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
email           TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `catalogues` (playlists personnalisées par élève)
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
owner_id        UUID REFERENCES students(id)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `catalogue_songs` (relation many-to-many)
```sql
id              UUID PRIMARY KEY
catalogue_id    UUID REFERENCES catalogues(id)
song_id         UUID REFERENCES songs(id)
order           INTEGER -- pour le tri personnalisé
added_at        TIMESTAMPTZ
```

#### `user_difficulties` (reclassement perçu par l'utilisateur)
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES students(id)
song_id         UUID REFERENCES songs(id)
perceived_difficulty INTEGER (1-4)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
UNIQUE(user_id, song_id)
```

#### `practice_sessions` (logs de séance)
```sql
id              UUID PRIMARY KEY  
user_id         UUID REFERENCES students(id)
song_id         UUID REFERENCES songs(id)
started_at      TIMESTAMPTZ
ended_at        TIMESTAMPTZ
duration_seconds INTEGER
```

### View utile

#### `songs_with_effective_difficulty`
Retourne la difficulté effective (perçue par l'user si elle existe, sinon base_difficulty).

### Storage Supabase

**Bucket `sheets`** (public)
- Contient les PDFs des partitions
- URL pattern: `https://ypwdnjhptckffyxdwxko.supabase.co/storage/v1/object/public/sheets/partitions/{slug}.pdf`

---

## Cloudflare R2

### Credentials
```env
R2_ENDPOINT=https://e9513504300f3b2387e2eecdec7e5d41.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=41ea647cf6e41bd88ddd5f2e26bab802
R2_SECRET_ACCESS_KEY=47648585a22685b81cb6018d328d9037fb040e841a333a395fc59f9d1fc52142
R2_PUBLIC_URL=https://pub-c9694d87e5264f7796e4e2b186ad7ab7.r2.dev
R2_BUCKET=violin-bucket
```

### Structure
```
violin-bucket/
├── backtracks/          # 47 fichiers MP3 (accompagnement sans violon)
│   ├── game-of-thrones.mp3
│   ├── bohemian-rhapsody.mp3
│   └── ...
└── covers/              # 144 fichiers MP3 (version avec violon)
    ├── a-thousand-years.mp3
    ├── bad-guy.mp3
    └── ...
```

### URLs publiques
```
https://pub-c9694d87e5264f7796e4e2b186ad7ab7.r2.dev/backtracks/{slug}.mp3
https://pub-c9694d87e5264f7796e4e2b186ad7ab7.r2.dev/covers/{slug}.mp3
```

---

## Données actuelles

| Ressource | Quantité | Stockage |
|-----------|----------|----------|
| Morceaux en DB | 418 | Supabase PostgreSQL |
| PDFs (partitions) | 418 | Supabase Storage |
| Backtracks | 47 | Cloudflare R2 |
| Covers | 144 | Cloudflare R2 |

### Distribution par difficulté
- Niveau 1 (Easy): 42 morceaux
- Niveau 2 (Medium): 319 morceaux
- Niveau 3 (Hard): 52 morceaux
- Niveau 4 (Expert): 5 morceaux

---

## Exemple de requêtes

### Récupérer tous les morceaux niveau 1-2
```typescript
const { data } = await supabase
  .from('songs')
  .select('*')
  .in('base_difficulty', [1, 2])
  .order('title');
```

### Récupérer un morceau avec ses URLs
```typescript
const { data } = await supabase
  .from('songs')
  .select('id, title, base_difficulty, pdf_url, backtrack_url, cover_url')
  .eq('id', songId)
  .single();

// data.pdf_url      → URL du PDF (Supabase)
// data.backtrack_url → URL MP3 sans violon (R2) - peut être null
// data.cover_url     → URL MP3 avec violon (R2) - peut être null
```

### Récupérer les morceaux d'un catalogue
```typescript
const { data } = await supabase
  .from('catalogue_songs')
  .select(`
    order,
    songs (id, title, base_difficulty, pdf_url, backtrack_url, cover_url)
  `)
  .eq('catalogue_id', catalogueId)
  .order('order');
```

---

## Notes importantes

1. **Audio optionnel** : Tous les morceaux ont un PDF, mais seulement certains ont des fichiers audio (backtrack/cover). L'UI doit gérer le cas où `backtrack_url` ou `cover_url` est `null`.

2. **Deux types d'audio** :
   - `backtrack_url` = accompagnement SANS violon (pour jouer par-dessus)
   - `cover_url` = version AVEC violon (pour écouter/apprendre)

3. **Difficulté perçue** : Un utilisateur peut reclasser la difficulté d'un morceau via `user_difficulties`. Utiliser la view `songs_with_effective_difficulty` pour avoir la difficulté effective.

4. **Tags disponibles** : `anime`, `film`, `serie-tv`, `jeu-video`, `classique`, `pop`, `rock`, `metal`, `jazz`, `folk`, `noel`, `mariage`, etc.
