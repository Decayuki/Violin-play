-- =============================================
-- TABLE: annotations
-- Stores drawing data for PDF pages
-- =============================================
CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    page_number INTEGER NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(song_id, user_id, page_number)
);

-- Index for fast retrieval by song and user
CREATE INDEX idx_annotations_lookup ON annotations(song_id, user_id, page_number);

-- Trigger for updated_at
CREATE TRIGGER update_annotations_updated_at
    BEFORE UPDATE ON annotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Annotations are viewable by owner" ON annotations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Annotations are editable by owner" ON annotations
    FOR ALL USING (auth.uid() = user_id);
