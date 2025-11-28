'use client'

import { Tldraw, Editor, createShapeId } from 'tldraw'
import 'tldraw/tldraw.css'
import { useCallback, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { PreviewShapeUtil, PreviewShape } from './PreviewShape'

interface CanvasBoardProps {
    onSave: (data: any) => void;
    initialData?: any;
}

export interface CanvasBoardRef {
    getCanvasData: () => any;
    getEditor: () => Editor | null;
    addPreviewShape: (html: string, codeId?: string) => void;
    getSelectedShapes: () => any;
}

const customShapeUtils = [PreviewShapeUtil]

const CanvasBoard = forwardRef<CanvasBoardRef, CanvasBoardProps>(({ onSave, initialData }, ref) => {
    const editorRef = useRef<Editor | null>(null);

    const handleMount = useCallback((editor: Editor) => {
        editorRef.current = editor;

        if (initialData) {
            editor.loadSnapshot(initialData)
        }

        // Debounce save
        let timeout: NodeJS.Timeout;
        editor.on('change', () => {
            const snapshot = editor.getSnapshot();
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                onSave(snapshot);
            }, 1000); // Save after 1 second of inactivity
        });
    }, [onSave]); // Removed initialData from dependency to avoid re-binding

    // Load initial data when it becomes available (e.g. after fetch)
    useEffect(() => {
        if (editorRef.current && initialData) {
            editorRef.current.loadSnapshot(initialData);
        }
    }, [initialData]);

    useImperativeHandle(ref, () => ({
        getCanvasData: () => {
            if (!editorRef.current) return null;
            return editorRef.current.getSnapshot();
        },
        getEditor: () => editorRef.current,
        getSelectedShapes: () => {
            if (!editorRef.current) return null;

            const editor = editorRef.current;
            const selectedShapeIds = editor.getSelectedShapeIds();

            if (selectedShapeIds.length === 0) {
                // If nothing is selected, return all shapes
                return editor.getCurrentPageShapes();
            }

            // Return only selected shapes
            const selectedShapes = selectedShapeIds.map(id => editor.getShape(id));
            return selectedShapes.filter(shape => shape !== undefined);
        },
        addPreviewShape: (html: string, codeId?: string) => {
            if (!editorRef.current) return;

            const editor = editorRef.current;
            const id = createShapeId();

            // Get viewport center
            const { x, y } = editor.getViewportScreenCenter();

            editor.createShape<PreviewShape>({
                id,
                type: 'preview',
                x: x - 300, // Center the shape (600px wide / 2)
                y: y - 300, // Center the shape (600px tall / 2)
                props: {
                    w: 600,
                    h: 600,
                    html,
                    codeId,
                },
            });

            // Select the newly created shape
            editor.select(id);
        }
    }));

    return (
        <div className="w-full h-full relative">
            <Tldraw
                onMount={handleMount}
                shapeUtils={customShapeUtils}
            />
        </div>
    )
});

CanvasBoard.displayName = 'CanvasBoard';

export default CanvasBoard;
