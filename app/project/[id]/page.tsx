'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Save, Layout, MessageSquare, Mic } from 'lucide-react';
import { useParams } from 'next/navigation';
import type { CanvasBoardRef } from '@/components/editor/CanvasBoard';

// Dynamic import for CanvasBoard to avoid SSR issues with tldraw
const CanvasBoard = dynamic(() => import('@/components/editor/CanvasBoard'), { ssr: false });

export default function ProjectWorkspace() {
    const params = useParams();
    const projectId = params.id as string;
    const canvasRef = useRef<CanvasBoardRef>(null);

    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [language, setLanguage] = useState('english');
    const [framework, setFramework] = useState('react');

    const [initialCanvasData, setInitialCanvasData] = useState<any>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.project.canvasData) {
                        setInitialCanvasData(JSON.parse(data.project.canvasData));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch project:', err);
            }
        };
        fetchProject();
    }, [projectId]);

    const handleSave = async (canvasData: any) => {
        try {
            await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    canvasData: JSON.stringify(canvasData)
                })
            });
        } catch (err) {
            console.error('Failed to save canvas:', err);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);

        // Get only selected shapes from tldraw (or all if none selected)
        const selectedShapes = canvasRef.current?.getSelectedShapes() || null;
        console.log('Selected shapes:', selectedShapes);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    prompt,
                    framework,
                    language,
                    canvasData: selectedShapes
                })
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("API Error:", text);
                return;
            }

            const data = await res.json();
            if (data.success) {
                // Add the preview as a shape on the canvas with the code ID
                canvasRef.current?.addPreviewShape(data.code.code, data.code.id);
            }
        } catch (err) {
            console.error("Generation error:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
            {/* Left Sidebar - Tools */}
            <div className="w-16 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-4 gap-4 z-10">
                <button className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Layout className="w-6 h-6" />
                </button>
                <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                    <MessageSquare className="w-6 h-6" />
                </button>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative bg-zinc-100 dark:bg-zinc-900/50 overflow-hidden">
                <CanvasBoard
                    ref={canvasRef}
                    onSave={handleSave}
                    initialData={initialCanvasData}
                />

                {/* Top Floating Toolbar (Keep existing) */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 z-10">
                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded" title="Save">
                        <Save className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-600 mx-1" />
                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded" title="Undo">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
                    </button>
                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded" title="Redo">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
                    </button>
                </div>

                {/* Bottom Floating Prompt Bar */}
                <div className="absolute bottom-18 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 w-full max-w-md px-4">
                    {/* Settings Row */}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-md border border-zinc-200 text-xs">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-50 rounded border border-zinc-200">
                            <span className="text-zinc-500">Mode:</span>
                            <select
                                className="bg-transparent font-medium text-zinc-800 outline-none cursor-pointer"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="english">English</option>
                                <option value="spanish">Spanish</option>
                                <option value="hindi">Hindi</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-50 rounded border border-zinc-200">
                            <span className="text-zinc-500">Framework:</span>
                            <select
                                className="bg-transparent font-medium text-zinc-800 outline-none cursor-pointer"
                                value={framework}
                                onChange={(e) => setFramework(e.target.value)}
                            >
                                <option value="react">React</option>
                                <option value="html">HTML</option>
                                <option value="vue">Vue</option>
                            </select>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="w-full bg-white rounded-xl shadow-lg border border-zinc-200 p-1 flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none px-3 py-1.5 text-sm text-zinc-800 placeholder-zinc-400"
                            placeholder="Describe your app..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                        />
                        <button className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isGenerating ? (
                            <>Building...</>
                        ) : (
                            <>
                                <span>Build</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
