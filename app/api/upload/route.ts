import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.user_metadata.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'pdf' | 'audio'
        const songId = formData.get('songId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bucket = type === 'pdf' ? 'sheets' : 'audio';
        const folder = type === 'pdf' ? 'partitions' : (type === 'audio' ? 'backtracks' : 'misc'); // Simplified logic

        // Generate path
        const path = `${folder}/${songId}-${file.name}`;

        const { data, error } = await supabase
            .storage
            .from(bucket)
            .upload(path, file, {
                upsert: true
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(path);

        return NextResponse.json({
            url: publicUrl,
            path: data.path
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
