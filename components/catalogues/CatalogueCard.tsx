import { Catalogue } from '@/types';
import { Card } from '@/components/ui/Card';
import { FolderOpen, Calendar } from 'lucide-react';
import Link from 'next/link';

interface CatalogueCardProps {
    catalogue: Catalogue;
}

export const CatalogueCard = ({ catalogue }: CatalogueCardProps) => {
    return (
        <Link href={`/catalogues/${catalogue.id}`}>
            <div className="group h-full flex flex-col bg-bg-secondary border border-border-subtle hover:border-text-primary transition-colors duration-300 p-6 relative overflow-hidden">
                {/* Technical Corner Markers */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-6">
                    <div className="font-mono text-xs text-text-muted uppercase tracking-widest">
                        CAT_ID_{catalogue.id.slice(0, 4)}
                    </div>
                    <FolderOpen className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                </div>

                <h3 className="font-sans font-bold text-xl mb-2 text-text-primary uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                    {catalogue.title}
                </h3>

                <p className="font-mono text-xs text-text-secondary line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {catalogue.description || 'NO_DATA_AVAILABLE'}
                </p>

                <div className="flex items-center justify-between border-t border-border-subtle pt-4 mt-auto">
                    <div className="flex items-center text-[10px] font-mono text-text-muted uppercase">
                        <Calendar className="w-3 h-3 mr-2" />
                        {new Date(catalogue.created_at).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-border-strong group-hover:bg-white transition-colors" />
                </div>
            </div>
        </Link>
    );
};
