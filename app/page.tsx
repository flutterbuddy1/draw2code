import Link from "next/link";
import { ArrowRight, Sparkles, Layers, Zap, Mic, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-background" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/60 backdrop-blur-xl transition-all duration-300">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Draw2Code
          </span>
        </div>
        <nav className="hidden lg:flex items-center gap-10 text-sm font-semibold text-muted-foreground/80">
          <Link href="#features" className="hover:text-primary transition-all hover:scale-105">Features</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-all hover:scale-105">Workflow</Link>
          <Link href="#pricing" className="hover:text-primary transition-all hover:scale-105">Pricing</Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">SignIn</Link>
          <Link href="/signup" className="relative group overflow-hidden px-6 py-2.5 bg-foreground text-background font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-foreground/10">
            <span className="relative z-10 text-sm">Join Beta</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 relative flex flex-col items-center justify-center pt-32 pb-24 overflow-hidden">
        <div className="absolute top-24 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Sparkles className="w-3 h-3 animate-spin duration-3000" />
          Powered by Gemini 2.0
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Sketch your vision.<br />
            <span className="relative">
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
                Develop at speed.
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20 fill-current" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0 10c20-8 40-8 60 0s40 8 60 0v2H0z" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground/80 mb-14 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Draw2Code is the next-gen whiteboard that understands your design.
            From napkins to production-ready React apps in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link href="/signup" className="group h-16 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40 flex items-center gap-3 hover:-translate-y-1.5 active:scale-95 text-lg">
              Start Building <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link href="/dashboard" className="h-16 px-10 bg-muted hover:bg-muted/80 text-foreground font-black rounded-2xl transition-all border border-border/50 hover:-translate-y-1.5 active:scale-95 flex items-center text-lg">
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute left-[5%] top-[40%] w-32 h-32 bg-primary/20 rounded-[40px] rotate-12 blur-3xl" />
        <div className="absolute right-[5%] bottom-[20%] w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      </section>

      {/* Stats/Social Proof */}
      <section className="px-6 py-12 border-y border-border/50 bg-secondary/30">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat value="10k+" label="Generations" />
          <Stat value="98%" label="Accuracy" />
          <Stat value="24/7" label="Support" />
          <Stat value="Beta" label="Status" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-32 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-24">
            <div className="w-16 h-1 bg-primary mb-8 rounded-full" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Engineered for Builders</h2>
            <p className="text-xl text-muted-foreground/80 max-w-2xl font-medium leading-relaxed">
              We removed the friction between {"\""}What if?{"\""} and {"\""}It works.{"\""}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BentoCard
              icon={<Layers className="w-10 h-10 text-primary" />}
              title="Infinite Design Space"
              description="A professional tldraw canvas optimized for engineering diagrams and wireframes."
              className="md:col-span-2"
            />
            <BentoCard
              icon={<Zap className="w-10 h-10 text-yellow-500" />}
              title="Instant Preview"
              description="See changes in real-time as the AI compiles your design."
              className="md:col-span-1"
            />
            <BentoCard
              icon={<Mic className="w-10 h-10 text-indigo-500" />}
              title="Voice Commands"
              description="Just say 'Make it responsive' or 'Add authentication'."
              className="md:col-span-1"
            />
            <BentoCard
              icon={<Rocket className="w-10 h-10 text-emerald-500" />}
              title="Clean Code Export"
              description="Download production-grade React code that follows all modern best practices."
              className="md:col-span-2"
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="how-it-works" className="px-6 py-32 bg-foreground text-background rounded-[40px] md:mx-12 mb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-24">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 max-w-3xl leading-tight">
              One canvas. <br />
              Infinite possibilities.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <WorkflowStep
                num="01"
                title="Sketch the UI"
                desc="Use our high-performance whiteboard tools to draw layouts, buttons, and sections."
              />
              <WorkflowStep
                num="02"
                title="AI Interpretation"
                desc="Our specialized vision model analyzes your sketches at the token level."
              />
              <WorkflowStep
                num="03"
                title="Code Synthesis"
                desc="Receive structured React code with Tailwind CSS integration automatically."
              />
            </div>
            <div className="relative group perspective-1000">
              <div className="w-full aspect-square rounded-[40px] bg-background/5 border border-white/10 backdrop-blur-3xl p-8 flex items-center justify-center transform group-hover:rotate-y-12 transition-transform duration-700">
                <div className="w-full h-full rounded-2xl bg-muted relative overflow-hidden border border-border/50 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 w-32 bg-primary/20 rounded-full animate-pulse" />
                    <div className="h-24 w-full bg-background/50 rounded-xl border border-border shadow-inner" />
                    <div className="flex gap-4">
                      <div className="h-10 w-24 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-[10px] font-bold">Button</div>
                      <div className="h-10 w-24 bg-muted border border-border rounded-lg flex items-center justify-center text-[10px] font-bold">Cancel</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-40 flex flex-col items-center text-center">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-12">Ready to ship?</h2>
        <Link href="/signup" className="h-20 px-16 bg-foreground text-background hover:bg-foreground/90 font-black rounded-3xl transition-all shadow-2xl flex items-center text-2xl hover:scale-110 active:scale-95">
          Get Early Access
        </Link>
        <p className="mt-12 text-muted-foreground font-bold tracking-widest uppercase text-xs">JOIN 2,000+ DESIGNERS AND DEVELOPERS</p>
      </section>

      {/* Fine Footer */}
      <footer className="px-6 py-20 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tighter">Draw2Code</span>
          </div>
          <p className="text-muted-foreground font-bold text-sm">
            &copy; {new Date().getFullYear()} DRAW2CODE LABS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 text-sm font-bold">
            <Link href="#" className="hover:text-primary transition-colors">TWITTER</Link>
            <Link href="#" className="hover:text-primary transition-colors">GITHUB</Link>
            <Link href="#" className="hover:text-primary transition-colors">DISCORD</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">{value}</div>
      <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

function BentoCard({ icon, title, description, className }: { icon: React.ReactNode, title: string, description: string, className?: string }) {
  return (
    <div className={cn(
      "group p-10 bg-card/50 backdrop-blur-sm rounded-[40px] border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5",
      className
    )}>
      <div className="mb-8 p-6 bg-muted rounded-3xl w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">{icon}</div>
      <h3 className="text-2xl font-black tracking-tight mb-4">{title}</h3>
      <p className="text-muted-foreground font-medium leading-relaxed">{description}</p>
    </div>
  );
}

function WorkflowStep({ num, title, desc }: { num: string; title: string, desc: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="text-2xl font-black text-white/20 group-hover:text-primary transition-colors duration-500">/{num}</div>
      <div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-white/60 font-medium max-w-lg leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
