import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id } = await params;

    try {
        // Fetch song and user difficulty
        // We can use the view `songs_with_effective_difficulty` if we want, 
        // but RLS on view might be tricky if not set up correctly (it usually inherits).
        // Or we can just do two queries or a join.
        // Let's try to fetch song first.

        const { data: song, error } = await supabase
            .from('songs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Fetch user difficulty
        const { data: { user } } = await supabase.auth.getUser();
        let userDifficulty = null;

        if (user) {
            const { data: ud } = await supabase
                .from('user_difficulties')
                .select('user_difficulty')
                .eq('song_id', id)
                .eq('user_id', user.id)
                .single();

            if (ud) userDifficulty = ud.user_difficulty;
        }

        const effectiveDifficulty = userDifficulty ?? song.base_difficulty;

        return NextResponse.json({
            song,
            userDifficulty,
            effectiveDifficulty
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { data, error } = await supabase
            .from('songs')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { error } = await supabase
            .from('songs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
    }
}
