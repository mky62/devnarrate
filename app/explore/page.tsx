import Image from "next/image";
import { BlurFade } from "@/components/ui/blur-fade";
import { AuroraText } from "@/components/ui/aurora-text";
import { RotatingText } from "@/components/ui/rotating-text";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Globe } from "@/components/ui/globe";
import { db } from "@/lib/prisma";
import { UserRound, Sparkles } from "lucide-react";
import SearchBar from "@/app/home/components/Searchbar";
import BuilderCard, { type BuilderCardData } from "./components/BuilderCard";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
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
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#1946BD] via-[#2B5AC0] to-[#D5824A] font-montserrat font-light text-white">

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 py-20 items-center">
          <div className="text-center lg:text-left">
            <BlurFade delay={0}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <AnimatedShinyText className="text-xs font-medium tracking-wide text-white">
                  Discover builders
                </AnimatedShinyText>
              </div>
            </BlurFade>

            <BlurFade delay={0.1}>
              <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl lg:mx-0">
                Explore{" "}
                <RotatingText
                  words={["developer stories", "builder journeys", "coding narratives", "tech tales"]}
                />
              </h1>
            </BlurFade>

            <BlurFade delay={0.3}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 lg:mx-0">
                Discover talented developers sharing their journey, architecture decisions, and the stories behind their code.
              </p>
            </BlurFade>

            <BlurFade delay={0.5}>
              <div className="lg:mx-0 mt-12 max-w-lg">
                <SearchBar />
              </div>
            </BlurFade>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <Globe className="opacity-80" />
          </div>
        </section>

        {/* Builders Grid */}
        <section className="relative py-8">
          {builders.length === 0 ? (
            <BlurFade delay={0.9}>
              <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-md">
                <div className="max-w-sm space-y-6">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/20 text-white">
                    <UserRound size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-2">No builders yet</h2>
                    <p className="text-sm leading-6 text-white/60">
                      Be the first to share your developer story and inspire others with your journey.
                    </p>
                  </div>
                  <button className="mx-auto inline-flex items-center gap-2 rounded-xl bg-white/20 border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/30">
                    <Sparkles className="h-4 w-4" />
                    Start your story
                  </button>
                </div>
              </div>
            </BlurFade>
          ) : (
            <div className="space-y-8">
              <BlurFade delay={0.9}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">Featured Builders</h2>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>Sort by: Stories</span>
                  </div>
                </div>
              </BlurFade>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {builders.map((builder, index) => (
                  <BlurFade key={builder.id} delay={1 + index * 0.1}>
                    <BuilderCard builder={builder} />
                  </BlurFade>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
