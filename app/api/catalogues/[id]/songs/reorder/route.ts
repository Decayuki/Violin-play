import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id: catalogueId } = await params;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const { data: catalogue } = await supabase
            .from('catalogues')
            .select('owner_id')
            .eq('id', catalogueId)
            .single();

        if (!catalogue || catalogue.owner_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { songIds } = body as { songIds: string[] };

        // Update order for each song
        // This could be optimized with a single query or RPC, but loop is simple for now
        const updates = songIds.map((songId, index) =>
            supabase
                .from('catalogue_songs')
                .update({ order: index })
                .eq('catalogue_id', catalogueId)
                .eq('song_id', songId)
        );

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reorder songs' }, { status: 500 });
    }
}
