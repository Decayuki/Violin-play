-- Add IMSLP metadata columns to songs table
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS imslp_id TEXT,
ADD COLUMN IF NOT EXISTS imslp_url TEXT,
ADD COLUMN IF NOT EXISTS composer TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS difficulty_tags TEXT[],
ADD COLUMN IF NOT EXISTS youtube_video_id TEXT,
ADD COLUMN IF NOT EXISTS youtube_title TEXT,
ADD COLUMN IF NOT EXISTS youtube_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS import_source TEXT CHECK (import_source IN ('manual', 'imslp', 'upload')),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_songs_imslp_id ON songs(imslp_id);
CREATE INDEX IF NOT EXISTS idx_songs_composer ON songs(composer);
CREATE INDEX IF NOT EXISTS idx_songs_difficulty_level ON songs(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_songs_youtube_video_id ON songs(youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_songs_metadata ON songs USING gin(metadata);

-- Add comments for documentation
COMMENT ON COLUMN songs.imslp_id IS 'Unique identifier from IMSLP';
COMMENT ON COLUMN songs.imslp_url IS 'Direct URL to the IMSLP page';
COMMENT ON COLUMN songs.composer IS 'Composer name from IMSLP';
COMMENT ON COLUMN songs.difficulty_level IS 'Overall difficulty rating';
COMMENT ON COLUMN songs.difficulty_tags IS 'Array of difficulty-related tags';
COMMENT ON COLUMN songs.youtube_video_id IS 'YouTube video ID for accompaniment';
COMMENT ON COLUMN songs.youtube_title IS 'Title of the YouTube video';
COMMENT ON COLUMN songs.youtube_thumbnail IS 'Thumbnail URL from YouTube';
COMMENT ON COLUMN songs.import_source IS 'Source of the sheet music import';
COMMENT ON COLUMN songs.metadata IS 'Additional flexible metadata storage';
