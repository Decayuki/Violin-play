import React from 'react';
import { PlayCircle, Clock, ChevronRight } from 'lucide-react';

const lessons = [
    { id: 1, title: 'Mastering Vibrato', level: 'Intermediate', duration: '15 min', image: '/placeholder-vibrato.jpg' },
    { id: 2, title: 'Bow Control Basics', level: 'Beginner', duration: '10 min', image: '/placeholder-bow.jpg' },
    { id: 3, title: 'Shifting Positions', level: 'Advanced', duration: '20 min', image: '/placeholder-shift.jpg' },
];

export default function LessonSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lessons.map((lesson) => (
                <div
                    key={lesson.id}
                    className="group cursor-pointer bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden hover:border-gold-primary/50 transition-all duration-300 hover:-translate-y-1"
                >
                    {/* Thumbnail Placeholder */}
                    <div className="h-48 bg-bg-tertiary relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary to-transparent opacity-80" />
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <span className="px-2 py-1 bg-bordeaux-primary/20 text-bordeaux-light text-xs font-mono rounded border border-bordeaux-primary/30">
                                {lesson.level.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-mono text-text-secondary">
                                <Clock className="w-3 h-3" /> {lesson.duration}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-gold-primary transition-colors">
                            {lesson.title}
                        </h3>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-text-muted font-mono group-hover:text-text-secondary transition-colors">
                                Start Lesson
                            </span>
                            <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center text-text-muted group-hover:border-gold-primary group-hover:text-gold-primary transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
