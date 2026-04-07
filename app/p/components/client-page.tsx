"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/packages/tiptap/components/ui/button"
import Link from "next/link";
import { ArrowLeft, Loader } from 'lucide-react';
import { useSession } from "@/lib/auth-client";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { TextStyle, FontSize } from '@tiptap/extension-text-style'


// --- UI Primitives ---
import {
    Toolbar,
    ToolbarGroup,
    ToolbarSeparator,
} from "@/packages/tiptap/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/packages/tiptap/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/packages/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/packages/tiptap/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/packages/tiptap/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/packages/tiptap/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/packages/tiptap/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/packages/tiptap/components/tiptap-ui/code-block-button"
import { ColorHighlightPopover } from "@/packages/tiptap/components/tiptap-ui/color-highlight-popover"
import { LinkPopover } from "@/packages/tiptap/components/tiptap-ui/link-popover"
import { MarkButton } from "@/packages/tiptap/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/packages/tiptap/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/packages/tiptap/components/tiptap-ui/undo-redo-button"
import { FontSizeDropdown } from "@/packages/tiptap/components/tiptap-ui/font-size-dropdown"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

const getSessionStorageItem = (key: string) => {
    if (typeof window === "undefined") {
        return null
    }

    return window.sessionStorage.getItem(key)
}

const setSessionStorageItem = (key: string, value: string) => {
    if (typeof window === "undefined") {
        return
    }

    window.sessionStorage.setItem(key, value)
}

const removeSessionStorageItem = (key: string) => {
    if (typeof window === "undefined") {
        return
    }

    window.sessionStorage.removeItem(key)
}

export default function ClientPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession()
    const [title, setTitle] = useState("")
    const [link, setLink] = useState("")
    const [loading, setLoading] = useState(false)
    const [draftLoaded, setDraftLoaded] = useState(false)
    const [savedContent, setSavedContent] = useState<string | null>(null)

    const toolbarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setTitle(getSessionStorageItem("title") ?? "")
        setLink(getSessionStorageItem("link") ?? "")
        setSavedContent(getSessionStorageItem("content"))
        setDraftLoaded(true)
    }, [])

    useEffect(() => {
        if (!draftLoaded) return
        setSessionStorageItem("title", title)
    }, [draftLoaded, title])

    useEffect(() => {
        if (!draftLoaded) return
        setSessionStorageItem("link", link)
    }, [draftLoaded, link])

    const editor = useEditor({
        immediatelyRender: false,
        content: "",
        editorProps: {
            attributes: {
                autocomplete: "off",
                autocorrect: "off",
                autocapitalize: "off",
                "aria-label": "Main content area, start typing to enter text.",
                class: "simple-editor min-h-[50vh] outline-none",
            },
        },
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
                },
            }),
            HorizontalRule,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Image,
            TextStyle,
            FontSize,
            Typography,
            Superscript,
            Subscript,
            Selection,
            ImageUploadNode.configure({
                accept: "image/*",
                maxSize: MAX_FILE_SIZE,
                limit: 3,
                upload: handleImageUpload,
                onError: (error) => console.error("Upload failed:", error),
            }),
        ],
    })

    useEffect(() => {
        if (!editor) return
        if (!savedContent) return

        try {
            editor.commands.setContent(JSON.parse(savedContent))
        } catch (error) {
            console.error("Failed to restore draft content:", error)
        }
    }, [editor, savedContent])

    useEffect(() => {
        if (!editor) return
        if (!draftLoaded) return

        const updateHandler = () => {
            setSessionStorageItem("content", JSON.stringify(editor.getJSON()))
        }
        editor.on("update", updateHandler)
        return () => { editor.off("update", updateHandler) }
    }, [draftLoaded, editor])

    if (isPending || !session) {
        return <div className="flex items-center justify-center h-screen"><Loader /></div>
    }

    const handlePost = async () => {
        if (!editor) return
        setLoading(true)
        try {
            const content = editor.getJSON()
            const res = await fetch('/api/saveposts', {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ title, link, content })
            })
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || `Failed to create post (${res.status})`)
            }
            const data = await res.json()
            if (data.success) {
                removeSessionStorageItem("title")
                removeSessionStorageItem("link")
                removeSessionStorageItem("content")
                router.push("/dashboard")
            }
        } catch (err) {
            console.error(err)
            alert(err instanceof Error ? err.message : "Failed to create post")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Top Header Bar */}
            <header className="sticky top-0 z-50 bg-background border-b border-border/40">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
                    {/* Left: Back */}
                    <button className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Link href="/dashboard">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </button>

                    {/* Center: Toolbar */}
                    <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar">
                        <EditorContext.Provider value={{ editor }}>
                            <Toolbar ref={toolbarRef} variant="floating" className="border-0 shadow-none bg-transparent">
                                <ToolbarGroup>
                                    <UndoRedoButton action="undo" />
                                    <UndoRedoButton action="redo" />
                                </ToolbarGroup>
                                <ToolbarSeparator />
                                <ToolbarGroup>
                                    <HeadingDropdownMenu modal={false} levels={[1, 2, 3]} />
                                    <ListDropdownMenu modal={false} types={["bulletList", "orderedList", "taskList"]} />
                                    <BlockquoteButton />
                                    <CodeBlockButton />
                                    <FontSizeDropdown />
                                </ToolbarGroup>
                                <ToolbarSeparator />
                                <ToolbarGroup>
                                    <MarkButton type="bold" />
                                    <MarkButton type="italic" />
                                    <MarkButton type="strike" />
                                    <ColorHighlightPopover/>
                                    <LinkPopover />
                                </ToolbarGroup>
                                <ToolbarSeparator />
                                <ToolbarGroup>
                                    <TextAlignButton align="left" />
                                    <TextAlignButton align="center" />
                                    <TextAlignButton align="right" />
                                </ToolbarGroup>
                                <ToolbarSeparator />
                                <ToolbarGroup>
                                    <ImageUploadButton />
                                </ToolbarGroup>
                            </Toolbar>
                        </EditorContext.Provider>
                    </div>

                    {/* Right: Publish */}
                    <Button
                        onClick={handlePost}
                        disabled={loading || !title}
                        className="rounded-full px-5 bg-primary text-primary-foreground font-medium shadow-sm hover:shadow-md transition-all text-sm"
                    >
                        {loading ? <Loader className="w-4 h-4" /> : "Publish"}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-8 py-8">
                {/* Title & Link */}
                <div className="mb-8 space-y-3">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Your Title..."
                        className="w-full bg-transparent text-3xl md:text-4xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/30 border-none focus:outline-none focus:ring-0 leading-tight"
                    />
                    <input
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Paste Link..."
                        className="w-full bg-transparent text-base font-medium text-muted-foreground placeholder:text-muted-foreground/40 border-none focus:outline-none focus:ring-0"
                    />
                </div>

                {/* Editor */}
                <EditorContext.Provider value={{ editor }}>
                    <EditorContent
                        editor={editor}
                        className="prose prose-lg dark:prose-invert max-w-none focus:outline-none"
                    />
                </EditorContext.Provider>
            </main>
        </div>
    )
}
