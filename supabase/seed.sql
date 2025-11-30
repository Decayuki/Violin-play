-- Seed data for Violin Practice App

-- Insert some sample songs
INSERT INTO songs (title, composer, base_difficulty, tags, pdf_url, backtrack_url, cover_url) VALUES
('Attack On Titan (Easy)', 'Hiroyuki Sawano', 1, ARRAY['anime'], '/sheets/partitions/Attack On Titan - Easy Violin.pdf', NULL, NULL),
('Attack On Titan (Advanced)', 'Hiroyuki Sawano', 4, ARRAY['anime'], '/sheets/partitions/Attack On Titan- Advanced Violin.pdf', NULL, NULL),
('Bach Concerto in A Minor', 'J.S. Bach', 4, ARRAY['classique', 'baroque', 'concerto'], '/sheets/partitions/Bach Concerto in A Minor.pdf', NULL, NULL),
('Bohemian Rhapsody', 'Queen', 3, ARRAY['rock'], '/sheets/partitions/Bohemian Rhapsody.pdf', NULL, NULL),
('Chasing Cars', 'Snow Patrol', 1, ARRAY['rock', 'ballade'], '/sheets/partitions/Chasing Cars - Violin.pdf', NULL, NULL);

-- Insert a sample student (if needed, usually linked to auth user)
-- INSERT INTO students (name, default_level) VALUES ('Test Student', 2);
