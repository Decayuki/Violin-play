import { NextRequest, NextResponse } from 'next/server';
import type { YouTubeSearchResult, YouTubeVideo } from '@/types/imslp';

/**
 * YouTube Search API Route
 * Searches YouTube for accompaniment videos
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');
        const maxResults = parseInt(searchParams.get('maxResults') || '5');
        const pageToken = searchParams.get('pageToken') || undefined;

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter "q" is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'YouTube API key not configured' },
                { status: 500 }
            );
        }

        // Build search query - add "violin" or "track" to get better results
        const enhancedQuery = `${query} violin accompaniment track`;

        // YouTube Data API v3 endpoint
        const youtubeApiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        youtubeApiUrl.searchParams.set('part', 'snippet');
        youtubeApiUrl.searchParams.set('q', enhancedQuery);
        youtubeApiUrl.searchParams.set('type', 'video');
        youtubeApiUrl.searchParams.set('maxResults', maxResults.toString());
        youtubeApiUrl.searchParams.set('key', apiKey);
        youtubeApiUrl.searchParams.set('videoCategoryId', '10'); // Music category

        if (pageToken) {
            youtubeApiUrl.searchParams.set('pageToken', pageToken);
        }

        const response = await fetch(youtubeApiUrl.toString());

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('YouTube API error:', errorData);
            throw new Error(`YouTube API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Get video durations (requires additional API call)
        const videoIds = data.items?.map((item: any) => item.id.videoId).filter(Boolean) || [];

        let durations: Record<string, string> = {};
        if (videoIds.length > 0) {
            const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
            videosUrl.searchParams.set('part', 'contentDetails');
            videosUrl.searchParams.set('id', videoIds.join(','));
            videosUrl.searchParams.set('key', apiKey);

            const videosResponse = await fetch(videosUrl.toString());
            if (videosResponse.ok) {
                const videosData = await videosResponse.json();
                durations = videosData.items?.reduce((acc: any, item: any) => {
                    acc[item.id] = item.contentDetails.duration;
                    return acc;
                }, {}) || {};
            }
        }

        // Parse results
        const videos: YouTubeVideo[] = (data.items || [])
            .filter((item: any) => item.id.videoId) // Filter out non-video results
            .map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
                duration: durations[item.id.videoId] || 'Unknown',
                publishedAt: item.snippet.publishedAt,
                description: item.snippet.description,
            }));

        const result: YouTubeSearchResult = {
            videos,
            totalResults: data.pageInfo?.totalResults || videos.length,
            nextPageToken: data.nextPageToken,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('YouTube search error:', error);
        return NextResponse.json(
            { error: 'Failed to search YouTube' },
            { status: 500 }
        );
    }
}
