"use client"

import React, { useEffect, useState } from "react"
import RotatingText from "@/app/(auth)/components/RotatingText"

export default function Header() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="relative h-16 w-full border border-white rounded-b-full backdrop-blur-sm">
      <div className="flex items-center h-full px-4">
        <div className="flex items-center z-10" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-2xl  text-black flex  font-grape  justify-center items-center gap-2">
                      Explore  <span className="m-2">✨</span> 
                        <span className="inline-flex items-center">
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
                                mainClassName="inline-flex text-2xl text-blue-500  overflow-hidden"
                                staggerFrom="last"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "-120%" }}
                                staggerDuration={0.065}
                                splitLevelClassName="overflow-hidden"
                                transition={{ type: "spring", damping: 60, stiffness: 600 }}
                                rotationInterval={3000}
                            />
                        </span>
                    </p>
        </div>

        <div className="flex items-center ml-auto gap-3 z-10" />
      </div>
    </header>
  )
}