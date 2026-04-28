"use client"

import { useEffect, useState } from "react"

const FRAMES = [
  String.raw`╔══════════════════════════╗
║   C O M I N G   S O O N  ║
║   ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░   ║
╚══════════════════════════╝`,
  String.raw`╔══════════════════════════╗
║   C O M I N G   S O O N  ║
║   ▒ ░ ░ ▒ ░ ░ ▒ ░ ░ ▒ ░   ║
╚══════════════════════════╝`,
  String.raw`╔══════════════════════════╗
║   C O M I N G   S O O N  ║
║   ░ ▓ ░ ░ ▓ ░ ░ ▓ ░ ░ ▓   ║
╚══════════════════════════╝`,
  String.raw`╔══════════════════════════╗
║   C O M I N G   S O O N  ║
║   ░ ░ ▒ ░ ░ ▒ ░ ░ ▒ ░ ░   ║
╚══════════════════════════╝`,
]

export default function AsciiComingSoon() {
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % FRAMES.length)
    }, 220)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-4xl rounded-3xl border border-white/70 bg-white/75 px-6 py-6 shadow-xl shadow-black/5 backdrop-blur-md sm:px-10 sm:py-8">
      <pre className="font-mono text-[clamp(12px,2vw,18px)] leading-6 sm:leading-7 tracking-[0.18em] text-gray-900 whitespace-pre overflow-hidden text-center">
        {FRAMES[frameIndex]}
      </pre>
    </div>
  )
}
