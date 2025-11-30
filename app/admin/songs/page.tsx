import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export default async function AdminSongsPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: songs } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Songs</h1>
                <Link href="/admin/songs/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Song
                    </Button>
                </Link>
            </div>

            <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-bg-elevated border-b border-border-subtle">
                        <tr>
                            <th className="px-6 py-3 font-medium text-text-secondary">Title</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Composer</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Difficulty</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Tags</th>
                            <th className="px-6 py-3 font-medium text-text-secondary text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                        {songs?.map((song) => (
                            <tr key={song.id} className="hover:bg-bg-tertiary/50">
                                <td className="px-6 py-4 font-medium">{song.title}</td>
                                <td className="px-6 py-4 text-text-secondary">{song.composer}</td>
                                <td className="px-6 py-4">
                                    <Badge color={
                                        song.base_difficulty === 1 ? 'green' :
                                            song.base_difficulty === 2 ? 'blue' :
                                                song.base_difficulty === 3 ? 'orange' : 'red'
                                    }>
                                        Lvl {song.base_difficulty}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {song.tags?.slice(0, 2).map((tag: string) => (
                                            <Badge key={tag} variant="subtle" size="sm">{tag}</Badge>
                                        ))}
                                        {song.tags?.length > 2 && <span className="text-xs text-text-muted">+{song.tags.length - 2}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
