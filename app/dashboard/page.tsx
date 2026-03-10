import Link from "next/link";
import { Plus, Clock, FileCode } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

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
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground mb-1">Workspace</h1>
                        <p className="text-muted-foreground text-sm">Manage and organize your creative sketches.</p>
                    </div>
                    <Link href="/project/new" className="group px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> New Project
                    </Link>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-6 bg-card text-card-foreground rounded-3xl border border-border border-dashed animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                            <FileCode className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-8 text-center max-w-xs">Start your first project to experience the power of AI-assisted sketching.</p>
                        <Link href="/project/new" className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-bold transition-all border border-border">
                            Create Your First Project
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {projects.map((project) => (
                            <Link key={project.id} href={`/project/${project.id}`} className="block group">
                                <div className="h-full bg-card text-card-foreground p-7 rounded-3xl border border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 flex flex-col">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                            <FileCode className="w-6 h-6" />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
                                            project.status === 'READY' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                                project.status === 'GENERATING' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse' :
                                                    'bg-muted text-muted-foreground border border-border'
                                        )}>
                                            {project.status || 'DRAFT'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-8 flex-grow">{project.description || "No description provided for this project."}</p>
                                    <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
                                        <div className="flex items-center text-[11px] font-medium text-muted-foreground gap-1.5">
                                            <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                                            <span>{new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            Open Project &rarr;
                                        </div>
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
