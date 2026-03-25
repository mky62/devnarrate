"use client"

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import { MenuBar } from './Menubar'

const Tiptap = () => {
    const editor = useEditor({
        extensions: [
            StarterKit, Heading.configure({
                levels: [1, 2, 3],
            }),
        ],
        content: `<h2>Hi there,</h2>`,
        immediatelyRender: false,
    })

    return (
        <div className="w-full max-w-4xl rounded-lg border border-border bg-background shadow-md overflow-hidden">
            <MenuBar editor={editor} />
            <div className="prose prose-neutral dark:prose-invert max-w-none p-6 min-h-[300px] focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[260px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

export default Tiptap