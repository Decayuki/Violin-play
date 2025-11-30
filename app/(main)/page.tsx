import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import VerticalFlow from '@/components/layout/VerticalFlow';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: songs, error } = await supabase
        .from('songs')
        .select('id, title, composer, base_difficulty, tags, cover_url, pdf_url, backtrack_url')
        .order('title', { ascending: true });

    if (error) {
        console.error('Error fetching songs:', error);
        return (
            <div className="flex items-center justify-center min-h-screen text-text-muted font-mono bg-bg-primary">
                Error loading library.
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-bg-primary text-text-primary">
            <VerticalFlow songs={songs || []} />
        </main>
    );
}
