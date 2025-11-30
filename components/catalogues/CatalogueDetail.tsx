"use client";

import { CatalogueWithSongs } from '@/types';
import { SongCard } from '@/components/session/SongCard';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CatalogueDetailProps {
    catalogue: CatalogueWithSongs;
}

export const CatalogueDetail = ({ catalogue }: CatalogueDetailProps) => {
    const router = useRouter();

    const handleDeleteSong = async (songId: string) => {
        if (!confirm('Remove this song from catalogue?')) return;

        try {
            const response = await fetch(`/api/catalogues/${catalogue.id}/songs/${songId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to remove song', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{catalogue.title}</h1>
                    <p className="text-text-secondary">{catalogue.description}</p>
                </div>
                <Button onClick={() => { /* TODO: Open Add Song Modal */ }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Songs
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {catalogue.songs.map((song) => (
                    <div key={song.id} className="relative group">
                        <SongCard
                            song={song}
                            isSelected={false}
                            onClick={() => router.push(`/practice/${song.id}`)}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSong(song.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {catalogue.songs.length === 0 && (
                    <div className="col-span-full py-12 text-center text-text-muted border-2 border-dashed border-border-subtle rounded-lg">
                        No songs in this catalogue yet.
                    </div>
                )}
            </div>
        </div>
    );
};
