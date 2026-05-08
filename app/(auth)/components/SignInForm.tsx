"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { FaGithub } from "react-icons/fa"
import Link from "next/link"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/packages/tiptap/components/ui/button"

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
                    disableRedirect: false,
                },
                {
                    onError: (ctx) => {
                        console.error("Sign in error:", ctx)
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
            {/* Animated background shapes */}
            <motion.div
                className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl"
                animate={{
                    x: [0, 30, 0],
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-20 right-10 w-96 h-96 bg-white/15 rounded-full blur-3xl"
                animate={{
                    x: [0, -20, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Link href="/" className="inline-block group">
                        <motion.h1
                            className="text-2xl font-semibold tracking-tight text-white"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            dev.narrate
                        </motion.h1>
                    </Link>
                </motion.div>

                {/* Card */}
                <motion.div
                    className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg shadow-[#1946BD]/20 p-8"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                >
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        <h2 className="text-lg font-medium text-white mb-2">
                            Welcome back
                        </h2>
                        <p className="text-sm text-white/80">
                            Sign in to continue to your dashboard
                        </p>
                    </motion.div>

                    {/* GitHub Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <button
                            type="button"
                            onClick={handleClick}
                            disabled={isSigningIn}
                            className="w-full py-3 bg-white/20 hover:bg-[#1946BD] border border-white/30 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <motion.span
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                            />
                            {isSigningIn ? (
                                <motion.span
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <motion.span
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Connecting...
                                </motion.span>
                            ) : (
                                <>
                                    <FaGithub className="text-xl" />
                                    <span>Continue with GitHub</span>
                                </>
                            )}
                        </button>
                    </motion.div>

                    <motion.p
                        className="text-center text-xs text-white/60 mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        By signing in, you agree to our terms of service
                    </motion.p>
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-sm text-white/80 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                >
                    New to dev.narrate?{" "}
                    <Link
                        href="/"
                        className="text-white font-medium hover:underline inline-block transition-transform hover:translate-x-0.5"
                    >
                        Learn more
                    </Link>
                </motion.p>
            </div>
        </div>
    )
}
