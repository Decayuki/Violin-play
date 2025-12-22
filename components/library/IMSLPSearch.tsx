"use client";

import { useState } from 'react';
import { Search, Music, Loader2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { IMSLPWork, IMSLPSearchResult } from '@/types/imslp';

interface IMSLPSearchProps {
    onSelectWork: (work: IMSLPWork) => void;
}

export default function IMSLPSearch({ onSelectWork }: IMSLPSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<IMSLPWork[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const response = await fetch(
                `/api/imslp/search?q=${encodeURIComponent(query)}&limit=20`
            );

            if (!response.ok) {
                throw new Error('Failed to search IMSLP');
            }

            const data: IMSLPSearchResult = await response.json();
            setResults(data.works);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search IMSLP for sheet music..."
                    disabled={isLoading}
                    className="flex-1"
                />
                <Button type="submit" isLoading={isLoading} disabled={isLoading || !query.trim()}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                </Button>
            </form>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-text-secondary" />
                </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && (
                <div className="text-center py-12 text-text-secondary">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No results found for "{query}"</p>
                    <p className="text-sm mt-2">Try a different search term</p>
                </div>
            )}

            {!isLoading && results.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm text-text-secondary">
                        Found {results.length} result{results.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid gap-3">
                        {results.map((work) => (
                            <Card
                                key={work.id}
                                className="p-4 hover:bg-bg-secondary/50 transition-colors cursor-pointer"
                                onClick={() => onSelectWork(work)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-text-primary truncate">
                                            {work.title}
                                        </h3>
                                        <p className="text-sm text-text-secondary mt-1">
                                            {work.composer}
                                        </p>
                                        {work.description && (
                                            <p className="text-xs text-text-muted mt-2 line-clamp-2">
                                                {work.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={work.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-text-secondary hover:text-text-primary transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <Music className="w-5 h-5 text-text-muted" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
