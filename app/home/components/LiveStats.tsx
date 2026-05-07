"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "motion/react";
import { BlurFade } from "@/components/ui/blur-fade";

interface StatsData {
  developers: number;
  articles: number;
  repos: number;
}

interface StatItemProps {
  value: number;
  label: string;
  delay: number;
  suffix?: string;
}

function AnimatedNumber({ value, label, delay, suffix = "" }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      // Small delay for stagger effect
      const timeout = setTimeout(() => {
        spring.set(value);
        setHasAnimated(true);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, value, spring, delay, hasAnimated]);

  return (
    <BlurFade delay={delay}>
      <div ref={ref} className="text-center">
        <div className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl flex items-center justify-center gap-1">
          <motion.span>{display}</motion.span>
          {suffix && <span>{suffix}</span>}
        </div>
        <div className="mt-1 text-sm text-slate-500">{label}</div>
      </div>
    </BlurFade>
  );
}

export function LiveStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Fallback to placeholder values while loading
  const displayStats = stats || {
    developers: 100,
    articles: 500,
    repos: 1000,
  };

  const statItems = [
    { value: displayStats.developers, label: "Developers", suffix: "+" },
    { value: displayStats.articles, label: "Stories published", suffix: "+" },
    { value: displayStats.repos, label: "Repositories", suffix: "+" },
    { value: 4.9, label: "User satisfaction", suffix: "/5" },
  ];

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {statItems.map((stat, i) => (
            <AnimatedNumber
              key={stat.label}
              value={stat.value}
              label={stat.label}
              delay={0.05 + i * 0.08}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
