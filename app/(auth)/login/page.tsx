"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push('/');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold">Welcome Back</h1>
                        <p className="text-text-secondary">Sign in to Violin Practice App</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                />
                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                />

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" isLoading={loading}>
                    Sign In
                </Button>
            </form>

            <div className="text-center text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link href="/signup" className="text-text-primary hover:underline font-medium">
                    Sign up
                </Link>
            </div>
                </Card>
            </div>
        </div>
    );
}
