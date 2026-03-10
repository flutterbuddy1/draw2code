'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function NewProjectPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, call server action or API
        // For now, let's assume we have an API route or server action
        // We'll implement a simple API route for this

        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });

        if (res.ok) {
            const project = await res.json();
            router.push(`/project/${project.id}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
                <h1 className="text-2xl font-bold mb-6">New Project</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent h-24 resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => router.back()} className="flex-1 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
