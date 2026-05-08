"use client"

import { motion } from "motion/react";

const asciiChars = [
  { char: "{ }", delay: 0 },
  { char: "</>", delay: 0.5 },
  { char: ">>>", delay: 1 },
  { char: "///", delay: 1.5 },
  { char: "***", delay: 2 },
  { char: "<<<", delay: 2.5 },
  { char: "(()", delay: 3 },
  { char: "[]", delay: 3.5 },
  { char: ":::", delay: 4 },
  { char: "###", delay: 4.5 },
  { char: "///", delay: 5 },
  { char: "???", delay: 5.5 },
  { char: "&&&", delay: 6 },
  { char: "%%%", delay: 6.5 },
  { char: "@@@", delay: 7 },
  { char: "$$$", delay: 7.5 },
  { char: "^^^", delay: 8 },
  { char: "///", delay: 8.5 },
  { char: "<<<", delay: 9 },
  { char: ">>>", delay: 9.5 },
];

function AsciiItem({ char, delay, left }: { char: string; delay: number; left: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{
        opacity: [0, 0.6, 0.4, 0.6, 0],
        y: [0, -200, -400, -600, -800],
        x: [0, 40, -20, 50, 0],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
      className="absolute font-mono text-xl sm:text-2xl font-bold text-white/50 whitespace-nowrap"
      style={{
        left: `${left}%`,
        top: "50%",
      }}
    >
      {char}
    </motion.div>
  );
}

function CodeBlock() {
  const codeLines = [
    "function ship() {",
    "  return story;",
    "}",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{
        opacity: [0, 0.7, 0],
        x: [0, 150],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-sm text-white/40 p-4 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm"
      style={{ top: "35%", left: "5%" }}
    >
      {codeLines.map((line, i) => (
        <div key={i} className="whitespace-nowrap">{line}</div>
      ))}
    </motion.div>
  );
}

function CodeBlock2() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{
        opacity: [0, 0.6, 0],
        x: [0, -150],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        delay: 5,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-xs text-white/30 p-3 rounded-lg bg-white/5 border border-white/10"
      style={{ top: "50%", right: "5%" }}
    >
      <div>const dev = true;</div>
      <div>const ship = true;</div>
    </motion.div>
  );
}

function CodeBlock3() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{
        opacity: [0, 0.5, 0],
        y: [0, 100],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        delay: 8,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-xs text-white/35 p-2 rounded bg-white/5"
      style={{ top: "70%", left: "20%" }}
    >
      &gt; npm run ship
    </motion.div>
  );
}

function Snippet1() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: [0, 0.5, 0],
        y: [-50, -150],
      }}
      transition={{
        duration: 14,
        repeat: Infinity,
        delay: 2,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-xs text-white/30 p-2 rounded bg-white/5"
      style={{ top: "45%", left: "30%" }}
    >
      async function fetch() {'{'}
    </motion.div>
  );
}

function Snippet2() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{
        opacity: [0, 0.4, 0],
        x: [50, 100],
      }}
      transition={{
        duration: 16,
        repeat: Infinity,
        delay: 6,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-xs text-white/35 p-2 rounded bg-white/5"
      style={{ top: "30%", right: "30%" }}
    >
      return await Promise
    </motion.div>
  );
}

function Snippet3() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0, 0.45, 0],
        scale: [0.8, 1.1],
      }}
      transition={{
        duration: 11,
        repeat: Infinity,
        delay: 10,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-xs text-white/30 p-2 rounded bg-white/5"
      style={{ top: "65%", left: "50%" }}
    >
      {'{'}...story{'}'}
    </motion.div>
  );
}

function Snippet4() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{
        opacity: [0, 0.5, 0],
        y: [30, 120],
      }}
      transition={{
        duration: 13,
        repeat: Infinity,
        delay: 4,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-xs text-white/35 p-2 rounded bg-white/5"
      style={{ top: "55%", right: "25%" }}
    >
      console.log(narrative)
    </motion.div>
  );
}

function Snippet5() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{
        opacity: [0, 0.4, 0],
        x: [-30, -80],
      }}
      transition={{
        duration: 17,
        repeat: Infinity,
        delay: 7,
        ease: "easeInOut",
      }}
      className="absolute font-mono text-xs text-white/30 p-2 rounded bg-white/5"
      style={{ top: "40%", left: "15%" }}
    >
      import {'{'} story {'}'}
    </motion.div>
  );
}

function BranchIcon() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0.5, 1.2, 0.5],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute text-5xl text-white/40 font-bold"
      style={{ top: "25%", right: "20%" }}
    >
      ⌘
    </motion.div>
  );
}

function StarIcon() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: [0, 0.6, 0],
        y: [-100, -200],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute text-3xl text-white/40"
      style={{ top: "60%", right: "10%" }}
    >
      ★
    </motion.div>
  );
}

export function FloatingAscii() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      <CodeBlock />
      <CodeBlock2 />
      <CodeBlock3 />
      <Snippet1 />
      <Snippet2 />
      <Snippet3 />
      <Snippet4 />
      <Snippet5 />
      <BranchIcon />
      <StarIcon />
      {asciiChars.map((item, i) => (
        <AsciiItem key={i} char={item.char} delay={item.delay} left={15 + (i * 70 / asciiChars.length)} />
      ))}
    </div>
  );
}
