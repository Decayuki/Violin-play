"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, Upload } from 'lucide-react';
import Link from 'next/link';

export default function NewSongPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        composer: '',
        baseDifficulty: 1,
        tags: '',
    });
    const [files, setFiles] = useState<{ pdf: File | null; backtrack: File | null; cover: File | null }>({
        pdf: null,
        backtrack: null,
        cover: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Song record
            const res = await fetch('/api/songs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    composer: formData.composer,
                    baseDifficulty: formData.baseDifficulty,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                }),
            });

            if (!res.ok) throw new Error('Failed to create song');
            const song = await res.json();

            // 2. Upload files if present
            const uploadFile = async (file: File, type: string) => {
                const data = new FormData();
                data.append('file', file);
                data.append('type', type);
                data.append('songId', song.id);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: data,
                });

                if (!uploadRes.ok) throw new Error(`Failed to upload ${type}`);
                return await uploadRes.json();
            };

            const updates: any = {};
            if (files.pdf) {
                const { path } = await uploadFile(files.pdf, 'pdf');
                updates.pdf_url = path; // Actually we need full URL or handle path in frontend. 
                // The upload API returns `url` (publicUrl) and `path`.
                // Let's use publicUrl if possible, or path if using storage helper.
                // Schema has `pdf_url` as TEXT.
                // Let's assume we store the public URL returned by API.
                const { url } = await uploadFile(files.pdf, 'pdf');
                updates.pdf_url = url;
            }
            if (files.backtrack) {
                const { url } = await uploadFile(files.backtrack, 'audio');
                updates.backtrack_url = url;
            }
            if (files.cover) {
                const { url } = await uploadFile(files.cover, 'audio');
                updates.cover_url = url;
            }

            // 3. Update song with file URLs if needed
            if (Object.keys(updates).length > 0) {
                await fetch(`/api/songs/${song.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                });
            }

            router.push('/admin/songs');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error creating song');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/songs">
                    <Button variant="ghost" size="sm">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Add New Song</h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Title"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <Input
                            label="Composer"
                            value={formData.composer}
                            onChange={e => setFormData({ ...formData, composer: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text-secondary">Difficulty (1-4)</label>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map(lvl => (
                                <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        value={lvl}
                                        checked={formData.baseDifficulty === lvl}
                                        onChange={() => setFormData({ ...formData, baseDifficulty: lvl })}
                                        className="text-accent-500 focus:ring-accent-500"
                                    />
                                    <span>Level {lvl}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Input
                        label="Tags (comma separated)"
                        value={formData.tags}
                        onChange={e => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="anime, rock, classic..."
                    />

                    <div className="space-y-4 border-t border-border-subtle pt-4">
                        <h3 className="font-medium">Files</h3>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">PDF Sheet</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFiles({ ...files, pdf: e.target.files?.[0] || null })}
                                    className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent-500/10 file:text-accent-500 hover:file:bg-accent-500/20"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Backtrack Audio</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={e => setFiles({ ...files, backtrack: e.target.files?.[0] || null })}
                                    className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent-500/10 file:text-accent-500 hover:file:bg-accent-500/20"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Cover Audio</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={e => setFiles({ ...files, cover: e.target.files?.[0] || null })}
                                    className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent-500/10 file:text-accent-500 hover:file:bg-accent-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" isLoading={loading}>
                            Create Song
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
