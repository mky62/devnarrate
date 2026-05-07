import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
import { AuroraText } from "@/components/ui/aurora-text";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { StackingCard } from "@/components/ui/stacking-scroll";
import { LiveStats } from "./components/LiveStats";
import heroBg from "@/public/herobg.jpg";
import {
  GitBranch,
  FileText,
  Globe,
  Zap,
  ArrowRight,
} from "lucide-react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

const features = [
  {
    icon: GitBranch,
    title: "Explain architecture",
    description:
      "Map repo structure, system choices, and implementation details into a readable project narrative that anyone can follow.",
  },
  {
    icon: FileText,
    title: "Share tradeoffs",
    description:
      "Document the decisions behind your build so readers understand what changed and why it matters for the project.",
  },
  {
    icon: Globe,
    title: "Build proof of work",
    description:
      "Create a public developer page that shows your judgment, execution, and the story behind every line of code.",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect your repos",
    description: "Link GitHub repositories to automatically import structure and commits.",
  },
  {
    number: "02",
    title: "Write the narrative",
    description: "Explain architecture, tradeoffs, and the reasoning behind key decisions.",
  },
  {
    number: "03",
    title: "Share with the world",
    description: "Publish a beautiful project story that recruiters and peers can explore.",
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-white font-montserrat font-light text-slate-900">
      <Navbar />

      {/* ========== HERO ========== */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-28 pb-20 text-center sm:px-8 md:pt-32">
        {/* Background image */}
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={heroBg}
            alt="Hero background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <BlurFade delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
              </span>
              <AnimatedShinyText className="text-xs font-medium tracking-wide">
                dev.narrate is live
              </AnimatedShinyText>
            </div>
          </BlurFade>

          <BlurFade delay={0.1}>
            <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Ship stories,{" "}
              <AuroraText
                colors={["#2563eb", "#06b6d4", "#8b5cf6", "#2563eb"]}
                speed={1.2}
              >
                not just code
              </AuroraText>
            </h1>
          </BlurFade>

          <BlurFade delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              The platform where builders turn repositories into clear project
              narratives. Explain architecture, tradeoffs, and shipped work
              with the same care you put into the code.
            </p>
          </BlurFade>

          <BlurFade delay={0.3}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/p/create"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_32px_rgba(59,130,246,0.25)]"
              >
                Start writing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                Explore stories
              </Link>
            </div>
          </BlurFade>
        </div>

        {/* Hero visual */}
        <BlurFade delay={0.5} className="relative z-10 mt-16 w-full max-w-5xl">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-slate-400">project-story.md</span>
            </div>
            <div className="p-6 text-left font-mono text-sm leading-relaxed text-slate-600 sm:p-8">
              <p className="text-slate-400"># Why I built this</p>
              <p className="mt-2">
                <span className="text-blue-600">&gt;</span> The problem was
                simple: recruiters see repos, not reasoning.
              </p>
              <p className="mt-1">
                <span className="text-blue-600">&gt;</span> So I built a
                pipeline that turns commit history into architecture diagrams
                and narrative.
              </p>
              <p className="mt-1">
                <span className="text-blue-600">&gt;</span> Tradeoffs
                documented. Lessons learned. Shipped in 6 weeks.
              </p>
              <p className="mt-3 text-slate-400">## Stack</p>
              <p className="mt-1">Next.js · PostgreSQL · TipTap · OpenAI</p>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
          </div>
        </BlurFade>
      </section>

      {/* ========== LOGOS MARQUEE ========== */}
      <section className="relative border-y border-slate-100 bg-slate-50/50 py-10 overflow-hidden">
        <div className="relative">
          {/* Side fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50/50 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50/50 to-transparent z-10" />

          <BlurFade>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400 text-center mb-6">
              Built for developers who ship
            </p>
          </BlurFade>

          {/* Marquee */}
          <Marquee className="[--duration:30s]" pauseOnHover>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 shadow-sm"
              >
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  {["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Tailwind", "OpenAI"][i]}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ========== STACKING FEATURES ========== */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <BlurFade>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to{" "}
                <span className="text-blue-600">tell your story</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-slate-500">
                From repo analysis to published narrative in minutes, not hours.
              </p>
            </div>
          </BlurFade>

          {/* Stacking scroll cards */}
          <div className="relative space-y-8">
            {features.map((f, i) => (
              <StackingCard
                key={f.title}
                index={i}
                totalCards={features.length}
                className="p-8"
              >
                <div className="flex items-start gap-6">
                  <div className="shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <f.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {f.title}
                    </h3>
                    <p className="text-base leading-relaxed text-slate-500">
                      {f.description}
                    </p>
                  </div>
                </div>
              </StackingCard>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative py-24 sm:py-32 bg-slate-50/50">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <BlurFade>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                How it works
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-slate-500">
                Three steps from raw repo to published story.
              </p>
            </div>
          </BlurFade>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <BlurFade key={step.number} delay={0.1 + i * 0.15}>
                <div className="relative">
                  <span className="text-5xl font-bold text-slate-100">
                    {step.number}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ========== LIVE STATS ========== */}
      <LiveStats />

      {/* ========== CTA ========== */}
      <section className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-blue-100 blur-[100px]" />
          <div className="absolute right-10 top-20 h-96 w-96 rounded-full bg-sky-50 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-8">
          <BlurFade>
            <Zap className="mx-auto h-8 w-8 text-blue-600" />
          </BlurFade>
          <BlurFade delay={0.1}>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Ready to tell your story?
            </h2>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-4 max-w-lg text-slate-500">
              Join thousands of developers who turn their code into compelling
              project narratives.
            </p>
          </BlurFade>
          <BlurFade delay={0.3}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/p/create"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_32px_rgba(59,130,246,0.25)]"
              >
                Start writing free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                See examples
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                dev<span className="text-blue-600">.</span>narrate
              </span>
            </div>

            <nav className="flex gap-8 text-sm text-slate-500">
              <Link href="/explore" className="transition-colors hover:text-slate-900">
                Explore
              </Link>
              <Link href="/p/create" className="transition-colors hover:text-slate-900">
                Create
              </Link>
              <Link href="/docs" className="transition-colors hover:text-slate-900">
                Docs
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/mky62/devnarrate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 transition-colors hover:text-slate-900"
              >
                <FaGithub className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} dev.narrate. Built for developers who ship stories.
          </div>
        </div>
      </footer>
    </main>
  );
}
