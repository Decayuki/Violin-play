import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('user_difficulties')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ userDifficulties: data });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user difficulties' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { songId, difficulty } = body;

        if (difficulty === null) {
            // Remove override
            const { error } = await supabase
                .from('user_difficulties')
                .delete()
                .eq('user_id', user.id)
                .eq('song_id', songId);

            if (error) throw error;
        } else {
            // Upsert override
            const { data, error } = await supabase
                .from('user_difficulties')
                .upsert({
                    user_id: user.id,
                    song_id: songId,
                    user_difficulty: difficulty
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json(data);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update difficulty' }, { status: 500 });
    }
}


