"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import Navbar from "./components/Navbar";
import Image from "next/image";
import HeroBg from "@/public/dashbg.jpg";
import CodeS from "@/public/codeimg.svg";
import Title from "./components/Title";
import Stat from "./components/Stats";
import Pill from "./components/Pill";
import { Button } from "@/packages/tiptap/components/ui/button";

export default function HomePage() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenisRef.current?.destroy();
    };
  }, []);
  return (
    <div className="h-full w-full relative text-white p-4 md:p-10 lg:p-20">

      {/* Fixed background image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src={HeroBg}
          alt="Hero Background"
          fill
          className="object-cover opacity-80"
          priority
        />
      </div>

      <Navbar />

      {/* Hero section - Redesigned with glassmorphic card for modern contrast while keeping the exact same dark/blue theme */}
      <div className="h-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center p-4 md:p-8 m-4 rounded-4xl bg-blue-400/20 relative z-10">
        
        {/* Glassmorphic content card (left side) - clean, modern redesign */}
        <div className="w-full flex flex-col gap-6 rounded-3xl p-6 md:p-10 lg:p-12 shadow-[0_0_20px_0_rgba(74,222,128,0.2),0_0_40px_0_rgba(59,130,246,0.15)] shadow-green-600/20 shadow-blue-600/20">
          <Pill pill={"for developers"} />
          <Title
            title={
              <>
                explain what you built,{" "}
                <span className="text-blue-400 italic">not just</span> show the{" "}
                <span className="underline decoration-blue-400 wavy decoration-2 underline-offset-4">
                  code
                </span>
              </>
            }
            description="Link your GitHub repos and write rich articles explaining architecture, decisions, and lessons. A storytelling layer on top of your code."
            align=""
          />
          <div className="flex gap-4">
            <Button size="lg" className="text-white bg-blue-500 hover:bg-blue-600 transition-colors">
              Get Started
            </Button>
          </div>
        </div>

        {/* Right image - slightly enhanced with deeper shadow for better pop */}
        <div className="w-full md:w-1/2 flex items-center justify-center mt-6 md:mt-0">
          <Image
            src={CodeS}
            alt="Developer img"
            width={500}
            height={500}
            className="object-contain w-full max-w-[250px] md:max-w-sm drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* New section after hero - Community stats & impact (kept 100% relevant to the core theme: developers explaining their code, GitHub storytelling, real builder impact) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <Pill pill={"community impact"} />
          <Title
            title={
              <>
                Real developers,{" "}
                <span className="text-blue-400">real stories</span>
              </>
            }
            description="Thousands of GitHub repos already linked. Architecture explained. Lessons shared. Careers advanced."
            align="center"
          />
        </div>

        {/* Using the already-imported Stat component (perfectly on-theme) */}
        <Stat />
      </div>

      {/* Footer - clean, modern, fully on-theme with glassmorphic touch and relevant developer focus */}
      <footer className="max-w-7xl rounded-2xl bg-black/60 mx-auto px-4 md:px-8 py-8 md:py-16 border-t border-white/10 relative z-10 mt-8 md:mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-white/70">
          
          {/* Left - Brand / tagline */}
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <div className="text-2xl md:text-3xl font-semibold tracking-tighter text-blue-400">dev.narrate</div>
            <Pill pill={"beta"} />
            <span className="text-sm text-white/50 hidden md:block">— storytelling for your code</span>
          </div>


          {/* Right - Social + Copyright */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex gap-5 text-white/70 hover:text-white/100 transition-colors text-sm font-medium tracking-tight border-b border-white-200">
              <a href="https://x.com" className="hover:text-blue-400 transition-colors">𝕏</a>
              <a href="https://github.com/mky62/devnarrate" className="hover:text-blue-400 transition-colors">GitHub</a>
            </div>
            <p className="text-xs text-white/70">
              © {new Date().getFullYear()} dev.narrate • Built for developers who ship stories, not just code
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}