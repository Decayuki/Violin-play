"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            setSuccess(true);

            // Auto-login after signup
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            setTimeout(() => {
                router.push('/');
                router.refresh();
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold">Create Account</h1>
                        <p className="text-text-secondary">Sign up for Violin Practice App</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                            disabled={loading || success}
                        />
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                disabled={loading || success}
                            />
                            <p className="text-xs text-text-muted mt-1">Must be at least 6 characters</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-sm text-green-500">
                                Account created! Redirecting...
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={loading} disabled={success}>
                            {success ? 'Account Created!' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-text-secondary">
                        Already have an account?{' '}
                        <Link href="/login" className="text-text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
