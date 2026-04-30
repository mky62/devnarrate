import React from "react";

export default function Title({ title, description, align = "left" }: { title: React.ReactNode, description: string, align: string }) {
  return (
    <div
      className={`
        max-w-xl space-y-6
        ${align === "center" ? "text-center mx-auto" : "text-left"}
      `}
    >
      <h1 className="
        text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
        font-arimo  tracking-tight
        leading-tight
        text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]
      ">
        {title}
      </h1>

      {description && (
        <p className="
          text-sm sm:text-base md:text-lg
          leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]
        ">
          {description}
        </p>
      )}
    </div>
  );
}
