"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, FolderOpen } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { useCatalogues } from '@/lib/hooks/useCatalogues';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

export const CatalogueDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { catalogues, loading } = useCatalogues();
    const { selectedCatalogueId, setSelectedCatalogue } = useAppStore();

    const selectedCatalogue = catalogues.find(c => c.id === selectedCatalogueId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: string | null) => {
        setSelectedCatalogue(id);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-bg-tertiary transition-colors text-sm font-medium text-text-primary"
            >
                <FolderOpen className="w-4 h-4 text-accent-400" />
                <span>{selectedCatalogue ? selectedCatalogue.title : 'All Catalogues'}</span>
                <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-bg-elevated border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-2">
                        <button
                            onClick={() => handleSelect(null)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                                selectedCatalogueId === null ? "bg-accent-500/10 text-accent-400" : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
                            )}
                        >
                            All Catalogues
                        </button>

                        <div className="my-1 border-t border-border-subtle" />

                        {loading ? (
                            <div className="px-3 py-2 text-xs text-text-muted">Loading...</div>
                        ) : (
                            <div className="max-h-60 overflow-y-auto space-y-0.5">
                                {catalogues.map(catalogue => (
                                    <button
                                        key={catalogue.id}
                                        onClick={() => handleSelect(catalogue.id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                                            selectedCatalogueId === catalogue.id
                                                ? "bg-accent-500/10 text-accent-400"
                                                : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
                                        )}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: catalogue.color || '#6366f1' }}
                                        />
                                        <span className="truncate">{catalogue.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="my-1 border-t border-border-subtle" />

                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => {
                                // TODO: Open Create Modal
                                console.log("Open Create Modal");
                                setIsOpen(false);
                            }}
                        >
                            <Plus className="w-3 h-3 mr-2" />
                            New Catalogue
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
