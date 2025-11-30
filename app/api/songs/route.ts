import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(request.url);

    const difficulty = searchParams.get('difficulty');
    const catalogueId = searchParams.get('catalogueId');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
        let query = supabase
            .from('songs')
            .select('*', { count: 'exact' });

        // Filter by difficulty
        if (difficulty) {
            query = query.eq('base_difficulty', parseInt(difficulty));
        }

        // Filter by catalogue (requires join, but Supabase simple client might need RPC or separate query)
        // For now, if catalogueId is present, we might want to use the RPC function get_catalogue_songs
        // But this endpoint is generic songs. 
        // If catalogueId is provided, we should probably use the catalogue_songs table.
        if (catalogueId) {
            // This is a bit complex with simple query builder on 'songs'.
            // Easier to fetch song_ids from catalogue_songs first or use a view/rpc.
            // The spec mentioned `get_catalogue_songs` RPC. Let's use that if catalogueId is present.
            // However, that RPC returns a specific structure.
            // Let's stick to standard query for now unless catalogueId is strictly required here.
            // Actually, let's ignore catalogueId here for the generic list, or handle it if critical.
            // The spec says "GET /api/songs ... catalogueId?: string".
            // If catalogueId is passed, we filter songs that are in that catalogue.
            const { data: catalogueSongs } = await supabase
                .from('catalogue_songs')
                .select('song_id')
                .eq('catalogue_id', catalogueId);

            if (catalogueSongs) {
                const songIds = catalogueSongs.map(cs => cs.song_id);
                query = query.in('id', songIds);
            }
        }

        // Search
        if (search) {
            query = query.ilike('title', `% ${search}% `);
        }

        // Tags
        if (tags && tags.length > 0) {
            query = query.contains('tags', tags);
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: songs, error, count } = await query;

        if (error) throw error;

        return NextResponse.json({
            songs,
            total: count,
            hasMore: (offset + limit) < (count || 0)
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Check admin role (simplified check)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, composer, baseDifficulty, tags, pdfUrl, backtrackUrl, coverUrl } = body;

        const { data, error } = await supabase
            .from('songs')
            .insert({
                title,
                composer,
                base_difficulty: baseDifficulty,
                tags,
                pdf_url: pdfUrl,
                backtrack_url: backtrackUrl,
                cover_url: coverUrl
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create song' }, { status: 500 });
    }
}
