import React from 'react'

export default function Stat() {
    return (
        <div className="w-full p-12 bg-amber-400/20 text-white flex items-center justify-center gap-4">
            <div className="flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">100+</span>
                <span className="text-sm">Developers</span>
            </div>
            <div className="flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">100+</span>
                <span className="text-sm">Articles</span>
            </div>
            <div className="flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">100+</span>
                <span className="text-sm">Articles</span>
            </div>
        </div>
    )
}