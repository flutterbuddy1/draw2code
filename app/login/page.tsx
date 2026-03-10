'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, Fingerprint } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('Authentication failed. Check your credentials.');
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'System error. Please retry shortly.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mb-48" />

            <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex flex-col items-center mb-12">
                    <Link href="/" className="mb-10 group transition-transform hover:scale-110 active:scale-95">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                            <div className="relative w-16 h-16 bg-foreground text-background rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl">
                                D2C
                            </div>
                        </div>
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground mb-3 text-center">
                        Welcome to <span className="text-primary">Draw2Code</span>
                    </h1>
                    <p className="text-muted-foreground font-bold tracking-[0.2em] uppercase text-[10px] text-center">
                        The intersection of design and code
                    </p>
                </div>

                <div className="bg-card/50 backdrop-blur-3xl rounded-[40px] border border-border/50 p-10 shadow-2xl">
                    {error && (
                        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-in shake duration-500">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 group-focus-within:text-primary transition-colors">Workspace Access</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-7 h-16 rounded-2xl border-2 border-border/50 bg-background/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3 group">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-focus-within:text-primary transition-colors">Security Key</label>
                                <button type="button" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline">Reset</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-7 h-16 rounded-2xl border-2 border-border/50 bg-background/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-18 bg-foreground text-background rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-foreground/90 hover:-translate-y-1 shadow-foreground/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Log into Lab
                                    <Fingerprint className="w-5 h-5 opacity-40" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t border-border/50 text-center">
                        <p className="text-sm text-muted-foreground/60 font-medium">
                            Don&apos;t have access? {' '}
                            <Link href="/signup" className="text-foreground font-black hover:text-primary transition-colors">
                                Create Identity
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-12 text-center text-[10px] text-muted-foreground/40 font-black tracking-widest uppercase">
                    Secure Biometric-Grade Access Controller v1.0
                </p>
            </div>

            <style jsx>{`
                .h-18 { height: 4.5rem; }
            `}</style>
        </div>
    );
}
