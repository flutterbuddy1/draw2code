'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createProject(name: string, description?: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    if (!userId) {
        throw new Error("User ID missing");
    }

    const project = await prisma.project.create({
        data: {
            name,
            description,
            userId
        }
    });

    revalidatePath("/dashboard");
    return project;
}
