import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface SharePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
    const { id } = await params;
    const generatedCode = await prisma.generatedCode.findUnique({
        where: { id },
        include: { project: true }
    });

    if (!generatedCode) return { title: 'Not Found - Draw2Code' };

    return {
        title: `${generatedCode.project.name} | Shared via Draw2Code`,
        description: generatedCode.project.description || 'Check out this application generated from a sketch!',
    };
}

export default async function SharePage({ params }: SharePageProps) {
    const { id } = await params;

    const generatedCode = await prisma.generatedCode.findUnique({
        where: { id },
        select: { code: true }
    });

    if (!generatedCode) {
        notFound();
    }

    return (
        <div className="w-full h-screen bg-white">
            <iframe
                srcDoc={generatedCode.code}
                className="w-full h-full border-none"
                title="Shared App - Draw2Code"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
            
            {/* Attribution Overlay (Subtle) */}
            <div className="fixed bottom-4 right-4 z-50">
                <a 
                    href="/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-2xl"
                >
                    <span className="opacity-50">Built with</span>
                    <span className="text-primary">Draw2Code</span>
                </a>
            </div>
        </div>
    );
}
