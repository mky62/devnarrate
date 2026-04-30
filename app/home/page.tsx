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
import Link from "next/link";
import { FaCompass, FaGithub, FaHeart, FaPenNib, FaUserCog } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
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
          className="object-cover"
          priority
        />
      </div>

      <Navbar />


      {/* Hero section - Redesigned with glassmorphic card for modern contrast while keeping the exact same dark/blue theme */}
      <div className="max-w-6xl mt-6 mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] items-center gap-6 md:gap-8 p-3 sm:p-4 md:p-8 rounded-3xl md:rounded-4xl bg-blue-400/20 relative z-10 overflow-hidden">
        
        {/* Glassmorphic content card (left side) - clean, modern redesign */}
        <div className="w-full min-w-0 flex flex-col gap-5 sm:gap-6 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-10 lg:p-12 min-h-[360px] sm:min-h-[400px] lg:min-h-[500px] justify-center shadow-[0_0_20px_0_rgba(74,222,128,0.2),0_0_40px_0_rgba(59,130,246,0.15)] shadow-green-600/20 shadow-blue-600/20">
          <Pill pill={"for builders"} />
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
            description="Explore architecture notes, launch stories, tradeoffs, and project writeups from builders turning repos into readable proof of work."
    align=""
          />
          <div className="flex flex-wrap gap-4">
            <Link href='/explore' className="inline-flex items-center justify-center text-white px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors">
             Explore
            </Link>
          </div>
        </div>

        {/* Right image - slightly enhanced with deeper shadow for better pop */}
        <div className="w-full min-w-0 flex items-center justify-center px-2 sm:px-6 lg:px-0">
          <Image
            src={CodeS}
            alt="Developer img"
            width={500}
            height={500}
            className="object-contain w-full max-w-[220px] sm:max-w-[280px] md:max-w-sm lg:max-w-full drop-shadow-2xl"
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
                Real builders,{" "}
                <span className="text-blue-400">real stories</span>
              </>
            }
            description="Link your GitHub repos on platform. Architecture explained. Lessons shared. Careers advanced."
            align="center"
          />
        </div>

        {/* Using the already-imported Stat component (perfectly on-theme) */}
        <Stat />
      </div>

      <footer className="max-w-7xl mx-auto mt-4 rounded-2xl border-t border-white/10 bg-black/60 px-4 py-10 md:px-8 md:py-16 relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-white/70">
    
    {/* Brand */}
    <div className="flex items-start gap-4">
      <Image
        src="/icon.svg"
        alt="dev.narrate icon"
        width={44}
        height={44}
        className="mt-1 rounded-xl shadow-[0_0_18px_rgba(59,130,246,0.28)]"
      />
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl md:text-3xl font-semibold tracking-tighter text-blue-400">
            dev.narrate
          </span>
          <Pill pill={"beta"} />
        </div>
        <p className="text-sm text-white/50 max-w-xs">
          A platform to explain what you built — not just show the code.
        </p>
      </div>
    </div>


    {/* Resources */}
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-white">Builder Moves</h4>
      <ul className="space-y-3 text-sm">
        <li>
          <Link href="/sign-in" className="group flex items-center gap-3 hover:text-blue-400 transition-colors">
            <FaGithub className="text-blue-400 group-hover:text-blue-300" />
            Claim your builder stage
          </Link>
        </li>
        <li>
          <Link href="/explore" className="group flex items-center gap-3 hover:text-blue-400 transition-colors">
            <FaCompass className="text-blue-400 group-hover:text-blue-300" />
            Discover shipped stories
          </Link>
        </li>
        <li>
          <Link href="/p/create" className="group flex items-center gap-3 hover:text-blue-400 transition-colors">
            <FaPenNib className="text-blue-400 group-hover:text-blue-300" />
            Turn code into a story
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="group flex items-center gap-3 hover:text-blue-400 transition-colors">
            <FaUserCog className="text-blue-400 group-hover:text-blue-300" />
            Shape your public dev page
          </Link>
        </li>
      </ul>
    </div>

    {/* Social + CTA */}
    <div className="space-y-4 flex flex-col items-start md:items-end">
      
      <div className="flex gap-5 border-b p-2 border-b-blue-400 text-sm font-medium">
        <Link href="https://x.com" className="hover:text-blue-400"><FaXTwitter size={20}/></Link>
        <Link href="https://github.com/mky62/devnarrate" className="hover:text-blue-400"> <FaGithub  size={20}/> </Link>
      </div>

      <Button className="text-sm px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 transition">
        Start writing →
      </Button>

      <p className="text-xs text-white text-right">
        Built for developers who ship stories, not just code.
      </p>
    </div>
  </div>

  {/* Bottom bar */}
  <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
    <p>© {new Date().getFullYear()} dev.narrate</p>
    <div className="flex gap-2 text-md">
      made with <FaHeart color="red"/> <Link className="underline underline-offset-2 decoration-blue-500" href={"https://abhishekk-phi.vercel.app/"}> by abhk</Link> 
 </div>
  </div>
</footer>

    </div>
  );
}
