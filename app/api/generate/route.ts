import { NextResponse } from 'next/server';

import { generateAppCode } from '@/lib/ai-generator';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { projectId, canvasData, prompt, framework, language, supabaseConfig, customApiConfig } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        // Update project status
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'GENERATING' }
        });

        // Generate code
        const code = await generateAppCode(prompt, canvasData, framework, language, supabaseConfig, customApiConfig);

        // Save generated code
        const savedCode = await prisma.generatedCode.create({
            data: {
                code,
                language,
                framework,
                projectId
            }
        });

        // Update project status
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'READY' }
        });

        return NextResponse.json({ success: true, code: savedCode });
    } catch (error: unknown) {
        console.error('Generation Error:', error);
        return NextResponse.json({ 
            error: 'Failed to generate app', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
