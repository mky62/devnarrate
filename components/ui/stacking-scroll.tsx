"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface StackingCardProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  totalCards: number;
}

export function StackingCard({
  children,
  className,
  index,
  totalCards,
}: StackingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1, 0.95 - index * 0.02]
  );

  const opacity = useTransform(scrollYProgress, [0.5, 1], [1, 0.6]);

  const topOffset = index * 20;

  return (
    <motion.div
      ref={cardRef}
      style={{
        scale,
        opacity,
        top: `${topOffset}px`,
        zIndex: totalCards - index,
      }}
      className={cn(
        "sticky w-full rounded-3xl border border-slate-200 bg-white shadow-xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface StackingScrollProps {
  children: React.ReactNode[];
  className?: string;
  cardClassName?: string;
}

export function StackingScroll({
  children,
  className,
  cardClassName,
}: StackingScrollProps) {
  return (
    <div className={cn("relative", className)}>
      {children.map((child, index) => (
        <StackingCard
          key={index}
          index={index}
          totalCards={children.length}
          className={cardClassName}
        >
          {child}
        </StackingCard>
      ))}
    </div>
  );
}
