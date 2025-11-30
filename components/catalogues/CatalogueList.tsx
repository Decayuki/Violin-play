import { Catalogue } from '@/types';
import { CatalogueCard } from './CatalogueCard';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface CatalogueListProps {
    catalogues: Catalogue[];
    onCreateClick: () => void;
}

export const CatalogueList = ({ catalogues, onCreateClick }: CatalogueListProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card
                hover
                onClick={onCreateClick}
                className="flex flex-col items-center justify-center min-h-[200px] border-dashed border-2 border-border-default bg-transparent hover:bg-bg-secondary/50"
            >
                <div className="w-12 h-12 rounded-full bg-accent-500/10 flex items-center justify-center mb-3 text-accent-500">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium text-accent-500">Create New Catalogue</span>
            </Card>

            {catalogues.map(catalogue => (
                <CatalogueCard key={catalogue.id} catalogue={catalogue} />
            ))}
        </div>
    );
};
