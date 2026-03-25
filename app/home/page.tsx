"use client";

import Navbar from "./components/Navbar";
import Image from "next/image";
import HeroBg from "@/public/herobg.jpg";
import CodeS from "@/public/codeimg.svg";
import Title from "./components/Title";
import Stat from "./components/Stats";
import Pill from "./components/Pill";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="h-full w-full relative text-white p-20">

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

      {/* Hero section */}
      <div className="h-[100vh] max-w-7xl mx-auto flex rounded-4xl justify-between items-center px-6 relative z-10 bg-amber-200">
        {/* Left content */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
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
            <Button size="lg" className="text-white bg-blue-500">
              Get Started
            </Button>
          </div>
        </div>

        {/* Right image */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center">
          <Image
            src={CodeS}
            alt="Developer img"
            width={500}
            height={500}
            className="object-contain w-full max-w-sm"
            priority
          />
        </div>
      </div>



    </div>
  );
}