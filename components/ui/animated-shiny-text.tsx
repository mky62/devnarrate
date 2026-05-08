import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FC,
} from "react";

import { cn } from "@/lib/utils";

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-slate-500",
        "animate-shiny-text bg-[length:var(--shiny-width)_100%] bg-clip-text bg-[position:0_0] bg-no-repeat",
        "bg-gradient-to-r from-transparent via-blue-600/80 via-50% to-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
