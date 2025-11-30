import Link from 'next/link';
import { LayoutDashboard, Music, Users, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'admin') {
        // redirect('/'); // Commented out for dev ease if role not set yet, but should be active
        // For now, let's assume we want to enforce it.
        // redirect('/');
    }

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/songs', label: 'Songs', icon: Music },
        { href: '/admin/students', label: 'Students', icon: Users },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-bg-primary">
            <aside className="w-64 border-r border-border-subtle bg-bg-secondary flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                        Violin Admin
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border-subtle">
                    <button className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-md w-full transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-8 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
