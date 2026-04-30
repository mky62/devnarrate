import Header from "./components/Header";
import Image from "next/image";
import ExploreBg from "@/public/explorebg.jpg";
import { Particles } from "@/components/ui/particles";
import { db } from "@/lib/prisma";
import { UserRound } from "lucide-react";
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
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      <Header />

      <div className="fixed inset-0 -z-20">
        <Image
          src={ExploreBg}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none fixed left-0 top-0 z-[-5] h-full w-16 bg-gradient-to-r from-black/40 via-black/10 to-transparent backdrop-blur-sm" />
      <div className="pointer-events-none fixed right-0 top-0 z-[-5] h-full w-16 bg-gradient-to-l from-black/40 via-black/10 to-transparent backdrop-blur-sm" />
      <Particles className="absolute inset-0 z-0" />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-14 pt-8 sm:px-6 lg:px-8">


        {builders.length === 0 ? (
          <section className="flex min-h-[360px] items-center justify-center rounded-3xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-md">
            <div className="max-w-sm space-y-4">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-200">
                <UserRound size={26} />
              </div>
              <h2 className="text-2xl font-semibold text-white">No public builders yet.</h2>
              <p className="text-sm leading-6 text-white/60">
                Users will appear here after they set a stage name on their profile.
              </p>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {builders.map((builder) => (
              <BuilderCard key={builder.id} builder={builder} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
