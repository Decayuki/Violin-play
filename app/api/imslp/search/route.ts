import { NextRequest, NextResponse } from 'next/server';
import type { IMSLPSearchResult, IMSLPWork } from '@/types/imslp';

/**
 * IMSLP Search API Route
 * Searches IMSLP for sheet music by title/composer
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter "q" is required' },
                { status: 400 }
            );
        }

        // IMSLP MediaWiki API endpoint
        const imslpApiUrl = new URL('https://imslp.org/api.php');
        imslpApiUrl.searchParams.set('action', 'query');
        imslpApiUrl.searchParams.set('list', 'search');
        imslpApiUrl.searchParams.set('srsearch', query);
        imslpApiUrl.searchParams.set('srlimit', limit.toString());
        imslpApiUrl.searchParams.set('srnamespace', '0'); // Main namespace
        imslpApiUrl.searchParams.set('format', 'json');
        imslpApiUrl.searchParams.set('origin', '*'); // CORS

        const response = await fetch(imslpApiUrl.toString(), {
            headers: {
                'User-Agent': 'ViolinPracticeApp/1.0',
            },
        });

        if (!response.ok) {
            throw new Error(`IMSLP API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Parse results
        const works: IMSLPWork[] = (data.query?.search || []).map((result: any) => {
            const title = result.title;
            const pageId = result.pageid;

            // Extract composer from title (IMSLP format: "Work Title (Composer, First)")
            const composerMatch = title.match(/\(([^,]+),\s*[^)]+\)/);
            const composer = composerMatch ? composerMatch[1] : 'Unknown Composer';

            // Clean work title (remove composer part)
            const cleanTitle = title.replace(/\s*\([^)]+\)\s*$/, '');

            return {
                id: pageId.toString(),
                title: cleanTitle,
                composer,
                url: `https://imslp.org/wiki/${encodeURIComponent(title)}`,
                description: result.snippet?.replace(/<[^>]*>/g, ''), // Remove HTML tags
            };
        });

        const result: IMSLPSearchResult = {
            works,
            totalResults: data.query?.searchinfo?.totalhits || works.length,
            hasMore: works.length >= limit,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('IMSLP search error:', error);
        return NextResponse.json(
            { error: 'Failed to search IMSLP' },
            { status: 500 }
        );
    }
}
