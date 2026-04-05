"use client"

import React from "react"
import RotatingText from "@/app/(auth)/components/RotatingText"

export default function Header() {
  return (
    <header className="relative h-16 w-full border border-white rounded-b-full backdrop-blur-sm">
      
      {/* Container */}
      <div className="flex items-center h-full px-4">
        
        {/* LEFT SECTION */}
        <div className="flex items-center z-10">
          {/* Example: Logo */}
          {/* <span className="font-bold">Logo</span> */}
        </div>

        {/* CENTER SECTION */}
<div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
  <h1 className="flex items-center gap-4 font-grape text-lg font-bold whitespace-nowrap font-saira tracking-[-0.02em]" suppressHydrationWarning>
    <span>Explore with</span>

    <span
      className="inline-flex items-center h-[36px] overflow-hidden"
      suppressHydrationWarning={true} 
    >
      <RotatingText
        texts={[
          "developer",
          "builder",
          "creator",
          "vibe coder",
          "contributor",
          "innovator",
          "engineer",
        ]}
        mainClassName="inline-flex capitalize text-2xl text-blue-500 font-bold leading-none"
        staggerFrom="last"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-120%" }}
        staggerDuration={0.065}
        splitLevelClassName="overflow-hidden"
        transition={{
          type: "spring",
          damping: 60,
          stiffness: 600,
        }}
        rotationInterval={3000}
      />
    </span>
  </h1>
</div>
       

        {/* RIGHT SECTION */}
        <div className="flex items-center ml-auto gap-3 z-10">
          {/* Example: Actions */}
          {/* <button className="text-sm">Login</button> */}
        </div>
      </div>
    </header>
  )
}