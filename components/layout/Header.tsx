import Link from 'next/link';
import { Settings, User } from 'lucide-react';
import { CatalogueDropdown } from './CatalogueDropdown';

export const Header = () => {
    return (
        <header className="h-16 border-b border-border-subtle bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="container mx-auto h-full px-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                            ViolinApp
                        </span>
                    </Link>

                    <div className="hidden md:block w-px h-6 bg-border-subtle" />

                    <CatalogueDropdown />
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-full transition-colors">
                        <User className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-full transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};
