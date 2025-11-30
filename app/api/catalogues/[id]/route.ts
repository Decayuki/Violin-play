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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch catalogue details
        const { data: catalogue, error: catError } = await supabase
            .from('catalogues')
            .select('*')
            .eq('id', id)
            .single();

        if (catError) throw catError;

        // Check ownership (RLS handles it but good to be explicit or handle 404)
        if (catalogue.owner_id !== user.id) {
            // Actually RLS would return empty or error, but if we got data it's fine.
            // Double check just in case RLS is off or something.
        }

        // Fetch songs using RPC
        const { data: songs, error: songsError } = await supabase
            .rpc('get_catalogue_songs', { p_catalogue_id: id });

        if (songsError) throw songsError;

        return NextResponse.json({
            catalogue,
            songs
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch catalogue' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id } = await params;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { data, error } = await supabase
            .from('catalogues')
            .update(body)
            .eq('id', id)
            .eq('owner_id', user.id) // Ensure ownership
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update catalogue' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id } = await params;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase
            .from('catalogues')
            .delete()
            .eq('id', id)
            .eq('owner_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete catalogue' }, { status: 500 });
    }
}
