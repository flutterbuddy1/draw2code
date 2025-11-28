import Link from "next/link";
import { ArrowRight, PenTool, Code, Globe, Mic } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            AS
          </div>
          <span className="text-xl font-bold tracking-tight">AppSketch Studio</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline">Log in</Link>
          <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Draw your dream app. <br />
          <span className="text-blue-600">Let AI write the code.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Sketch your ideas on a digital canvas, describe them with your voice, and watch as AppSketch Studio transforms your vision into production-ready code instantly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2">
            Start Sketching <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/playground" className="px-8 py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold rounded-lg transition-all border border-zinc-200 dark:border-zinc-800">
            Try the Playground
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need to build faster</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<PenTool className="w-6 h-6 text-blue-600" />}
              title="Draw Your App"
              description="Sketch wireframes and layouts directly on our infinite canvas. Intuitive tools for rectangles, text, and arrows."
            />
            <FeatureCard
              icon={<Code className="w-6 h-6 text-purple-600" />}
              title="AI-Powered Coding"
              description="Our advanced AI analyzes your sketches and prompts to generate clean, modern React & Tailwind code."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-green-600" />}
              title="Multilingual Support"
              description="Build for the world. Describe your app in English, Hindi, Spanish, or any major language."
            />
            <FeatureCard
              icon={<Mic className="w-6 h-6 text-orange-600" />}
              title="Voice Commands"
              description="Don't just type—speak. Describe complex interactions and features verbally to speed up your workflow."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">From Idea to App in 4 Steps</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />

          <Step number="1" title="Ideate" description="Brainstorm and sketch your rough ideas on the whiteboard." />
          <Step number="2" title="Create" description="Add details, text, and structure to your wireframes." />
          <Step number="3" title="Refine" description="Use voice or text to explain specific behaviors and logic." />
          <Step number="4" title="Build" description="Click generate and get full source code ready to deploy." />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AppSketch Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg w-fit">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg">
      <div className="w-16 h-16 bg-blue-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-zinc-950">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
