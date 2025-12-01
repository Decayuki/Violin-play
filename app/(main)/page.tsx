import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import VerticalFlow from '@/components/layout/VerticalFlow';
import StyleSection from '@/components/home/StyleSection';
import LessonSection from '@/components/home/LessonSection';

export const dynamic = 'force-dynamic';

export default async function HomePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Await searchParams before accessing properties
    const resolvedSearchParams = await searchParams;
    const style = typeof resolvedSearchParams.style === 'string' ? resolvedSearchParams.style : undefined;

    let query = supabase
        .from('songs')
        .select('id, title, composer, base_difficulty, tags, cover_url, pdf_url, backtrack_url')
        .order('title', { ascending: true });

    if (style) {
        // Assuming tags is an array or string. If array, use .contains. If string, use .ilike
        // Based on previous context, tags might be an array. Let's try .contains for array or .ilike for text.
        // If tags is text[]: .contains('tags', [style])
        // If tags is text: .ilike('tags', `%${style}%`)
        // Let's assume text[] for now as it's common for tags.
        query = query.contains('tags', [style]);
    }

    const { data: songs, error } = await query;

    if (error) {
        console.error('Error fetching songs:', error);
        return [];
    }

    return (
        <main className="min-h-screen bg-bg-primary text-text-primary overflow-y-auto">
            {/* HERO SECTION (Sticky Player) */}
            <section className="h-screen sticky top-0 z-10 shadow-2xl">
                <VerticalFlow songs={songs || []} />
            </section>

            {/* CONTENT SECTION (Scrollable) */}
            <section className="relative z-20 border-t border-gold-subtle/20 min-h-screen pointer-events-none">

                {/* HERO BANNER with BG1 */}
                <div className="relative w-full flex flex-col justify-center overflow-hidden pointer-events-auto pt-40 pb-20">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40"
                        style={{ backgroundImage: "url('/bg1.jpg')" }}
                    />
                    {/* Gradient Overlay - Transparent at top to reveal slider */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/90 to-bg-primary" />

                    <div className="container mx-auto px-4 relative z-10">
                        <h2 className="text-5xl md:text-7xl font-bold text-text-primary mb-12 text-center tracking-widest drop-shadow-lg uppercase">
                            EXPLORE LIBRARY
                        </h2>

                        {/* Style Slider */}
                        <div className="mb-12">
                            <h3 className="text-xl font-mono text-gold-light mb-8 border-l-4 border-gold-primary pl-4 tracking-widest">
                                BROWSE BY STYLE
                            </h3>
                            <StyleSection />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-20">
                    {/* Lessons */}
                    <div>
                        <h3 className="text-xl font-mono text-text-secondary mb-6 border-l-2 border-gold-primary pl-4">
                            TECHNIQUE & LESSONS
                        </h3>
                        <LessonSection />
                    </div>
                </div>
            </section>
        </main>
    );
}
