import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
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
        const { songId, order } = body;

        // Determine order if not provided
        let newOrder = order;
        if (newOrder === undefined) {
            const { data: maxOrderData } = await supabase
                .from('catalogue_songs')
                .select('order')
                .eq('catalogue_id', catalogueId)
                .order('order', { ascending: false })
                .limit(1)
                .single();

            newOrder = (maxOrderData?.order ?? -1) + 1;
        }

        const { data, error } = await supabase
            .from('catalogue_songs')
            .insert({
                catalogue_id: catalogueId,
                song_id: songId,
                order: newOrder
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add song to catalogue' }, { status: 500 });
    }
}
