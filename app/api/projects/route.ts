import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description } = body as { name: string; description?: string };

        const userId = session.user.id;
        if (!userId) {
            return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                userId
            }
        });

        return NextResponse.json(project);
    } catch {
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
