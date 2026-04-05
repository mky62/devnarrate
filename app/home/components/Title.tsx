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
        text-4xl md:text-5xl lg:text-6xl
        font-arimo  tracking-tight
        leading-tight
        bg-gradient-to-b from-gray-600 to-gray-800
        bg-clip-text text-transparent
      ">
        {title}
      </h1>

      {description && (
        <p className="
          text-base md:text-lg
          text-
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