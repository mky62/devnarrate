"use client";

import { useState, useEffect, type ComponentPropsWithoutRef, type FC } from "react";

import { cn } from "@/lib/utils";

export interface RotatingTextProps extends ComponentPropsWithoutRef<"span"> {
  words: string[];
  duration?: number;
  colors?: string[];
  speed?: number;
}

export const RotatingText: FC<RotatingTextProps> = ({
  words,
  duration = 2500,
  colors = ["#1946BD", "#3C66C7", "#CF5329", "#D5824A"],
  speed = 1.2,
  className,
  ...rest
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  // Guard against empty words array
  if (words.length === 0) {
    return null;
  }

  const gradientStyle = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animationDuration: `${10 / speed}s`,
  };

  return (
    <span className={cn("relative inline-block", className)} {...rest}>
      <span
        key={index}
        className="animate-aurora relative bg-[length:200%_auto] bg-clip-text text-transparent"
        style={gradientStyle}
      >
        {words[index]}
      </span>
    </span>
  );
};