"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/packages/tiptap/components/ui/button"
import Link from "next/link";
import { ArrowLeft, Loader, Moon, Sparkles, Sun } from 'lucide-react';
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
import AIPanel from "./AIPanel"
import { clearEditorDraft, useEditorDraft } from "@/hooks/use-editor-draft"

const getEditorThemePreference = () => {
    if (typeof window === "undefined") {
        return false
    }

    const savedTheme = window.localStorage.getItem("editor-theme")
    if (savedTheme === "dark") return true
    if (savedTheme === "light") return false

    return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export default function ClientPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession()
    const [loading, setLoading] = useState(false)
    const [showAIPanel, setShowAIPanel] = useState(false)
    const [isEditorDarkMode, setIsEditorDarkMode] = useState(getEditorThemePreference)

    const toolbarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (typeof window === "undefined") return

        window.localStorage.setItem("editor-theme", isEditorDarkMode ? "dark" : "light")
    }, [isEditorDarkMode])

    useEffect(() => {
        if (typeof document === "undefined") return

        const hadDarkClass = document.body.classList.contains("dark")
        document.body.classList.toggle("dark", isEditorDarkMode)

        return () => {
            document.body.classList.toggle("dark", hadDarkClass)
        }
    }, [isEditorDarkMode])

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
    const { title, setTitle, link, setLink } = useEditorDraft(editor)

    if (isPending || !session) {
        return <div className="flex items-center bg-sky-200/40 justify-center h-screen"><Loader className="animate-spin text-blue-700 text-xl" /></div>
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
                clearEditorDraft()
                router.push("/dashboard")
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            alert(err instanceof Error ? err.message : "Failed to create post")
        } finally {
            setLoading(false)
        }
    }

    const handleAIInsert = (content: string) => {
        if (!editor) return
        editor.commands.insertContent(content)
        setShowAIPanel(false)
    }

    return (
        <div
            data-editor-theme={isEditorDarkMode ? "dark" : "light"}
            className={`min-h-screen bg-background text-foreground flex flex-col font-sans ${isEditorDarkMode ? "dark" : ""}`}
        >
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

                    {/* Right: Theme + Publish */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowAIPanel((show) => !show)}
                            aria-label={showAIPanel ? "Close AI panel" : "Open AI panel"}
                            title={showAIPanel ? "Close AI panel" : "Open AI panel"}
                            className={`rounded-full transition-colors ${
                                showAIPanel
                                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Sparkles className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditorDarkMode((isDark) => !isDark)}
                            aria-label={`Switch editor to ${isEditorDarkMode ? "light" : "dark"} mode`}
                            title={`Switch editor to ${isEditorDarkMode ? "light" : "dark"} mode`}
                            className="rounded-full text-muted-foreground hover:text-foreground"
                        >
                            {isEditorDarkMode ? (
                                <Sun className="w-4 h-4" />
                            ) : (
                                <Moon className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            onClick={handlePost}
                            disabled={loading || !title}
                            className="rounded-full px-5 bg-primary text-primary-foreground font-medium shadow-sm hover:shadow-md transition-all text-sm"
                        >
                            {loading ? <Loader className="w-4 h-4" /> : "Publish"}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor Content */}
                <main className={`flex-1 overflow-y-auto transition-all duration-300 ${showAIPanel ? 'mr-0' : ''}`}>
                    <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-8">
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
                    </div>
                </main>

                {/* AI Panel */}
                {showAIPanel && (
                    <AIPanel
                        onInsert={handleAIInsert}
                        onClose={() => setShowAIPanel(false)}
                    />
                )}
            </div>
        </div>
    )
}
