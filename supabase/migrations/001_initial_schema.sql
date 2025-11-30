-- =============================================
-- VIOLIN PRACTICE APP - DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: songs
-- Bibliothèque principale des morceaux
-- =============================================
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    composer VARCHAR(255),
    base_difficulty INTEGER NOT NULL CHECK (base_difficulty BETWEEN 1 AND 4),
    tags TEXT[] DEFAULT '{}',
    pdf_url TEXT,
    backtrack_url TEXT,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche par titre
CREATE INDEX idx_songs_title ON songs USING gin(to_tsvector('french', title));
-- Index pour filtrage par difficulté
CREATE INDEX idx_songs_difficulty ON songs(base_difficulty);
-- Index pour recherche par tags
CREATE INDEX idx_songs_tags ON songs USING gin(tags);

-- =============================================
-- TABLE: students
-- Élèves du professeur
-- =============================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    default_level INTEGER CHECK (default_level BETWEEN 1 AND 4),
    avatar_url TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_active ON students(is_active);

-- =============================================
-- TABLE: catalogues
-- Collections de morceaux
-- =============================================
CREATE TABLE catalogues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    color VARCHAR(7) DEFAULT '#6366f1',  -- Couleur hex pour l'UI
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_catalogues_owner ON catalogues(owner_id);
CREATE INDEX idx_catalogues_student ON catalogues(student_id);

-- =============================================
-- TABLE: catalogue_songs
-- Relation N-N entre catalogues et songs
-- =============================================
CREATE TABLE catalogue_songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalogue_id UUID REFERENCES catalogues(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    "order" INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(catalogue_id, song_id)
);

CREATE INDEX idx_catalogue_songs_catalogue ON catalogue_songs(catalogue_id);
CREATE INDEX idx_catalogue_songs_order ON catalogue_songs(catalogue_id, "order");

-- =============================================
-- TABLE: user_difficulties
-- Reclassement de difficulté par utilisateur
-- =============================================
CREATE TABLE user_difficulties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    user_difficulty INTEGER NOT NULL CHECK (user_difficulty BETWEEN 1 AND 4),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, song_id)
);

CREATE INDEX idx_user_difficulties_user ON user_difficulties(user_id);

-- =============================================
-- TABLE: practice_sessions (v2 - optionnel)
-- Historique des séances de pratique
-- =============================================
CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    accompaniment_type VARCHAR(20) CHECK (accompaniment_type IN ('backtrack', 'cover', 'none')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- TRIGGERS: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_songs_updated_at
    BEFORE UPDATE ON songs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalogues_updated_at
    BEFORE UPDATE ON catalogues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_difficulties_updated_at
    BEFORE UPDATE ON user_difficulties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogue_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_difficulties ENABLE ROW LEVEL SECURITY;

-- Songs: lecture publique, écriture admin seulement
CREATE POLICY "Songs are viewable by everyone" ON songs
    FOR SELECT USING (true);

-- Note: Admin check usually requires a custom claim or a separate table lookup. 
-- For now using a placeholder check for 'admin' role in metadata.
CREATE POLICY "Songs are editable by admin" ON songs
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Catalogues: visibles par owner uniquement
CREATE POLICY "Catalogues are viewable by owner" ON catalogues
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Catalogues are editable by owner" ON catalogues
    FOR ALL USING (auth.uid() = owner_id);

-- User difficulties: propre à chaque user
CREATE POLICY "User difficulties are personal" ON user_difficulties
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- VIEWS utiles
-- =============================================
CREATE OR REPLACE VIEW songs_with_effective_difficulty AS
SELECT 
    s.*,
    ud.user_difficulty,
    COALESCE(ud.user_difficulty, s.base_difficulty) AS effective_difficulty
FROM songs s
LEFT JOIN user_difficulties ud ON s.id = ud.song_id AND ud.user_id = auth.uid();

-- =============================================
-- FONCTIONS utiles
-- =============================================

-- Fonction pour récupérer les songs d'un catalogue avec difficulté effective
CREATE OR REPLACE FUNCTION get_catalogue_songs(p_catalogue_id UUID)
RETURNS TABLE (
    song_id UUID,
    title VARCHAR,
    composer VARCHAR,
    base_difficulty INTEGER,
    effective_difficulty INTEGER,
    tags TEXT[],
    pdf_url TEXT,
    backtrack_url TEXT,
    cover_url TEXT,
    "order" INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.composer,
        s.base_difficulty,
        COALESCE(ud.user_difficulty, s.base_difficulty),
        s.tags,
        s.pdf_url,
        s.backtrack_url,
        s.cover_url,
        cs."order"
    FROM catalogue_songs cs
    JOIN songs s ON s.id = cs.song_id
    LEFT JOIN user_difficulties ud ON s.id = ud.song_id AND ud.user_id = auth.uid()
    WHERE cs.catalogue_id = p_catalogue_id
    ORDER BY cs."order";
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
