# Violin Practice App - Roadmap 2025

## 🎯 Priorités

### Phase 1: Fonctionnalités Core (High Priority)
- **Feat 1**: Auto-fetch YouTube accompaniments
- **Fix**: Code cleanup & optimization
- **Fix**: Auto-scrolling en mode side player

### Phase 2: UX/UI Improvements (Medium Priority)
- **Fix**: Design uniformization
- **Fix**: Auth flow (SignIn/SignUp)
- **Feat 3**: Visual effects (Tetris Effect-like)

### Phase 3: Advanced Features (Low Priority)
- **Feat 4**: Pedagogical features (playlists pédagogiques)
- **Feat 5**: Fretboard display (Violin Hero mode)
- **Feat 6**: YouTube playlist integration (@FiddlingwithmyWhistle)

---

## 📋 Détail des Features

### ✅ Feat 1: Auto-fetch YouTube Accompaniments

**Objectif**: Enrichir automatiquement les partitions sans backtrack avec des vidéos YouTube

**Workflow**:
1. Détection automatique: Si `backtrack_url` ou `cover_url` est null au chargement
2. Recherche YouTube automatique avec `${title} ${composer} violin accompaniment`
3. Interface de sélection: L'utilisateur écoute et choisit la meilleure version
4. Sauvegarde: Stockage du `youtube_video_id` dans la DB
5. Auto-load: Chargement automatique lors des prochaines sessions

**Branche**: `feat/auto-youtube-accompaniment`

**Tâches**:
- [ ] Créer hook `useYouTubeAccompaniment` pour détecter les morceaux sans backtrack
- [ ] Créer composant `YouTubeSelector` avec preview et sélection
- [ ] Ajouter colonne `youtube_video_id` à la table `songs` (déjà fait dans migration)
- [ ] Implémenter logique de sauvegarde
- [ ] Intégrer le player YouTube dans `AudioPlayer`

**Estimation**: 1-2 jours

---

### 🧹 Fix: Code Cleanup & Optimization

**Objectif**: Moderniser et optimiser le codebase 2025

**Branche**: `refactor/code-cleanup-2025`

**Audit Complet**:
- [ ] **Analyse des dépendances**: Vérifier versions (Next.js, React, Supabase)
- [ ] **Code mort**: Identifier et supprimer le code inutilisé
- [ ] **Duplications**: Fusionner les fonctions dupliquées
- [ ] **Documentation**: Consulter docs officielles (Next.js 16, React 19)

**Optimisations**:
- [ ] **State Management**:
  - Option 1: Zustand (déjà utilisé, léger et moderne)
  - Option 2: Redux Toolkit (plus verbeux mais standard)
  - **Recommandation**: Garder Zustand, créer des stores modulaires

- [ ] **Performance**:
  - [ ] Lazy loading des composants lourds (PDF viewer, Audio player)
  - [ ] Memoization (React.memo, useMemo, useCallback)
  - [ ] Image optimization (next/image)
  - [ ] Code splitting par route

- [ ] **Architecture**:
  - [ ] Créer `/hooks` centralisé
  - [ ] Créer `/lib/utils` pour fonctions communes
  - [ ] Séparer logique métier des composants UI

- [ ] **TypeScript**:
  - [ ] Types stricts (mode strict)
  - [ ] Supprimer tous les `any`
  - [ ] Créer types partagés dans `/types`

**Estimation**: 3-4 jours

---

### 🎨 Fix: Design & UX

**Branche**: `design/ui-improvements`

**Tâches**:
- [ ] **Logo**: Créer un vrai logo (utiliser Midjourney/DALL-E ou Figma)
- [ ] **Nom**: Choisir un nom définitif
- [ ] **Charte graphique**: Uniformiser les catégories
  - Utiliser les mêmes classes Tailwind
  - Créer composant `CategoryCard` réutilisable
- [ ] **Nouvelles catégories**: Ajouter "Wagon Wheels", "Fast Forward"
- [ ] **Auto-scrolling**: Fixer le scroll en mode side player
- [ ] **Fullscreen icons**: Débugger les icônes (le "f" fonctionne)

**Estimation**: 2 jours

---

### 🔐 Fix: Auth Flow

**Branche**: `fix/auth-improvements`

**Objectifs**:
- [ ] Revoir les flows SignIn/SignUp (UX plus fluide)
- [ ] Ajouter "Forgot Password"
- [ ] Ajouter OAuth (Google, GitHub) via Supabase
- [ ] Page de profil utilisateur
- [ ] Settings utilisateur:
  - Préférences d'affichage
  - Niveau de pratique
  - Instruments possédés

**Estimation**: 1-2 jours

---

### ✨ Feat 3: Visual Effects (Tetris Effect-like)

**Objectif**: Feedback visuel lors d'annotations bien placées

**Branche**: `feat/visual-effects`

**Librairies suggérées**:
- [particles.js](https://vincentgarreau.com/particles.js/)
- [tsparticles](https://particles.js.org/)
- [react-spring](https://www.react-spring.dev/) pour animations fluides
- Canvas API native pour effets custom

**Implémentation**:
- [ ] Détecter les "bonnes notes" (annotations multiples/précises)
- [ ] Trigger effet lumineux
- [ ] Paramètre pour activer/désactiver

**Estimation**: 1 jour

---

### 📚 Feat 4: Pedagogical Features

**Objectif**: Playlists YouTube pédagogiques (vibrato, technique, etc.)

**Branche**: `feat/pedagogical-playlists`

**Structure**:
- Table `playlists`:
  ```sql
  - id
  - user_id
  - name (ex: "Vibrato Training")
  - description
  - type (song / youtube)
  - created_at
  ```

- Table `playlist_items`:
  ```sql
  - id
  - playlist_id
  - item_type (song / youtube_video)
  - item_id (song_id ou youtube_video_id)
  - order
  ```

**Features**:
- [ ] CRUD playlists
- [ ] Ajouter vidéos YouTube ou morceaux
- [ ] Mode "Training" avec progression

**Estimation**: 2-3 jours

---

### 🎻 Feat 5: Fretboard Display (Violin Hero)

**Objectif**: Affichage type Guitar Hero pour le violon

**Branche**: `feat/violin-hero-mode`

**Complexité**: Nécessite:
- Parsing de la partition (notes + timing)
- Synchronisation avec audio
- Rendu temps réel

**Librairies**:
- [VexFlow](https://www.vexflow.com/) pour parsing notation
- Canvas pour rendering

**Estimation**: 5-7 jours (complexe)

**Priorité**: Basse (feature "nice to have")

---

### 🎥 Feat 6: YouTube Playlist Integration

**Objectif**: Intégrer contenu de @FiddlingwithmyWhistle

**Branche**: `feat/youtube-playlist-integration`

**Workflow**:
1. Fetch playlists via YouTube API
2. Display dans interface custom
3. Créer "Mes Playlists" vs "Playlists YouTube"
4. Toggle/Switch pour filtrer

**Tâches**:
- [ ] API route `/api/youtube/playlists`
- [ ] Composant `PlaylistSelector`
- [ ] Sauvegarde playlists favorites
- [ ] Mode "Playlist" vs "Song" sur écran principal

**Estimation**: 2 jours

---

## 🗓️ Planning Suggéré

### Sprint 1 (Semaine 1)
- ✅ **Feat 1**: Auto-fetch YouTube accompaniments
- 🧹 **Fix**: Code cleanup (partie 1)

### Sprint 2 (Semaine 2)
- 🧹 **Fix**: Code cleanup (partie 2 - optimisation)
- 🎨 **Fix**: Design uniformization

### Sprint 3 (Semaine 3)
- 🔐 **Fix**: Auth flow
- ✨ **Feat 3**: Visual effects

### Sprint 4 (Semaine 4+)
- 📚 **Feat 4**: Pedagogical playlists
- 🎥 **Feat 6**: YouTube integration
- 🎻 **Feat 5**: Violin Hero (optionnel)

---

## 🚀 Prochaine Étape Immédiate

**Feat 1: Auto-fetch YouTube Accompaniments**

Pourquoi commencer par ça ?
1. Impact utilisateur immédiat
2. Utilise les APIs YouTube déjà configurées
3. Feature demandée explicitement
4. Relativement simple à implémenter

Veux-tu que je commence cette feature maintenant ? 🎻
