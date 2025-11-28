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
                // Fetch from database using ID
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
                // Fallback to encoded code from URL
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
            <div className="flex items-center justify-center h-screen bg-zinc-100 dark:bg-zinc-900">
                <div className="text-zinc-600 dark:text-zinc-400">Loading preview...</div>
            </div>
        );
    }

    if (error || !html) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-100 dark:bg-zinc-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                        {error || 'No Code Provided'}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">Please provide code via the URL parameter.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen">
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
            <div className="flex items-center justify-center h-screen bg-zinc-100 dark:bg-zinc-900">
                <div className="text-zinc-600 dark:text-zinc-400">Loading preview...</div>
            </div>
        }>
            <PreviewContent />
        </Suspense>
    );
}
