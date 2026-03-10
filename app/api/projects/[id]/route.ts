import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const project = await prisma.project.findUnique({
            where: {
                id: id,
                userId: session.user.id,
            },
            include: {
                generatedCodes: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ project });
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, canvasData, supabaseConfig, customApiConfig } = body;

        const project = await prisma.project.update({
            where: {
                id: id,
                userId: session.user.id,
            },
            data: {
                name,
                description,
                canvasData,
                supabaseConfig,
                customApiConfig
            },
        });

        return NextResponse.json({ project });
    } catch {
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}
