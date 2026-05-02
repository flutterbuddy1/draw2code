'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FolderPlus, Loader2 } from 'lucide-react';

export default function NewProjectPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });

            if (res.ok) {
                const project = await res.json();
                router.push(`/project/${project.id}`);
            }
        } catch (error) {
            console.error('Failed to create project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mb-48" />

            <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Workspace
                </button>

                <div className="bg-card/50 backdrop-blur-3xl rounded-[40px] border border-border/50 p-10 shadow-2xl">
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                            <FolderPlus className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter">New Project</h1>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Initialize a new canvas</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 group-focus-within:text-primary transition-colors">Manifest Title</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-7 h-16 rounded-2xl border-2 border-border/50 bg-background/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold"
                                placeholder="E.g., Neumorphic SaaS Dashboard"
                                required
                            />
                        </div>

                        <div className="space-y-3 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 group-focus-within:text-primary transition-colors">Project Briefing</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-7 py-5 rounded-2xl border-2 border-border/50 bg-background/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold h-32 resize-none"
                                placeholder="What are we building today?"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading || !name}
                                className="flex-1 h-16 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Initialize Workspace
                                        <ChevronLeft className="w-4 h-4 rotate-180" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
