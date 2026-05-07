"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SearchBar from "./Searchbar";
import { MdArrowOutward } from "react-icons/md";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/packages/tiptap/components/ui/button";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const mobileRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const isClickingToggle = useRef(false);
    const [session, setSession] = useState<any>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        authClient.getSession().then(({ data, error }) => {
            setSession(data?.session);
            setIsPending(false);
        }).catch(() => {
            setIsPending(false);
        });
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (isClickingToggle.current) {
                isClickingToggle.current = false;
                return;
            }
            if (mobileRef.current && !mobileRef.current.contains(e.target as Node) && 
                toggleRef.current && !toggleRef.current.contains(e.target as Node)) {
                setMobileOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const toggleMenu = () => {
        isClickingToggle.current = true;
        setMobileOpen(v => !v);
    };

    return (
        <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
            <header className="pointer-events-auto w-full max-w-4xl rounded-2xl bg-gradient-to-r from-[#1946BD] to-[#D5824A] backdrop-blur-md shadow-lg shadow-[#1946BD]/20 relative">
                <div className="flex h-16 items-center justify-between px-6">

                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <h1 className="text-xl font-semibold tracking-tight text-white">
                            dev<span className="text-white/90">.</span>narrate
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex-1 max-w-md">
                            <SearchBar size="small" />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {!isPending && !session ? (
                                <Link
                                    href="/sign-in"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-[#1946BD] border border-white/20 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                                >
                                    Get Started <MdArrowOutward className="w-4 h-4" />
                                </Link>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                                >
                                    Dashboard <MdArrowOutward className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        ref={toggleRef}
                        type="button"
                        onClick={toggleMenu}
                        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <div ref={mobileRef} className="md:hidden absolute top-full left-0 right-0 mx-4 mt-2 py-4 space-y-4 border-t border-white/20 rounded-xl bg-[#1946BD] shadow-lg">
                        <div className="px-4">
                            <SearchBar size="small" />
                        </div>
                        <div className="flex flex-col gap-3 px-4">
                            {!isPending && !session ? (
                                <Link
                                    href="/sign-in"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all"
                                >
                                    Get Started <MdArrowOutward className="w-4 h-4" />
                                </Link>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all"
                                >
                                    Dashboard <MdArrowOutward className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}
