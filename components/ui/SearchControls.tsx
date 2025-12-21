import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchControlsProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilter: 'all' | 'title' | 'author';
    onFilterChange: (filter: 'all' | 'title' | 'author') => void;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
    searchQuery,
    onSearchChange,
    activeFilter,
    onFilterChange,
}) => {
    return (
        <div className="w-full max-w-md mx-auto mb-8 space-y-4">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-white/40 group-focus-within:text-gold-400 transition-colors" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search for a song..."
                    className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-black/40 text-white placeholder-white/40 focus:outline-none focus:bg-black/60 focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 sm:text-sm transition-all duration-300 backdrop-blur-sm"
                />
            </div>

            {/* Filter Chips */}
            <div className="flex justify-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Filter className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/40 uppercase tracking-wider">Filter by</span>
                </div>

                {(['all', 'title', 'author'] as const).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
                        className={`
              px-4 py-1 rounded-full text-xs font-medium transition-all duration-300 border
              ${activeFilter === filter
                                ? 'bg-gold-500/20 border-gold-500/50 text-gold-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                            }
            `}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
};
