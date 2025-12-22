export interface IMSLPWork {
    id: string;
    title: string;
    composer: string;
    url: string;
    thumbnail?: string;
    description?: string;
    instrumentation?: string;
    yearComposed?: string;
}

export interface IMSLPScore {
    id: string;
    workId: string;
    title: string;
    pdfUrl: string;
    pageCount?: number;
    fileSizeMB?: number;
    editor?: string;
    publisher?: string;
    copyright: 'public-domain' | 'creative-commons' | 'copyright';
}

export interface IMSLPSearchResult {
    works: IMSLPWork[];
    totalResults: number;
    hasMore: boolean;
}

export interface YouTubeVideo {
    id: string;
    title: string;
    channelTitle: string;
    thumbnail: string;
    duration: string;
    publishedAt: string;
    description: string;
}

export interface YouTubeSearchResult {
    videos: YouTubeVideo[];
    totalResults: number;
    nextPageToken?: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ImportSource = 'manual' | 'imslp' | 'upload';

export interface SongMetadata {
    imslp_id?: string;
    imslp_url?: string;
    composer?: string;
    difficulty_level?: DifficultyLevel;
    difficulty_tags?: string[];
    youtube_video_id?: string;
    youtube_title?: string;
    youtube_thumbnail?: string;
    import_source?: ImportSource;
    metadata?: Record<string, any>;
}
