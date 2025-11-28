'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Save, Layout, MessageSquare, Mic, Settings, X } from 'lucide-react';
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

    // State for settings modal
    const [showSettings, setShowSettings] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState('supabase');
    const [supabaseConfig, setSupabaseConfig] = useState({
        enabled: false,
        url: '',
        key: ''
    });
    const [customApiConfig, setCustomApiConfig] = useState<{ endpoints: { url: string; method: string; desc: string }[] }>({
        endpoints: []
    });

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.project.canvasData) {
                        setInitialCanvasData(JSON.parse(data.project.canvasData));
                    }
                    if (data.project.supabaseConfig) {
                        setSupabaseConfig(JSON.parse(data.project.supabaseConfig));
                    }
                    if (data.project.customApiConfig) {
                        setCustomApiConfig(JSON.parse(data.project.customApiConfig));
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
                    canvasData: JSON.stringify(canvasData),
                    supabaseConfig: JSON.stringify(supabaseConfig),
                    customApiConfig: JSON.stringify(customApiConfig)
                })
            });
        } catch (err) {
            console.error('Failed to save canvas:', err);
        }
    };
    const handleGenerate = async () => {
        setIsGenerating(true);

        // Get only selected shapes from tldraw (or all if none selected)
        let selectedShapes = null;
        try {
            selectedShapes = canvasRef.current?.getSelectedShapes() || null;
        } catch (e) {
            console.error("Error getting selected shapes:", e);
        }
        console.log('Selected shapes:', selectedShapes);

        try {
            console.log('Preparing payload...');

            // Sanitize shapes to ensure no circular references
            let sanitizedShapes = null;
            try {
                sanitizedShapes = selectedShapes ? JSON.parse(JSON.stringify(selectedShapes)) : null;
            } catch (shapeError) {
                console.error("Error sanitizing shapes:", shapeError);
                // If shapes can't be serialized, just send null
                sanitizedShapes = null;
            }

            // Sanitize configs
            let sanitizedSupabase = supabaseConfig;
            let sanitizedCustomApi = customApiConfig;

            try {
                sanitizedSupabase = JSON.parse(JSON.stringify(supabaseConfig));
            } catch (e) {
                console.error("Error sanitizing supabase config:", e);
            }

            try {
                sanitizedCustomApi = JSON.parse(JSON.stringify(customApiConfig));
            } catch (e) {
                console.error("Error sanitizing custom API config:", e);
            }

            const payload = {
                projectId,
                prompt,
                framework,
                language,
                canvasData: sanitizedShapes,
                supabaseConfig: sanitizedSupabase,
                customApiConfig: sanitizedCustomApi
            };
            console.log('Payload prepared:', payload);

            const body = JSON.stringify(payload);
            console.log('Body stringified successfully');

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body
            });

            console.log(res);

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
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 w-full max-w-md px-4">
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
                        <button className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors">
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="bg-white text-zinc-600 px-3 py-1.5 rounded-full text-xs font-medium shadow-md border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center gap-2"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Settings</span>
                        </button>
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

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold">Project Settings</h2>
                            <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                            <button
                                className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeSettingsTab === 'supabase' ? 'border-blue-500 text-blue-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                                onClick={() => setActiveSettingsTab('supabase')}
                            >
                                Supabase Integration
                            </button>
                            <button
                                className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeSettingsTab === 'api' ? 'border-blue-500 text-blue-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                                onClick={() => setActiveSettingsTab('api')}
                            >
                                Custom APIs
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {activeSettingsTab === 'supabase' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Enable Supabase</label>
                                        <input
                                            type="checkbox"
                                            checked={supabaseConfig.enabled}
                                            onChange={(e) => setSupabaseConfig({ ...supabaseConfig, enabled: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                    </div>

                                    {supabaseConfig.enabled && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Project URL</label>
                                                <input
                                                    type="text"
                                                    value={supabaseConfig.url}
                                                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                                                    className="w-full p-2 text-sm border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                                                    placeholder="https://xyz.supabase.co"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Anon Key</label>
                                                <input
                                                    type="password"
                                                    value={supabaseConfig.key}
                                                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, key: e.target.value })}
                                                    className="w-full p-2 text-sm border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                                                    placeholder="public-anon-key"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeSettingsTab === 'api' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">API Endpoints</h3>
                                        <button
                                            onClick={() => setCustomApiConfig({
                                                endpoints: [...customApiConfig.endpoints, { url: '', method: 'GET', desc: '' }]
                                            })}
                                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                                        >
                                            + Add Endpoint
                                        </button>
                                    </div>

                                    {customApiConfig.endpoints.map((endpoint: any, idx: number) => (
                                        <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg space-y-2 border border-zinc-200 dark:border-zinc-700">
                                            <div className="flex gap-2">
                                                <select
                                                    value={endpoint.method}
                                                    onChange={(e) => {
                                                        const newEndpoints = [...customApiConfig.endpoints];
                                                        newEndpoints[idx].method = e.target.value;
                                                        setCustomApiConfig({ endpoints: newEndpoints });
                                                    }}
                                                    className="text-xs p-1 rounded border"
                                                >
                                                    <option>GET</option>
                                                    <option>POST</option>
                                                    <option>PUT</option>
                                                    <option>DELETE</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={endpoint.url}
                                                    onChange={(e) => {
                                                        const newEndpoints = [...customApiConfig.endpoints];
                                                        newEndpoints[idx].url = e.target.value;
                                                        setCustomApiConfig({ endpoints: newEndpoints });
                                                    }}
                                                    className="flex-1 text-xs p-1 rounded border"
                                                    placeholder="https://api.example.com/v1/resource"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newEndpoints = customApiConfig.endpoints.filter((_: any, i: number) => i !== idx);
                                                        setCustomApiConfig({ endpoints: newEndpoints });
                                                    }}
                                                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={endpoint.desc}
                                                onChange={(e) => {
                                                    const newEndpoints = [...customApiConfig.endpoints];
                                                    newEndpoints[idx].desc = e.target.value;
                                                    setCustomApiConfig({ endpoints: newEndpoints });
                                                }}
                                                className="w-full text-xs p-1 rounded border"
                                                placeholder="Description (e.g., Fetches user profile)"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleSave(initialCanvasData); // Save everything
                                    setShowSettings(false);
                                }}
                                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

