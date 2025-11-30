"use client";

import { useCatalogues } from '@/lib/hooks/useCatalogues';
import { CatalogueList } from '@/components/catalogues/CatalogueList';
import { CreateCatalogueModal } from '@/components/catalogues/CreateCatalogueModal';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function CataloguesPage() {
    const { catalogues, loading, createCatalogue } = useCatalogues();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Catalogues</h1>

            <CatalogueList
                catalogues={catalogues}
                onCreateClick={() => setIsModalOpen(true)}
            />

            <CreateCatalogueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={async (data) => {
                    await createCatalogue(data.title, data.description, data.color);
                }}
            />
        </div>
    );
}
