import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; songId: string }> }
) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id: catalogueId, songId } = await params;

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

        const { error } = await supabase
            .from('catalogue_songs')
            .delete()
            .eq('catalogue_id', catalogueId)
            .eq('song_id', songId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove song from catalogue' }, { status: 500 });
    }
}
