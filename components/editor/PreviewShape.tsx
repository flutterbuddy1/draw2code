import {
    BaseBoxShapeUtil,
    HTMLContainer,
    TLBaseShape,
    RecordProps,
    T,
} from 'tldraw'

// Define the shape type
export type PreviewShape = TLBaseShape<
    'preview',
    {
        w: number
        h: number
        html: string
        codeId?: string
    }
>

// Define the shape props
export const previewShapeProps: RecordProps<PreviewShape> = {
    w: T.number,
    h: T.number,
    html: T.string,
    codeId: T.string,
}

// Create the shape util
export class PreviewShapeUtil extends BaseBoxShapeUtil<PreviewShape> {
    static override type = 'preview' as const

    override isAspectRatioLocked = () => false
    override canResize = () => true
    override canBind = () => false

    getDefaultProps(): PreviewShape['props'] {
        return {
            w: 600,
            h: 600,
            html: '',
        }
    }

    component(shape: PreviewShape) {
        const handleCopyCode = (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            navigator.clipboard.writeText(shape.props.html).then(() => {
                alert('Code copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy code');
            });
        };

        const handleDownload = (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            if (shape.props.codeId) {
                window.open(`/api/export?id=${shape.props.codeId}`, '_blank');
            } else {
                // Fallback: create a blob locally
                const blob = new Blob([shape.props.html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'generated-app.html';
                a.click();
                URL.revokeObjectURL(url);
            }
        };

        const handleOpenInNewTab = (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            try {
                if (shape.props.codeId) {
                    // Use code ID to fetch from database
                    const previewUrl = `/preview?id=${shape.props.codeId}`;
                    window.open(previewUrl, '_blank');
                } else {
                    // Fallback to encoded HTML for backward compatibility
                    const encodedCode = btoa(encodeURIComponent(shape.props.html));
                    const previewUrl = `/preview?code=${encodedCode}`;
                    window.open(previewUrl, '_blank');
                }
            } catch (err) {
                console.error('Failed to open:', err);
                alert('Failed to open preview');
            }
        };

        return (
            <HTMLContainer
                id={shape.id}
                style={{
                    width: shape.props.w,
                    height: shape.props.h,
                    pointerEvents: 'all',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    border: '2px solid #3b82f6',
                }}
            >
                <div style={{
                    width: '100%',
                    height: '36px',
                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderBottom: '1px solid #2563eb',
                    flexShrink: 0,
                    userSelect: 'none'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                        <span>Generated App Preview</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
                        <button
                            onPointerDown={handleCopyCode}
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'background 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            title="Copy code to clipboard"
                        >
                            <span>📋</span>
                            <span>Copy</span>
                        </button>
                        <button
                            onPointerDown={handleDownload}
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'background 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            title="Download code as HTML"
                        >
                            <span>📥</span>
                            <span>Download</span>
                        </button>
                        <button
                            onPointerDown={handleOpenInNewTab}
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'background 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            title="Open in new tab"
                        >
                            <span>🔗</span>
                            <span>Open</span>
                        </button>
                        <button
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (shape.props.codeId) {
                                    const shareUrl = `${window.location.origin}/share/${shape.props.codeId}`;
                                    navigator.clipboard.writeText(shareUrl).then(() => {
                                        alert('Public share link copied to clipboard!');
                                    }).catch(err => {
                                        console.error('Failed to copy:', err);
                                        alert('Failed to copy share link');
                                    });
                                } else {
                                    alert('Persistent ID not found. Please regenerate to enable sharing.');
                                }
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'background 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            title="Copy public share link"
                        >
                            <span>📢</span>
                            <span>Share</span>
                        </button>
                    </div>
                </div>
                <iframe
                    srcDoc={shape.props.html}
                    style={{
                        width: '100%',
                        height: 'calc(100% - 36px)',
                        border: 'none',
                        background: 'white',
                        pointerEvents: 'auto'
                    }}
                    sandbox="allow-scripts allow-same-origin"
                    title="Preview"
                />
            </HTMLContainer>
        )
    }

    indicator(shape: PreviewShape) {
        return <rect width={shape.props.w} height={shape.props.h} />
    }
}
