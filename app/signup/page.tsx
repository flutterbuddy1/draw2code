'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, Zap } from 'lucide-react';

export default function SignupPage() {
    const [name, setName] = useState('');
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
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication layer failure');
            }

            router.push('/login?registered=true');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Identity creation failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -ml-64 -mt-64" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-64 -mb-64" />

            <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex flex-col items-center mb-12 text-center">
                    <Link href="/" className="mb-10 group transition-transform hover:scale-110 active:scale-95">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                            <div className="relative w-16 h-16 bg-foreground text-background rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl">
                                D2C
                            </div>
                        </div>
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground mb-3">
                        Join <span className="text-primary">Draw2Code</span>
                    </h1>
                    <p className="text-muted-foreground font-bold tracking-[0.2em] uppercase text-[10px]">
                        Start your journey into AI-assisted development
                    </p>
                </div>

                <div className="bg-card/50 backdrop-blur-3xl rounded-[40px] border border-border/50 p-10 shadow-2xl">
                    {error && (
                        <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-in shake duration-500">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 group-focus-within:text-primary transition-colors">Identity Name</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-14 pr-7 h-16 rounded-2xl border-2 border-border/50 bg-background/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 group-focus-within:text-primary transition-colors">Email Address</label>
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
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 group-focus-within:text-primary transition-colors">Security Key</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-7 h-16 rounded-2xl border-2 border-border/50 bg-background/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold"
                                    placeholder="Minimum 6 characters"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-18 bg-foreground text-background rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-foreground/90 hover:-translate-y-1 shadow-foreground/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Initialize Identity
                                    <Zap className="w-5 h-5 text-primary" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-border/50 text-center">
                        <p className="text-sm text-muted-foreground/60 font-medium">
                            Already have an identity? {' '}
                            <Link href="/login" className="text-foreground font-black hover:text-primary transition-colors">
                                Authenticate
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-12 text-center text-[10px] text-muted-foreground/40 font-black tracking-widest uppercase">
                    Beta Enrollment Protocol v2.4 - Restricted Access
                </p>
            </div>

            <style jsx>{`
                .h-18 { height: 4.5rem; }
            `}</style>
        </div>
    );
}
