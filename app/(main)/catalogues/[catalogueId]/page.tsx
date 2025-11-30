import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CatalogueDetail } from '@/components/catalogues/CatalogueDetail';

interface PageProps {
    params: Promise<{ catalogueId: string }>;
}

export default async function CatalogueDetailPage({ params }: PageProps) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { catalogueId } = await params;

    // Fetch catalogue details
    const { data: catalogue, error: catError } = await supabase
        .from('catalogues')
        .select('*')
        .eq('id', catalogueId)
        .single();

    if (catError || !catalogue) {
        redirect('/catalogues');
    }

    // Fetch songs using RPC
    const { data: songs, error: songsError } = await supabase
        .rpc('get_catalogue_songs', { p_catalogue_id: catalogueId });

    if (songsError) {
        console.error('Error fetching songs:', songsError);
    }

    const catalogueWithSongs = {
        ...catalogue,
        songs: songs || []
    };

    return <CatalogueDetail catalogue={catalogueWithSongs} />;
}
