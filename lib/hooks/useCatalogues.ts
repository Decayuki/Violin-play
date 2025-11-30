"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Catalogue } from '@/types';

export function useCatalogues() {
    const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchCatalogues();
    }, []);

    const fetchCatalogues = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/catalogues');
            if (!response.ok) throw new Error('Failed to fetch catalogues');
            const data = await response.json();
            setCatalogues(data.catalogues);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const createCatalogue = async (title: string, description?: string, color?: string) => {
        try {
            const response = await fetch('/api/catalogues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, color }),
            });
            if (!response.ok) throw new Error('Failed to create catalogue');
            const newCatalogue = await response.json();
            setCatalogues([newCatalogue, ...catalogues]);
            return newCatalogue;
        } catch (err) {
            throw err;
        }
    };

    return { catalogues, loading, error, refresh: fetchCatalogues, createCatalogue };
}
