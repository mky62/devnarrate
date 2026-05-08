// "use client"

// import { useState } from "react"
// import RotatingText from "./RotatingText"
// import Image from "next/image"
// import AuthBg from "@/public/dashbg.jpg"
// import { FaGithub } from "react-icons/fa"
// import Link from "next/link"
// import { signIn } from "@/lib/auth-client"
// import { Button } from "@/packages/tiptap/components/ui/button"
// import { Particles } from "@/components/ui/particles"


// interface SignInFormProps {
//     callbackURL: string
// }

// export default function SignInForm({ callbackURL }: SignInFormProps) {
//     const [isSigningIn, setIsSigningIn] = useState(false)

//     const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
//         event.preventDefault()
//         if (isSigningIn) return

//         setIsSigningIn(true)

//         try {
//             await signIn.social(
//                 {
//                     provider: "github",
//                     callbackURL,
//                 },
//                 {
//                     onError() {
//                         setIsSigningIn(false)
//                     },
//                 }
//             )
//         } catch (error) {
//             console.error("GitHub sign-in failed:", error)
//             setIsSigningIn(false)
//         }
//     }

//     return (
//         <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-black/30">
          
//             <Image
//                 src={AuthBg}
//                 alt="Authentication background"
//                 fill
//                 priority
//                 sizes="100vw"
//                 className="absolute inset-0 -z-20 object-cover"
//             />

//               <Particles
//                className="absolute inset-0" />



//             {/* Main Panel */}
//             <div className="relative z-10 bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl m-6 sm:m-8 px-8 py-12 sm:px-10 sm:py-14 space-y-12 w-full max-w-lg">
//                 {/* Header */}
//                 <div className="text-center space-y-5">
//                     <h1 className="text-4xl font-geom tracking-[-2px] text-white drop-shadow-sm">
//                         dev.narrate
//                     </h1>

//                     <p className="text-md md:text-xl text-white/90 flex justify-center items-center gap-2">
//                         Welcome back ✨
//                         <span className="inline-flex items-center">
//                             <RotatingText
//                                 texts={[
//                                     "developer",
//                                     "builder",
//                                     "creator",
//                                     "vibe coder",
//                                     "contributor",
//                                     "innovator",
//                                     "engineer",
//                                 ]}
//                                 mainClassName="inline-flex text-base md:text-2xl text-white font-courgette font-bold overflow-hidden"
//                                 staggerFrom="last"
//                                 initial={{ y: "100%" }}
//                                 animate={{ y: 0 }}
//                                 exit={{ y: "-120%" }}
//                                 staggerDuration={0.065}
//                                 splitLevelClassName="overflow-hidden"
//                                 transition={{ type: "spring", damping: 60, stiffness: 600 }}
//                                 rotationInterval={3000}
//                             />
//                         </span>
//                     </p>
//                 </div>

//                 {/* GitHub Button */}
//                 <Button
//                     type="button"
//                     onClick={handleClick}
//                     disabled={isSigningIn}
//                     className="github-signin-button relative isolate w-full overflow-hidden py-7 cursor-pointer bg-[#234edc] hover:bg-[#1140d9] active:scale-[0.98] text-white flex items-center justify-center gap-3 text-xl font-semibold rounded-2xl transition-all duration-900 shadow-xl shadow-black/30"
//                 >
//                     {!isSigningIn && <span aria-hidden="true" className="github-signin-glare" />}
//                     <FaGithub className="relative z-10 text-3xl" />
//                     <span className="relative z-10">
//                         {isSigningIn ? "Redirecting to GitHub..." : "Sign in with GitHub"}
//                     </span>
//                 </Button>

//                 {/* Footer */}
//                 <p className="text-center text-sm font-light text-white/70">
//                     Be part of the{" "}
//                     <span className="font-semibold underline-offset-4 hover:text-white transition-colors cursor-pointer text-white/90">
//                         <Link href="/" className="underline hover:text-[#234edc]">dev.narrate</Link>
//                     </span>{" "}
//                     community
//                 </p>
//             </div>
//         </div>
//     )
// }


"use client"

import { useState } from "react"
import { motion } from "motion/react"
import RotatingText from "./RotatingText"
import Image from "next/image"
import { FaGithub } from "react-icons/fa"
import Link from "next/link"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/packages/tiptap/components/ui/button"
import { Particles } from "@/components/ui/particles"

interface SignInFormProps {
  callbackURL: string
}

export default function SignInForm({ callbackURL }: SignInFormProps) {
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (isSigningIn) return

    setIsSigningIn(true)

    try {
      await signIn.social(
        {
          provider: "github",
          callbackURL,
        },
        {
          onError() {
            setIsSigningIn(false)
          },
        }
      )
    } catch (error) {
      console.error("GitHub sign-in failed:", error)
      setIsSigningIn(false)
    }
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-[#1946BD] via-[#2B5AC0] to-[#D5824A] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 bg-black/30 -z-20" />

      {/* Particles */}
      <Particles className="absolute inset-0 -z-10" />

      {/* Animated blobs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main panel */}
      <motion.div
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl px-8 py-10 sm:px-10 sm:py-12"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-geom tracking-[-1.5px] text-white">
              dev.narrate
            </h1>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-8 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <h2 className="text-lg font-medium text-white">Welcome back</h2>

          <p className="text-sm md:text-base text-white/80 flex justify-center items-center gap-2 flex-wrap">
            Continue as
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
                mainClassName="inline-flex text-sm md:text-lg text-white font-courgette font-bold overflow-hidden"
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
          </p>
        </motion.div>

        {/* GitHub Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Button
            type="button"
            onClick={handleClick}
            disabled={isSigningIn}
            className="w-full py-6 bg-white/15 hover:bg-[#1946BD] border border-white/30 text-white font-medium rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {!isSigningIn && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}

            {isSigningIn ? (
              <span className="flex items-center gap-3 relative z-10">
                <motion.span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                Redirecting to GitHub...
              </span>
            ) : (
              <>
                <FaGithub className="relative z-10 text-xl" />
                <span className="relative z-10">Sign in with GitHub</span>
              </>
            )}
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-sm text-white/70 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          Be part of the{" "}
          <Link
            href="/"
            className="text-white font-medium underline underline-offset-4 hover:text-[#1946BD] transition-colors"
          >
            dev.narrate
          </Link>{" "}
          community
        </motion.p>
      </motion.div>
    </div>
  )
}