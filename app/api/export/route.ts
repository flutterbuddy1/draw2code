import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Code ID is required' }, { status: 400 });
        }

        const generatedCode = await prisma.generatedCode.findUnique({
            where: { id },
            select: { code: true, language: true, framework: true }
        });

        if (!generatedCode) {
            return NextResponse.json({ error: 'Code not found' }, { status: 404 });
        }

        // Return as a downloadable file
        const filename = `app-${id.substring(0, 8)}.html`;

        return new NextResponse(generatedCode.code, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export code' }, { status: 500 });
    }
}
