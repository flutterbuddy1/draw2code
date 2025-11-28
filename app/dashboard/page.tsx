import Link from "next/link";
import { Plus, Clock, FileCode } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const projects = await prisma.project.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">My Projects</h1>
                    <Link href="/project/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> New Project
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 border-dashed">
                        <FileCode className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">No projects yet</h3>
                        <p className="text-zinc-500 mb-6">Create your first project to start sketching.</p>
                        <Link href="/project/new" className="text-blue-600 hover:underline">Create Project</Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Link key={project.id} href={`/project/${project.id}`} className="block group">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <FileCode className="w-5 h-5" />
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${project.status === 'READY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                project.status === 'GENERATING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">{project.description || "No description"}</p>
                                    <div className="flex items-center text-xs text-zinc-400 gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
