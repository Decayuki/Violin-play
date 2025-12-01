'use client';

import React from 'react';
import { Film, Music, Mic2, Guitar, Star } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const styles = [
    { id: 'film', name: 'Film Scores', icon: <Film className="w-8 h-8" />, color: 'from-purple-900/80 to-blue-900/80', image: '/vignettes/movieCat.png' },
    { id: 'anime', name: 'Anime', icon: <Star className="w-8 h-8" />, color: 'from-pink-900/80 to-rose-900/80', image: '/vignettes/animecat.png' },
    { id: 'classical', name: 'Classical', icon: <Music className="w-8 h-8" />, color: 'from-amber-900/80 to-yellow-900/80', image: '/vignettes/classicalCat.png' },
    { id: 'rock', name: 'Rock', icon: <Guitar className="w-8 h-8" />, color: 'from-red-900/80 to-orange-900/80', image: '/vignettes/rockCat.png' },
    { id: 'pop', name: 'Pop', icon: <Mic2 className="w-8 h-8" />, color: 'from-cyan-900/80 to-blue-900/80', image: '/vignettes/popCat.png' },
];

export default function StyleSection() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStyle = searchParams.get('style');

    const handleStyleClick = (styleId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (currentStyle === styleId) {
            params.delete('style');
        } else {
            params.set('style', styleId);
        }
        router.push(`/?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full overflow-x-auto pb-8 scrollbar-hide">
            <div className="flex gap-6 min-w-max px-4">
                {styles.map((style) => {
                    const isActive = currentStyle === style.id;
                    return (
                        <button
                            key={style.id}
                            onClick={() => handleStyleClick(style.id)}
                            className={`
                                group relative w-64 h-80 rounded-xl overflow-hidden border transition-all duration-500
                                ${isActive
                                    ? 'border-gold-primary shadow-[0_0_30px_rgba(212,175,55,0.3)] scale-105'
                                    : 'border-border-subtle hover:border-gold-primary hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]'
                                }
                            `}
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url('${style.image}')` }}
                            />

                            {/* Background Gradient - Adjusted opacity for visibility */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-60 group-hover:opacity-40 transition-opacity duration-500`} />

                            {/* Active Indicator Overlay */}
                            {isActive && <div className="absolute inset-0 bg-gold-primary/10" />}

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 z-10">
                                <div className={`
                                    w-20 h-20 rounded-full border flex items-center justify-center transition-all duration-500
                                    ${isActive
                                        ? 'border-gold-primary bg-gold-primary/20 text-gold-primary scale-110'
                                        : 'border-gold-subtle bg-bg-secondary/50 backdrop-blur-sm text-gold-primary group-hover:scale-110'
                                    }
                                `}>
                                    {style.icon}
                                </div>
                                <h3 className={`
                                    text-2xl font-bold tracking-widest transition-colors duration-300
                                    ${isActive ? 'text-gold-primary' : 'text-text-primary group-hover:text-gold-light'}
                                `}>
                                    {style.name.toUpperCase()}
                                </h3>
                            </div>

                            {/* Decorative Lines */}
                            <div className={`
                                absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-primary to-transparent transition-opacity duration-500
                                ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            `} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
