'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

function PreviewContent() {
    const searchParams = useSearchParams();
    const codeId = searchParams.get('id');
    const encodedCode = searchParams.get('code');
    const [html, setHtml] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCode() {
            if (codeId) {
                try {
                    const res = await fetch(`/api/code?id=${codeId}`);
                    if (!res.ok) {
                        throw new Error('Failed to fetch code');
                    }
                    const data = await res.json();
                    setHtml(data.code);
                } catch (err) {
                    console.error('Error fetching code:', err);
                    setError('Failed to load preview');
                } finally {
                    setLoading(false);
                }
            } else if (encodedCode) {
                try {
                    const decodedCode = decodeURIComponent(atob(encodedCode));
                    setHtml(decodedCode);
                } catch (err) {
                    console.error('Error decoding code:', err);
                    setError('Failed to decode preview');
                } finally {
                    setLoading(false);
                }
            } else {
                setError('No code provided');
                setLoading(false);
            }
        }

        fetchCode();
    }, [codeId, encodedCode]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-widest">Compiling Preview...</p>
                </div>
            </div>
        );
    }

    if (error || !html) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center p-8 bg-card rounded-3xl border border-border shadow-2xl">
                    <h1 className="text-3xl font-black text-foreground mb-4 italic-title">
                        {error || 'No Code Found'}
                    </h1>
                    <p className="text-muted-foreground mb-8 text-center max-w-xs">You don&apos;t have any generated code for this project yet. It may have been deleted or expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-white">
            <iframe
                srcDoc={html}
                className="w-full h-full border-none"
                title="Generated App Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
        </div>
    );
}

export default function PreviewPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <PreviewContent />
        </Suspense>
    );
}
