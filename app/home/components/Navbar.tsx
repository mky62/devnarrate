"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SearchBar from "./Searchbar";
import { FaGithub } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import { useSession } from "@/lib/auth-client";

export default function Navbar() {
    const [dropOpen, setDropOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const mobileRef = useRef<HTMLDivElement>(null);

    const { data: session } = useSession();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setDropOpen(false);
            }
            if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
                setMobileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="pointer-events-none fixed top-0 left-0 right-0 z-40 flex justify-center px-3 md:px-4 pt-3 md:pt-5">
            <header className="pointer-events-auto w-full max-w-4xl rounded-2xl border border-white/[0.07] bg-gradient-to-br from-green-200 to-blue-200 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="flex h-[48px] md:h-[52px] items-center justify-between px-3 md:px-4">

                    {/* Logo */}
                    <Link href="/">
                        <h1 className="text-base md:text-lg font-arimo tracking-tight text-blue-600" >
                            dev<span className="text-blue-900 text-xl md:text-xl">.</span>narrate
                        </h1>
                    </Link>

                    {/* Desktop SearchBar */}
                    <div className="hidden md:flex">
                        <SearchBar />
                    </div>

                    {/* Right side - Desktop */}
                    <div className="hidden md:flex items-center gap-1.5">

                      {!session ? (
                        <Link
                            href="/sign-in"
                            className="inline-flex h-8 items-center gap-2 bg-gradient-to-t from-blue-500 to-blue-600 px-4 rounded-sm px-3.5 text-[13px] font-semibold sm:text-sm text-gray/50 transition-colors hover:text-blue-900/90"
                        >
                            sign in with <FaGithub /> <MdArrowOutward />
                        </Link>) :
                        (<Link
                            href="/dashboard"
                            className="inline-flex h-8 items-center gap-2 bg-gradient-to-t from-blue-500 to-blue-600 px-4 rounded-sm px-3.5 text-[13px] font-semibold sm:text-sm text-gray/50 transition-colors hover:text-blue-900/90"
                        >
                            dashboard <MdArrowOutward />
                        </Link>)}

                    </div>

                    {/* Hamburger button - Mobile */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.08] text-white/70 transition-colors"
                    >
                        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            {mobileOpen ? (
                                <path d="M18 6 6 18M6 6l12 12" />
                            ) : (
                                <path d="M4 12h16M4 6h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div ref={mobileRef} className="md:hidden border-t border-white/[0.07] p-3 space-y-3">
                        <SearchBar />
                        <div className="flex flex-col gap-2">
                            {!session ? (
                                <Link
                                    href="/sign-up"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex h-9 items-center justify-center gap-2 bg-gradient-to-t from-blue-500 to-blue-600 rounded-lg text-sm font-semibold text-white/50 transition-colors hover:text-blue-900/90"
                                >
                                    sign in with <FaGithub /> <MdArrowOutward />
                                </Link>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex h-9 items-center justify-center gap-2 bg-gradient-to-t from-blue-500 to-blue-600 rounded-lg text-sm font-semibold text-white/50 transition-colors hover:text-blue-900/90"
                                >
                                    dashboard <MdArrowOutward />
                                </Link>
                            )}
                            {/* <Link
                                href="/blog"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/90"
                            >
                                <svg className="size-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                                Blog
                            </Link>
                            <Link
                                href="/policy"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/90"
                            >
                                <svg className="size-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                Policy
                            </Link> */}
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
