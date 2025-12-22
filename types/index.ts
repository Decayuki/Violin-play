export interface Song {
    id: string;
    title: string;
    composer: string | null;
    base_difficulty: number;
    tags: string[];
    pdf_url: string | null;
    backtrack_url: string | null;
    cover_url: string | null;
    youtube_video_id?: string | null;
    youtube_title?: string | null;
    youtube_thumbnail?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Student {
    id: string;
    user_id: string | null;
    name: string;
    default_level: number | null;
    avatar_url: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Catalogue {
    id: string;
    title: string;
    description: string | null;
    owner_id: string;
    student_id: string | null;
    color: string | null;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface CatalogueSong {
    id: string;
    catalogue_id: string;
    song_id: string;
    order: number;
    added_at: string;
}

export interface UserDifficulty {
    id: string;
    user_id: string;
    song_id: string;
    user_difficulty: number;
    updated_at: string;
}

export interface Annotation {
    id: string;
    song_id: string;
    user_id: string;
    page_number: number;
    data: Record<string, any>; // Fabric.js canvas JSON
    created_at: string;
    updated_at: string;
}

// Derived types
export interface SongWithDifficulty extends Song {
    user_difficulty?: number | null;
    effective_difficulty: number;
}

export interface CatalogueWithSongs extends Catalogue {
    songs: SongWithDifficulty[];
}
