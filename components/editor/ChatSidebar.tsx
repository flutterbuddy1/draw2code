'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Bot, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSendMessage: (message: string) => void;
    isGenerating: boolean;
    messages: Message[];
}

export default function ChatSidebar({ isOpen, onClose, onSendMessage, isGenerating, messages }: ChatSidebarProps) {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || isGenerating) return;
        onSendMessage(input);
        setInput('');
    };

    const toggleListening = () => {
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.start();
    };

    return (
        <div
            className={cn(
                "fixed top-0 right-0 h-full w-85 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl z-[10000] transform transition-all duration-500 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full opacity-0 pointer-events-none"
            )}
        >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-accent/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Design Intelligence</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI Assistant Online</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-accent rounded-xl transition-all text-muted-foreground hover:text-foreground active:scale-95"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-80">
                        <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-2 shadow-inner">
                            <MessageSquare className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h4 className="text-base font-bold text-foreground italic-title">Start a Conversation</h4>
                        <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                            Ask me to generate a new UI, refactor elements, or add specific interactions to your sketch.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[90%] space-y-2 animate-in fade-in slide-in-from-bottom-2",
                                msg.role === 'user' ? "ml-auto items-end" : "items-start"
                            )}
                        >
                            <div className={cn(
                                "px-4 py-3 rounded-2xl text-sm shadow-sm transition-all leading-relaxed",
                                msg.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20"
                                    : "bg-muted text-foreground rounded-tl-none border border-border"
                            )}>
                                {msg.content}
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground px-1 uppercase opacity-60">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
                {isGenerating && (
                    <div className="flex items-center gap-3 text-primary animate-pulse">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Thinking</span>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-border bg-card">
                <div className="relative group">
                    <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type a creative prompt..."
                        className="w-full bg-muted border border-border rounded-2xl px-5 py-4 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-inner"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                            onClick={toggleListening}
                            className={cn(
                                "p-2 rounded-xl transition-all relative overflow-hidden",
                                isListening
                                    ? "text-destructive bg-destructive/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            {isListening && <div className="absolute inset-0 bg-destructive animate-ping opacity-20" />}
                            <Mic className={cn("w-5 h-5", isListening && "animate-pulse")} />
                        </button>
                        <button
                            disabled={!input.trim() || isGenerating}
                            onClick={handleSend}
                            className={cn(
                                "p-2 rounded-xl transition-all",
                                !input.trim() || isGenerating
                                    ? "text-muted-foreground/30 cursor-not-allowed"
                                    : "text-primary hover:bg-primary/10 active:scale-95"
                            )}
                        >
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <p className="mt-3 text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter">
                    Press Enter to send &bull; Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
