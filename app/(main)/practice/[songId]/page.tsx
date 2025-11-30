import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PracticeSession } from '@/components/practice/PracticeSession';

interface PageProps {
    params: Promise<{ songId: string }>;
}

export default async function PracticePage({ params }: PageProps) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { songId } = await params;

    // Fetch song details
    const { data: song, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .single();

    if (error || !song) {
        redirect('/');
    }

    // Fetch user difficulty
    const { data: { user } } = await supabase.auth.getUser();
    let userDifficulty = null;

    if (user) {
        const { data: ud } = await supabase
            .from('user_difficulties')
            .select('user_difficulty')
            .eq('song_id', songId)
            .eq('user_id', user.id)
            .single();

        if (ud) userDifficulty = ud.user_difficulty;
    }

    const songWithDifficulty = {
        ...song,
        user_difficulty: userDifficulty,
        effective_difficulty: userDifficulty ?? song.base_difficulty
    };

    return <PracticeSession song={songWithDifficulty} />;
}
