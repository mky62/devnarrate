"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type SearchResult = {
    stageName: string;
    username: string;
    avatarUrl: string | null;
    description: string | null;
    _count: { repos: number };
};


export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const cleanup = () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };

        const fetchUsers = async () => {
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
                if (res.ok) setResults((await res.json()).users ?? []);
            } catch { /* ignore */ } finally {
                setLoading(false);
            }
        };

        cleanup();
        if (query.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(fetchUsers, 300);
        return cleanup;
    }, [query]);

    return (

        <div className="relative mx-auto w-full max-w-sm">
            <div
                className={`
      relative rounded-xl  shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)]
      ${open && query.trim().length >= 2 ? "rounded-b-none border-b-0" : ""}
    `}
            >
                <div className="flex items-center gap-3 px-5 h-8">

                    {/* Search Icon */}
                    <svg
                        className="size-4 shrink-0 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>

                    {/* Input */}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                        placeholder="Search builders..."
                        className="
          w-full bg-transparent
          text-base sm:text-sm
          outline-none
          placeholder:text-muted-foreground/60
        "
                    />

                    {/* Loader */}
                    {loading && (
                        <svg
                            className="size-5 animate-spin text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {open && query.trim().length >= 2 && (
                <div
                    className="
        absolute left-0 right-0 z-50
        rounded-b-2xl border border-t-0
        border-white/10
        bg-white/80 dark:bg-blue-900/40
        backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.15)]
        overflow-hidden
      "
                >
                    {results.length === 0 && !loading ? (
                        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                            No developers found for “{query}”
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto py-2">
                            {results.map((user) => (
                                <button
                                    key={user.stageName}
                                    type="button"
                                    onMouseDown={() => router.push(`/${user.stageName}`)}
                                    className="
                flex w-full items-center gap-4
                px-5 py-3 text-left
                transition-all
                hover:bg-black/5 dark:hover:bg-white/5
              "
                                >
                                    <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                                        {user.avatarUrl ? (
                                            <Image
                                                src={user.avatarUrl}
                                                alt={user.stageName}
                                                fill
                                                sizes="40px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-sm font-bold text-muted-foreground">
                                                {user.stageName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-semibold">
                                            {user.stageName}
                                        </div>
                                        <div className="truncate text-sm text-muted-foreground">
                                            @{user.username} · {user._count.repos} repositories
                                        </div>
                                    </div>

                                    <svg
                                        className="size-4 text-muted-foreground"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

        // <div className="relative mx-auto w-[100px] h-12">
        //     <div className={`relative rounded-2xl bg-card border shadow-2xl shadow-black/10 transition-all duration-200 ${open && query.trim().length >= 2 ? "rounded-b-none border-b-0" : ""}`}>
        //         <div className="flex items-center gap-3 px-5 py-4">
        //             <svg className="size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        //                 <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        //             </svg>
        //             <input
        //                 type="text"
        //                 value={query}
        //                 onChange={(e) => setQuery(e.target.value)}
        //                 onFocus={() => setOpen(true)}
        //                 onBlur={() => setTimeout(() => setOpen(false), 150)}
        //                 placeholder="Search by username or stage name…"
        //                 className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/50 sm:text-lg"
        //             />
        //             {loading && (
        //                 <svg className="size-5 shrink-0 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        //                     <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
        //                 </svg>
        //             )}
        //         </div>
        //     </div>

        //     {/* Dropdown */}
        //     {open && query.trim().length >= 2 && (
        //         <div className="absolute left-0 right-0 z-50 overflow-hidden rounded-b-2xl border border-t-0 bg-card shadow-2xl shadow-black/10">
        //             {results.length === 0 && !loading ? (
        //                 <div className="px-5 py-8 text-center">
        //                     <p className="text-sm text-muted-foreground">No developers found for &ldquo;{query}&rdquo;</p>
        //                 </div>
        //             ) : (
        //                 <div className="max-h-72 overflow-y-auto py-2">
        //                     {results.map((user) => (
        //                         <button
        //                             key={user.stageName}
        //                             type="button"
        //                             onMouseDown={() => router.push(`/${user.stageName}`)}
        //                             className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-accent"
        //                         >
        //                             <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-muted">
        //                                 {user.avatarUrl ? (
        //                                     <Image src={user.avatarUrl} alt={user.stageName} fill sizes="40px" className="object-cover" />
        //                                 ) : (
        //                                     <div className="flex size-full items-center justify-center text-sm font-bold text-muted-foreground">
        //                                         {user.stageName.charAt(0).toUpperCase()}
        //                                     </div>
        //                                 )}
        //                             </div>
        //                             <div className="min-w-0 flex-1">
        //                                 <div className="truncate font-semibold">{user.stageName}</div>
        //                                 <div className="truncate text-sm text-muted-foreground">
        //                                     @{user.username} · {user._count.repos} repositories
        //                                 </div>
        //                             </div>
        //                             <svg className="size-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        //                                 <path d="M5 12h14M12 5l7 7-7 7" />
        //                             </svg>
        //                         </button>
        //                     ))}
        //                 </div>
        //             )}
        //         </div>
        //     )}
        // </div>

    )
}