'use client'

import { Tldraw, Editor, createShapeId } from 'tldraw'
import 'tldraw/tldraw.css'
import { useCallback, forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react'
import { PreviewShapeUtil, PreviewShape } from './PreviewShape'

interface CanvasBoardProps {
    onSave: (data: unknown) => void;
    initialData?: unknown;
}

export interface CanvasBoardRef {
    getCanvasData: () => unknown;
    getEditor: () => Editor | null;
    addPreviewShape: (html: string, codeId?: string) => void;
    getSelectedShapes: () => unknown;
}

const customShapeUtils = [PreviewShapeUtil]

const CanvasBoard = forwardRef<CanvasBoardRef, CanvasBoardProps>(({ onSave, initialData }, ref) => {
    const editorRef = useRef<Editor | null>(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const hasLoadedRef = useRef(false);

    const handleMount = useCallback((editor: Editor) => {
        editorRef.current = editor;
        setIsEditorReady(true);

        // Try to load initial data immediately on mount if available
        if (initialData && !hasLoadedRef.current) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                editor.store.loadSnapshot(initialData as any);
                hasLoadedRef.current = true;
                console.log('Snapshot loaded on mount');
            } catch (err) {
                console.error('Failed to load snapshot on mount:', err);
            }
        }
    }, [initialData]);

    // Setup auto-save listener
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor || !isEditorReady) return;

        let timeout: NodeJS.Timeout;
        const unlisten = editor.on('change', (event) => {
            // Only trigger save if the change was made by the user, not by the store loading
            if (event.source === 'user') {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (hasLoadedRef.current) {
                        const snapshot = editor.store.getSnapshot();
                        onSave(snapshot);
                    }
                }, 1500); // 1.5s debounce for stability
            }
        });

        return () => {
            if (typeof unlisten === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (unlisten as any)();
            }
            clearTimeout(timeout);
        };
    }, [onSave, isEditorReady]);

    // Handle late-arriving initial data or updates
    useEffect(() => {
        if (editorRef.current && initialData && !hasLoadedRef.current) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                editorRef.current.store.loadSnapshot(initialData as any);
                hasLoadedRef.current = true;
                console.log('Snapshot loaded via useEffect');
            } catch (err) {
                console.error('Failed to load snapshot in useEffect:', err);
            }
        }
    }, [initialData]);

    useImperativeHandle(ref, () => ({
        getCanvasData: () => {
            if (!editorRef.current) return null;
            return editorRef.current.store.getSnapshot();
        },
        getEditor: () => editorRef.current,
        getSelectedShapes: () => {
            if (!editorRef.current) return null;

            const editor = editorRef.current;
            const selectedShapeIds = editor.getSelectedShapeIds();

            if (selectedShapeIds.length === 0) {
                return editor.getCurrentPageShapes();
            }

            const selectedShapes = selectedShapeIds.map(id => editor.getShape(id));
            return selectedShapes.filter((shape): shape is Exclude<typeof shape, undefined> => shape !== undefined);
        },
        addPreviewShape: (html: string, codeId?: string) => {
            if (!editorRef.current) return;

            const editor = editorRef.current;
            const id = createShapeId();
            const { x, y } = editor.getViewportScreenCenter();

            editor.createShape<PreviewShape>({
                id,
                type: 'preview',
                x: x - 300,
                y: y - 300,
                props: {
                    w: 600,
                    h: 600,
                    html,
                    codeId,
                },
            });

            editor.select(id);
        }
    }));

    return (
        <div className="w-full h-full relative tldraw-custom-theme">
            <Tldraw
                onMount={handleMount}
                shapeUtils={customShapeUtils}
                inferDarkMode={true}
            />
            <style jsx global>{`
                .tldraw-custom-theme .tl-ui-layout {
                    z-index: 10;
                }
                .tldraw-custom-theme .tl-canvas {
                    background-color: var(--background);
                }
            `}</style>
        </div>
    )
});

CanvasBoard.displayName = 'CanvasBoard';

export default CanvasBoard;
