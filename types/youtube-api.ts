/**
 * YouTube API Response Types
 * Based on YouTube Data API v3 specification
 */

export interface YouTubeSearchItem {
    id: {
        kind: string;
        videoId: string;
    };
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: { url: string; width?: number; height?: number };
            medium?: { url: string; width?: number; height?: number };
            high?: { url: string; width?: number; height?: number };
        };
        channelTitle: string;
        liveBroadcastContent: string;
    };
}

export interface YouTubeSearchResponse {
    kind: string;
    etag: string;
    nextPageToken?: string;
    prevPageToken?: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YouTubeSearchItem[];
}

export interface YouTubeVideoItem {
    id: string;
    contentDetails: {
        duration: string;
        dimension: string;
        definition: string;
        caption: string;
        licensedContent: boolean;
        projection: string;
    };
}

export interface YouTubeVideosResponse {
    kind: string;
    etag: string;
    items: YouTubeVideoItem[];
}
