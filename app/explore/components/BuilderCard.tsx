"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, type MouseEvent, type ReactNode, useRef } from "react";
import { BookOpenText, Code2, Star } from "lucide-react";
import UserCommitCount from "./UserCommitCount";

export type BuilderCardData = {
  id: string;
  name: string;
  stageName: string;
  image: string | null;
  description: string | null;
  repo: {
    stars: number;
  }[];
  _count: {
    post: number;
  };
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

type CardVars = CSSProperties & {
  "--rx": string;
  "--ry": string;
  "--mx": string;
  "--my": string;
  "--shadow": string;
};

export default function BuilderCard({ builder }: { builder: BuilderCardData }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const totalStars = builder.repo.reduce((sum, repo) => sum + repo.stars, 0);
  const displayName = builder.stageName || builder.name;

  const handleMouseMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 14;
    const rotateY = (x - 0.5) * 18;

    card.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    card.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
    card.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);
    card.style.setProperty("--shadow", "0 28px 70px rgba(30, 64, 175, 0.38)");
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "50%");
    card.style.setProperty("--shadow", "0 0 0 rgba(30, 64, 175, 0)");
  };

  return (
    <Link
      ref={cardRef}
      href={`/${builder.stageName}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--rx": "0deg",
          "--ry": "0deg",
          "--mx": "50%",
          "--my": "50%",
          "--shadow": "0 0 0 rgba(30, 64, 175, 0)",
          transform:
            "perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)) translateY(-4px)",
          boxShadow: "var(--shadow)",
        } as CardVars
      }
      className="group relative grid min-h-[132px] grid-cols-1 gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out [transform-style:preserve-3d] hover:border-blue-300/35 hover:bg-white/15 md:grid-cols-[minmax(0,1fr)_270px] md:items-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at var(--mx) var(--my), rgba(96,165,250,0.26), transparent 34%)",
          transform: "translateZ(1px)",
        }}
      />

      <div className="relative flex min-w-0 items-center gap-4 transition duration-300 [transform:translateZ(34px)]">
        <div className="shrink-0">
          {builder.image ? (
            <Image
              src={builder.image}
              alt={displayName}
              width={52}
              height={52}
              className="size-[52px] rounded-2xl object-cover ring-1 ring-white/15"
              unoptimized
            />
          ) : (
            <div className="flex size-[52px] items-center justify-center rounded-2xl bg-blue-500 text-lg font-semibold text-white ring-1 ring-white/15">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="truncate text-xl font-semibold tracking-tight text-white group-hover:text-blue-200">
              {displayName}
            </h2>
            <p className="truncate text-sm text-blue-100/70">@{builder.stageName}</p>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/62">
            {builder.description || "Building in public and turning shipped code into a readable developer profile."}
          </p>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-2 border-t border-white/10 pt-4 transition duration-300 [transform:translateZ(42px)] md:border-l md:border-t-0 md:pl-4 md:pt-0">
        <StatPill
          icon={<Star size={16} />}
          label="Stars"
          value={formatNumber(totalStars)}
        />
        <StatPill
          icon={<Code2 size={16} />}
          label="Commits"
          value={<UserCommitCount stageName={builder.stageName} />}
        />
        <StatPill
          icon={<BookOpenText size={16} />}
          label="Posts"
          value={formatNumber(builder._count.post)}
        />
      </div>
    </Link>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-black/25 p-2.5 text-center">
      <div className="mb-1.5 flex justify-center text-blue-200">{icon}</div>
      <p className="text-base font-semibold leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/42">
        {label}
      </p>
    </div>
  );
}
