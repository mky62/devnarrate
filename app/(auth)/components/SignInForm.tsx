"use client"

import { useState } from "react"
import RotatingText from "./RotatingText"
import Image from "next/image"
import AuthBg from "@/public/dashbg.jpg"
import { FaGithub } from "react-icons/fa"
import Link from "next/link"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/packages/tiptap/components/ui/button"
import { Particles } from "@/components/ui/particles"


export default function SignInForm() {
    const [isSigningIn, setIsSigningIn] = useState(false)

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        if (isSigningIn) return

        setIsSigningIn(true)

        try {
            await signIn.social(
                {
                    provider: "github",
                    callbackURL: "/dashboard",
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
        <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-black/30">
          
            <Image
                src={AuthBg}
                alt="Authentication background"
                fill
                priority
                sizes="100vw"
                className="absolute inset-0 -z-20 object-cover"
            />

              <Particles
               className="absolute inset-0" />



            {/* Main Panel */}
            <div className="relative z-10 bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl m-6 sm:m-8 px-8 py-12 sm:px-10 sm:py-14 space-y-12 w-full max-w-lg">
                {/* Header */}
                <div className="text-center space-y-5">
                    <h1 className="text-4xl font-geom tracking-[-2px] text-white drop-shadow-sm">
                        dev.narrate
                    </h1>

                    <p className="text-xl text-white/90 flex justify-center items-center gap-2">
                        Welcome back ✨
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
                                mainClassName="inline-flex text-2xl text-white font-courgette font-bold overflow-hidden"
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

                {/* GitHub Button */}
                <Button
                    type="button"
                    onClick={handleClick}
                    disabled={isSigningIn}
                    className="w-full py-7 cursor-pointer bg-[#234edc] hover:bg-black active:scale-[0.98] text-white flex items-center justify-center gap-3 text-xl font-semibold rounded-2xl transition-all duration-200 shadow-xl shadow-black/30"
                >
                    <FaGithub className="text-3xl" />
                    {isSigningIn ? "Redirecting to GitHub..." : "Sign in with GitHub"}
                </Button>

                {/* Footer */}
                <p className="text-center text-sm font-light text-white/70">
                    Be part of the{" "}
                    <span className="font-semibold underline-offset-4 hover:text-white transition-colors cursor-pointer text-white/90">
                        <Link href="/" className="underline">dev.narrate</Link>
                    </span>{" "}
                    community
                </p>
            </div>
        </div>
    )
}
