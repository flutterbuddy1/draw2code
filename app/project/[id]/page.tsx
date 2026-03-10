'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Save, Layout, MessageSquare, Mic, Settings, X, ChevronLeft, Undo2, Redo2, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { CanvasBoardRef } from '@/components/editor/CanvasBoard';
import type { SupabaseConfig, CustomApiConfig } from '@/lib/ai-generator';

// Dynamic import for CanvasBoard to avoid SSR issues with tldraw
const CanvasBoard = dynamic(() => import('@/components/editor/CanvasBoard'), { ssr: false });
const ChatSidebar = dynamic(() => import('@/components/editor/ChatSidebar'), { ssr: false });

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ProjectWorkspace() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const canvasRef = useRef<CanvasBoardRef>(null);

    const [projectName, setProjectName] = useState('Loading...');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [language, setLanguage] = useState('typescript');
    const [framework, setFramework] = useState('react');
    const [isLoading, setIsLoading] = useState(true);
    const [initialCanvasData, setInitialCanvasData] = useState<unknown>(null);

    // State for settings modal
    const [showSettings, setShowSettings] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState('supabase');
    const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
        enabled: false,
        url: '',
        key: ''
    });
    const [customApiConfig, setCustomApiConfig] = useState<CustomApiConfig>({
        endpoints: []
    });

    // Voice & Saving State
    const [isListening, setIsListening] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProjectName(data.project.name);
                    if (data.project.canvasData) {
                        setInitialCanvasData(JSON.parse(data.project.canvasData));
                    }
                    if (data.project.supabaseConfig) {
                        setSupabaseConfig(JSON.parse(data.project.supabaseConfig) as SupabaseConfig);
                    }
                    if (data.project.customApiConfig) {
                        setCustomApiConfig(JSON.parse(data.project.customApiConfig) as CustomApiConfig);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch project:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    const handleSave = async (autoData?: unknown) => {
        setIsSaving(true);
        const canvasData = autoData || canvasRef.current?.getCanvasData();
        if (!canvasData) {
            setIsSaving(false);
            return;
        }

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

            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => setIsSaving(false), 2000);
        } catch (err) {
            console.error('Failed to save content:', err);
            setIsSaving(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);

        let selectedShapes = null;
        try {
            selectedShapes = canvasRef.current?.getSelectedShapes() || null;
        } catch (e) {
            console.error("Error capturing canvas selection:", e);
        }

        try {
            const payload = {
                projectId,
                prompt,
                framework,
                language,
                canvasData: selectedShapes,
                supabaseConfig: supabaseConfig.enabled ? supabaseConfig : null,
                customApiConfig: customApiConfig.endpoints.length > 0 ? customApiConfig : null
            };

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Generation request failed");

            const data = await res.json();
            if (data.success) {
                canvasRef.current?.addPreviewShape(data.code.code, data.code.id);
                setPrompt(''); // Clear prompt on success
            }
        } catch (err) {
            console.error("Generation error:", err);
            alert("Failed to generate UI. Please check console or try a different prompt.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleChatMessage = async (message: string) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMsg]);

        setIsGenerating(true);
        try {
            const shapes = canvasRef.current?.getSelectedShapes();
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    prompt: message,
                    canvasData: shapes,
                    language,
                    framework,
                    supabaseConfig: supabaseConfig.enabled ? supabaseConfig : null,
                    customApiConfig: customApiConfig.endpoints.length > 0 ? customApiConfig : null
                })
            });

            if (!res.ok) throw new Error("Failed to generate code via chat");

            const data = await res.json();
            if (data.success) {
                canvasRef.current?.addPreviewShape(data.code.code, data.code.id);
                const assistantMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "Applied the requested changes! You can find the updated preview on your canvas.",
                    timestamp: new Date()
                };
                setChatMessages(prev => [...prev, assistantMsg]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble processing that right now. Could you try rephrasing?",
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
            {/* Left Sidebar - Navigation & Primary Tools */}
            <div className="w-16 bg-card border-r border-border flex flex-col items-center py-6 gap-6 z-50 shadow-xl">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-accent transition-all active:scale-90"
                    title="Back to Dashboard"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-px bg-border" />
                <button className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Layout className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={cn(
                        "p-2.5 rounded-xl transition-all relative group",
                        isChatOpen
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    title="AI Assistant"
                >
                    <MessageSquare className="w-6 h-6" />
                    {!isChatOpen && <div className="absolute right-0 top-0 w-2 h-2 bg-primary rounded-full border-2 border-card" />}
                    <div className="absolute left-14 px-2 py-1 bg-popover text-popover-foreground text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Chat Assistant
                    </div>
                </button>
                <div className="mt-auto flex flex-col items-center gap-4">
                    <button
                        onClick={() => setShowSettings(true)}
                        className={cn(
                            "p-2.5 rounded-xl transition-all",
                            showSettings ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                        title="Integrations & Settings"
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold">
                        {projectName.substring(0, 2).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] bg-[size:24px_24px]">
                {isLoading ? (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold italic-title">Initializing Workspace</h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Fetching Canvas States</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <CanvasBoard
                        ref={canvasRef}
                        onSave={handleSave}
                        initialData={initialCanvasData}
                    />
                )}

                <ChatSidebar
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    onSendMessage={handleChatMessage}
                    isGenerating={isGenerating}
                    messages={chatMessages}
                />

                {/* Top Center Toolbar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl border border-border/50 flex items-center gap-4 z-40 transition-all hover:border-primary/30">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-bold tracking-tight px-2">{projectName}</h2>
                        <div
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                isSaving ? "bg-amber-500/10 text-amber-600 animate-pulse" : "bg-emerald-500/10 text-emerald-600"
                            )}
                        >
                            <span className={cn("w-1.5 h-1.5 rounded-full", isSaving ? "bg-amber-500" : "bg-emerald-500")} />
                            {isSaving ? "Saving" : "Synced"}
                        </div>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="flex items-center gap-1">
                        <button
                            className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-all active:scale-90"
                            title="Undo"
                            onClick={() => (canvasRef.current as { getEditor: () => { undo: () => void } | null })?.getEditor()?.undo()}
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-all active:scale-90"
                            title="Redo"
                            onClick={() => (canvasRef.current as { getEditor: () => { redo: () => void } | null })?.getEditor()?.redo()}
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <button
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        className="flex items-center gap-2 pl-2 pr-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                    >
                        Force Save
                        <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Save className="w-4 h-4" />
                        </div>
                    </button>
                </div>

                {/* Bottom Center Engine Bar */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 z-40">
                    <div className="flex flex-col gap-4">
                        {/* Configuration Strip */}
                        <div className="flex items-center justify-between bg-card/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-border/50 shadow-xl overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Framework</span>
                                    <div className="flex items-center bg-muted rounded-xl p-1">
                                        {['react', 'nextjs'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setFramework(f)}
                                                className={cn(
                                                    "px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all capitalize",
                                                    framework === f ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-4 w-px bg-border" />
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Language</span>
                                    <div className="flex items-center bg-muted rounded-xl p-1">
                                        {['typescript', 'javascript'].map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => setLanguage(l)}
                                                className={cn(
                                                    "px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all capitalize",
                                                    language === l ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {l === 'typescript' ? 'TS' : 'JS'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                                <div className="h-4 w-px bg-border" />
                                <p className="text-[10px] font-bold text-muted-foreground bg-accent px-2 py-1 rounded">V4 ENGINE</p>
                            </div>
                        </div>

                        {/* Main AI Terminal */}
                        <div className="bg-card/95 backdrop-blur-2xl p-2 rounded-3xl shadow-2xl border border-border/40 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                            <div className="relative flex items-center">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your vision, and AI will weave the code..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium py-4 px-6 pr-36 min-h-[60px] max-h-[200px] resize-none text-foreground placeholder:text-muted-foreground/50 scrollbar-none"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleGenerate();
                                        }
                                    }}
                                />
                                <div className="absolute right-3 flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            if (isListening) {
                                                recognitionRef.current?.stop();
                                                setIsListening(false);
                                                return;
                                            }

                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                            // @ts-expect-error
                                            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                            if (!SpeechRecognition) {
                                                alert('Speech recognition not supported in this browser.');
                                                return;
                                            }

                                            setIsListening(true);
                                            const recognition = new SpeechRecognition();
                                            recognitionRef.current = recognition;
                                            recognition.lang = 'en-US';
                                            recognition.continuous = true;
                                            recognition.interimResults = true;

                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            recognition.onresult = (event: any) => {
                                                let finalTranscript = '';
                                                for (let i = event.resultIndex; i < event.results.length; ++i) {
                                                    if (event.results[i].isFinal) {
                                                        finalTranscript += event.results[i][0].transcript;
                                                    }
                                                }
                                                if (finalTranscript) {
                                                    setPrompt((prev) => prev + (prev ? ' ' : '') + finalTranscript);
                                                }
                                            };

                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            recognition.onerror = (event: any) => {
                                                console.error('Speech recognition error:', event.error);
                                                setIsListening(false);
                                            };

                                            recognition.onend = () => {
                                                // Only stop if we manually set isListening to false
                                                if (isListening) {
                                                    try {
                                                        recognition.start();
                                                    } catch {
                                                        setIsListening(false);
                                                    }
                                                }
                                            };

                                            recognition.start();
                                        }}
                                        className={cn(
                                            "p-3 rounded-2xl transition-all relative overflow-hidden active:scale-90",
                                            isListening
                                                ? "bg-destructive/10 text-destructive shadow-inner shadow-destructive/20 border-destructive/20"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                                        )}
                                        title={isListening ? "Stop Listening" : "Start Voice Lab"}
                                    >
                                        {isListening && <div className="absolute inset-0 bg-destructive animate-pulse opacity-10" />}
                                        {isListening ? (
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <div className="absolute -inset-1 bg-destructive/40 rounded-full animate-ping" />
                                                    <Mic className="w-5 h-5 relative z-10 animate-pulse" />
                                                </div>
                                                <X className="w-4 h-4 ml-1 opacity-60 hover:opacity-100 transition-opacity" />
                                            </div>
                                        ) : (
                                            <Mic className="w-5 h-5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt.trim()}
                                        className={cn(
                                            "px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2",
                                            isGenerating || !prompt.trim()
                                                ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                                                : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
                                        )}
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Generate
                                                <span className="opacity-40">⏎</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal (Updated Styles) */}
            {showSettings && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-border bg-accent/20">
                            <div>
                                <h2 className="text-2xl font-black italic-title">Workspace Config</h2>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Integrations & Backend Settings</p>
                            </div>
                            <button onClick={() => setShowSettings(false)} className="p-3 hover:bg-accent rounded-2xl transition-all active:scale-90">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex bg-muted/30 px-8">
                            <button
                                className={cn(
                                    "px-6 py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all",
                                    activeSettingsTab === 'supabase' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                                )}
                                onClick={() => setActiveSettingsTab('supabase')}
                            >
                                Supabase
                            </button>
                            <button
                                className={cn(
                                    "px-6 py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all",
                                    activeSettingsTab === 'api' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                                )}
                                onClick={() => setActiveSettingsTab('api')}
                            >
                                Custom APIs
                            </button>
                        </div>

                        <div className="p-8 max-h-[50vh] overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-border">
                            {activeSettingsTab === 'supabase' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-accent/30 rounded-3xl border border-border border-dashed">
                                        <div className="space-y-1">
                                            <label className="text-base font-bold">Supabase Backend</label>
                                            <p className="text-xs text-muted-foreground">Enable direct data fetching from your Supabase project.</p>
                                        </div>
                                        <div
                                            className={cn(
                                                "w-14 h-8 rounded-full p-1 cursor-pointer transition-colors",
                                                supabaseConfig.enabled ? "bg-primary" : "bg-muted"
                                            )}
                                            onClick={() => setSupabaseConfig({ ...supabaseConfig, enabled: !supabaseConfig.enabled })}
                                        >
                                            <div className={cn("w-6 h-6 bg-white rounded-full transition-transform", supabaseConfig.enabled ? "translate-x-6" : "translate-x-0")} />
                                        </div>
                                    </div>

                                    {supabaseConfig.enabled && (
                                        <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Project URL</label>
                                                <input
                                                    type="text"
                                                    value={supabaseConfig.url}
                                                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                                                    className="w-full p-4 text-sm border-2 border-border rounded-2xl bg-muted/30 focus:border-primary outline-none transition-all"
                                                    placeholder="https://xyz.supabase.co"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Anon Key</label>
                                                <input
                                                    type="password"
                                                    value={supabaseConfig.key}
                                                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, key: e.target.value })}
                                                    className="w-full p-4 text-sm border-2 border-border rounded-2xl bg-muted/30 focus:border-primary outline-none transition-all"
                                                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeSettingsTab === 'api' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold">Endpoints</h3>
                                            <p className="text-xs text-muted-foreground">Register external services for specialized AI generation.</p>
                                        </div>
                                        <button
                                            onClick={() => setCustomApiConfig({
                                                endpoints: [...customApiConfig.endpoints, { url: '', method: 'GET', desc: '' }]
                                            })}
                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all active:scale-95"
                                        >
                                            + Add
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {customApiConfig.endpoints.length === 0 ? (
                                            <div className="py-12 border-2 border-dashed border-border rounded-3xl text-center text-muted-foreground">
                                                <p className="text-xs font-medium uppercase tracking-widest">No custom endpoints configured</p>
                                            </div>
                                        ) : (
                                            customApiConfig.endpoints.map((endpoint: { method: string; url: string; desc: string }, idx: number) => (
                                                <div key={idx} className="p-6 bg-accent/20 rounded-3xl border border-border group relative animate-in slide-in-from-right-4 duration-300">
                                                    <div className="flex gap-4 mb-4">
                                                        <select
                                                            value={endpoint.method}
                                                            onChange={(e) => {
                                                                const newEndpoints = [...customApiConfig.endpoints];
                                                                newEndpoints[idx].method = e.target.value;
                                                                setCustomApiConfig({ endpoints: newEndpoints });
                                                            }}
                                                            className="text-[10px] font-black uppercase tracking-widest p-2 rounded-xl border border-border bg-card outline-none focus:border-primary"
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
                                                            className="flex-1 text-xs p-2.5 rounded-xl border border-border bg-card outline-none focus:border-primary placeholder:text-muted-foreground/40"
                                                            placeholder="Endpoint URL"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={endpoint.desc}
                                                        onChange={(e) => {
                                                            const newEndpoints = [...customApiConfig.endpoints];
                                                            newEndpoints[idx].desc = e.target.value;
                                                            setCustomApiConfig({ endpoints: newEndpoints });
                                                        }}
                                                        className="w-full text-xs p-2.5 rounded-xl border border-border bg-card outline-none focus:border-primary placeholder:text-muted-foreground/40"
                                                        placeholder="What does this do? (e.g., Auth service)"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newEndpoints = customApiConfig.endpoints.filter((_: unknown, i: number) => i !== idx);
                                                            setCustomApiConfig({ endpoints: newEndpoints });
                                                        }}
                                                        className="absolute -top-2 -right-2 p-1.5 bg-background border border-border text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-border bg-muted/20 flex justify-end gap-3">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-accent rounded-2xl transition-all"
                            >
                                Discard
                            </button>
                            <button
                                onClick={() => {
                                    handleSave();
                                    setShowSettings(false);
                                }}
                                className="px-8 py-3 text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .italic-title {
                    font-style: italic;
                    letter-spacing: -0.05em;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
