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
        bg-gradient-to-b from-gray-600 to-gray-800
        bg-clip-text text-transparent
      ">
        {title}
      </h1>

      {description && (
        <p className="
          text-sm sm:text-base md:text-lg
          leading-relaxed
           bg-gradient-to-r from-green-600 to-blue-600
           bg-clip-text text-transparent
        ">
          {description}
        </p>
      )}
    </div>
  );
}