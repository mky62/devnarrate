// "use client";

// import { useEffect, useRef } from "react";
// import Lenis from "lenis";
// import Navbar from "./components/Navbar";
// import Image from "next/image";
// import HeroBg from "@/public/herobg.jpg";
// import CodeS from "@/public/codeimg.svg";
// import Title from "./components/Title";
// import Stat from "./components/Stats";
// import Pill from "./components/Pill";
// import Link from "next/link";
// import { FaCompass, FaGithub, FaHeart, FaPenNib, FaUserCog } from "react-icons/fa";
// import { FaXTwitter } from "react-icons/fa6";
// import { Button } from "@/packages/tiptap/components/ui/button";


// export default function HomePage() {
//   const lenisRef = useRef<Lenis | null>(null);

//   useEffect(() => {
//     lenisRef.current = new Lenis({
//       duration: 1.2,
//       easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//       orientation: "vertical",
//       gestureOrientation: "vertical",
//       smoothWheel: true,
//       touchMultiplier: 2,
//     });

//     function raf(time: number) {
//       lenisRef.current?.raf(time);
//       requestAnimationFrame(raf);
//     }

//     requestAnimationFrame(raf);

//     return () => {
//       lenisRef.current?.destroy();
//     };
//   }, []);
//   return (
//     <div className="h-full w-full relative text-white p-4 md:p-10 lg:p-20">

//       {/* Fixed background image */}
//       <div className="fixed inset-0 z-0 pointer-events-none">
//         <Image
//           src={HeroBg}
//           alt="Hero Background"
//           fill
//           className="object-cover"
//           priority
//         />
//       </div>

//       <Navbar />


//       {/* Hero section - Redesigned with glassmorphic card for modern contrast while keeping the exact same dark/blue theme */}
//       <div className="max-w-6xl mt-6 mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] items-center gap-6 md:gap-8 p-3 sm:p-4 md:p-8 rounded-3xl md:rounded-4xl bg-blue-400/20 relative z-10 overflow-hidden">
        
//         {/* Glassmorphic content card (left side) - clean, modern redesign */}
//         <div className="w-full min-w-0 flex flex-col gap-5 sm:gap-6 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-10 lg:p-12 min-h-[360px] sm:min-h-[400px] lg:min-h-[500px] justify-center shadow-[0_0_20px_0_rgba(74,222,128,0.2),0_0_40px_0_rgba(59,130,246,0.15)] shadow-green-600/20 shadow-blue-600/20">
//           <Pill pill={"for builders"} />
//           <Title
//             title={
//               <>
//                 explain what you built,{" "}
//                 <span className="text-blue-400 italic">not just</span> show the{" "}
//                 <span className="underline decoration-blue-400 wavy decoration-2 underline-offset-4">
//                   code
//                 </span>
//               </>
//             }
//             description="Explore architecture notes, launch stories, tradeoffs, and project writeups from builders turning repos into readable proof of work."
//     align=""
//           />
//           <div className="flex flex-wrap gap-4">
//             <Link href='/explore' className="inline-flex items-center justify-center text-white px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors">
//              Explore
//             </Link>
//           </div>
//         </div>

//         {/* Right image - slightly enhanced with deeper shadow for better pop */}
//         <div className="w-full min-w-0 flex items-center justify-center px-2 sm:px-6 lg:px-0">
//           <Image
//             src={CodeS}
//             alt="Developer img"
//             width={500}
//             height={500}
//             className="object-contain w-full max-w-[220px] sm:max-w-[280px] md:max-w-sm lg:max-w-full drop-shadow-2xl"
//             priority
//           />
//         </div>
//       </div>

//       {/* New section after hero - Community stats & impact (kept 100% relevant to the core theme: developers explaining their code, GitHub storytelling, real builder impact) */}
//       <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24 relative z-10">
//         <div className="flex flex-col items-center text-center mb-16">
//           <Pill pill={"community impact"} />
//           <Title
//             title={
//               <>
//                 Real builders,{" "}
//                 <span className="text-blue-400">real stories</span>
//               </>
//             }
//             description="Link your GitHub repos on platform. Architecture explained. Lessons shared. Careers advanced."
//             align="center"
//           />
//         </div>

//         {/* Using the already-imported Stat component (perfectly on-theme) */}
//         <Stat />
//       </div>

//       <footer className="max-w-7xl mx-auto mt-4 rounded-2xl border-t border-white/10 bg-black/60 px-4 py-10 md:px-8 md:py-16 relative z-10">
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-white/70">
    
//     {/* Brand */}
//     <div className="flex items-start gap-4">
//       <Image
//         src="/icon.svg"
//         alt="dev.narrate icon"
//         width={44}
//         height={44}
//         className="mt-1 rounded-xl shadow-[0_0_18px_rgba(59,130,246,0.28)]"
//       />
//       <div className="space-y-3">
//         <div className="flex flex-wrap items-center gap-3">
//           <span className="text-2xl md:text-3xl font-semibold tracking-tighter text-blue-400">
//             dev.narrate
//           </span>
//           <Pill pill={"beta"} />
//         </div>
//         <p className="text-sm text-white/50 max-w-xs">
//           A platform to explain what you built — not just show the code.
//         </p>
//       </div>
//     </div>


//     {/* Resources */}
//     <div className="space-y-3">
//       <h4 className="text-sm font-semibold text-white">Builder Moves</h4>
//       <ul className="space-y-3 text-sm">
//         <li>
//           <Link href="/sign-in" className="group flex items-center gap-3 hover:text-blue-400 transition-colors">
//             <FaGithub className="text-blue-400 group-hover:text-blue-300" />
//             Claim your builder stage
//           </Link>
//         </li>
//         <li>
//           <Link href="/explore" className="group flex items-center gap-3 hover:text-blue-400 transition-colors">
//             <FaCompass className="text-blue-400 group-hover:text-blue-300" />
//             Discover shipped stories
//           </Link>
//         </li>
//         <li>
//           <Link href="/p/create" className="group flex items-center gap-3 hover:text-blue-400 transition-colors">
//             <FaPenNib className="text-blue-400 group-hover:text-blue-300" />
//             Turn code into a story
//           </Link>
//         </li>
//         <li>
//           <Link href="/dashboard" className="group flex items-center gap-3 hover:text-blue-400 transition-colors">
//             <FaUserCog className="text-blue-400 group-hover:text-blue-300" />
//             Shape your public dev page
//           </Link>
//         </li>
//       </ul>
//     </div>

//     {/* Social + CTA */}
//     <div className="space-y-4 flex flex-col items-start md:items-end">
      
//       <div className="flex gap-5 border-b p-2 border-b-blue-400 text-sm font-medium">
//         <Link href="https://x.com" className="hover:text-blue-400"><FaXTwitter size={20}/></Link>
//         <Link href="https://github.com/mky62/devnarrate" className="hover:text-blue-400"> <FaGithub  size={20}/> </Link>
//       </div>

//       <Button className="text-sm px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 transition">
//         Start writing →
//       </Button>

//       <p className="text-xs text-white text-right">
//         Built for developers who ship stories, not just code.
//       </p>
//     </div>
//   </div>

//   {/* Bottom bar */}
//   <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
//     <p>© {new Date().getFullYear()} dev.narrate</p>
//     <div className="flex gap-2 text-md">
//       made with <FaHeart color="red"/> <Link className="underline underline-offset-2 decoration-blue-500" href={"https://abhishekk-phi.vercel.app/"}> by abhk</Link> 
//  </div>
//   </div>
// </footer>

//     </div>
//   );
// }


import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
import { AuroraText } from "@/components/ui/aurora-text";
import { AnimatedShinyText } from "@/components/ui/anim-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { StackingCard } from "@/components/ui/stacking-scroll";
import { FloatingAscii } from "./components/FloatingAscii";
import BuilderCard, { type BuilderCardData } from "@/app/explore/components/BuilderCard";
import heroBg from "@/public/herobg.jpg";
import {
  GitBranch,
  FileText,
  Globe,
  ArrowRight,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { db } from "@/lib/prisma";
import { Stat } from "./components/Stats";

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

export default async function HomePage() {
  const builders = (await db.user.findMany({
    where: {
      stageName: {
        not: null,
      },
    },
    select: {
      id: true,
      name: true,
      stageName: true,
      image: true,
      description: true,
      repo: {
        select: {
          stars: true,
        },
      },
      _count: {
        select: {
          post: true,
        },
      },
    },
    orderBy: [
      {
        post: {
          _count: "desc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
  })) as BuilderCardData[];

  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-[#1946BD] via-[#2B5AC0] to-[#D5824A] font-montserrat font-light text-white">
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
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
          <FloatingAscii />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <BlurFade delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <AnimatedShinyText className="text-xs font-medium tracking-wide text-white">
                dev.narrate is live
              </AnimatedShinyText>
            </div>
          </BlurFade>

          <BlurFade delay={0.1}>
            <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              Ship stories,{" "}
              <AuroraText
                colors={["#1946BD", "#3C66C7", "#CF5329", "#D5824A"]}
                speed={1.2}
              >
                not just code
              </AuroraText>
            </h1>
          </BlurFade>


          <BlurFade delay={0.3}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/p/create"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white/20 border border-white/30 px-8 text-sm font-semibold text-white transition-all hover:bg-white/30 hover:shadow-[0_0_32px_rgba(255,255,255,0.25)]"
              >
                Start writing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 text-sm font-semibold text-white transition-all hover:bg-[#1946BD] hover:border-white/40"
              >
                Explore stories
              </Link>
            </div>
          </BlurFade>
        </div>

        {/* Hero visual */}
        <BlurFade delay={0.5} className="relative z-10 mt-16 w-full max-w-5xl">
          <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl shadow-[#1946BD]/20">
            <div className="flex items-center gap-2 border-b border-white/20 bg-white/10 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-white/60">project-story.md</span>
            </div>
            <div className="p-6 text-left font-mono text-sm leading-relaxed text-white/80 sm:p-8">
              <p className="text-white/60"># Why I built this</p>
              <p className="mt-2">
                <span className="text-white/90">&gt;</span> The problem was
                simple: recruiters see repos, not reasoning.
              </p>
              <p className="mt-1">
                <span className="text-white/90">&gt;</span> So I built a
                pipeline that turns commit history into architecture diagrams
                and narrative.
              </p>
              <p className="mt-1">
                <span className="text-white/90">&gt;</span> Tradeoffs
                documented. Lessons learned. Shipped in 6 weeks.
              </p>
              <p className="mt-3 text-white/60">## Stack</p>
              <p className="mt-1">Next.js · PostgreSQL · TipTap · OpenAI</p>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent opacity-60" />
          </div>
        </BlurFade>
      </section>

      {/* ========== BUILDERS MARQUEE ========== */}
      <section className="relative border-y border-white/20 bg-white/5 py-10 overflow-hidden">
        <div className="relative">
          {/* Side fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#1946BD]/50 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#D5824A]/50 to-transparent z-10" />

          <BlurFade>
            <p className="text-xs font-medium uppercase tracking-widest text-white/60 text-center mb-6">
              Built for developers who ship
            </p>
          </BlurFade>

          {/* Marquee */}
          {builders.length > 0 && (
            <Marquee className="[--duration:40s]" pauseOnHover>
              {[...builders, ...builders].map((builder, i) => (
                <div
                  key={`${builder.id}-${i}`}
                  className="w-[min(84vw,560px)] shrink-0 px-2 sm:px-4"
                >
                  <BuilderCard builder={builder} />
                </div>
              ))}
            </Marquee>
          )}
        </div>
      </section>

      {/* ========== STACKING FEATURES ========== */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <BlurFade>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Everything you need to{" "}
                <span className="text-white/90">tell your story</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-white/80">
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
                className="p-8 border-white/20 bg-white/10 backdrop-blur-md shadow-lg shadow-[#1946BD]/20"
              >
                <div className="flex items-start gap-6">
                  <div className="shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white">
                    <f.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {f.title}
                    </h3>
                    <p className="text-base leading-relaxed text-white/80">
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
      <section className="relative py-24 sm:py-32 bg-white/5">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <BlurFade>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                How it works
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-white/80">
                Three steps from raw repo to published story.
              </p>
            </div>
          </BlurFade>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <BlurFade key={step.number} delay={0.1 + i * 0.15}>
                <div className="relative">
                  <span className="text-5xl font-bold text-white/20">
                    {step.number}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">
                    {step.description}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ========== LIVE STATS ========== */}
      <Stat />

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-white/20 bg-white/5">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src="/icon.svg"
                alt="dev.narrate icon"
                width={28}
                height={28}
                className="h-7 w-7 rounded-md"
              />
              <span className="text-lg font-semibold tracking-tight text-white">
                dev<span className="text-white/90">.</span>narrate
              </span>
            </div>

            <nav className="flex gap-8 text-sm text-white/80">
              <Link href="/explore" className="transition-colors hover:text-white">
                Explore
              </Link>
              <Link href="/p/create" className="transition-colors hover:text-white">
                Create
              </Link>
              <Link href="/docs" className="transition-colors hover:text-white">
                Docs
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/mky62/devnarrate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 transition-colors hover:text-white"
              >
                <FaGithub className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-white/60">
            &copy; {new Date().getFullYear()} dev.narrate. Built for developers who ship stories.
          </div>
        </div>
      </footer>
    </main>
  )
};
