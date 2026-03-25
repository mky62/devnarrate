// "use client"

// import type { Editor } from '@tiptap/core'
// import { useEditorState } from '@tiptap/react'

// import {
//     Bold,
//     Italic,
//     Strikethrough,
//     Code,
//     RemoveFormatting,
//     Eraser,
//     Pilcrow,
//     Heading1,
//     Heading2,
//     Heading3,
//     Heading4,
//     Heading5,
//     Heading6,
//     List,
//     ListOrdered,
// } from 'lucide-react'
// import { Toggle } from '@/components/ui/toggle'
// import { Separator } from '@/components/ui/separator'

// export const MenuBar = ({ editor }: { editor: Editor | null }) => {
//     const editorState = useEditorState({
//         editor,
//         selector: (ctx) => {
//             if (!ctx.editor) {
//                 return {
//                     isBold: false,
//                     canBold: false,
//                     isItalic: false,
//                     canItalic: false,
//                     isStrike: false,
//                     canStrike: false,
//                     isCode: false,
//                     canCode: false,
//                     isParagraph: false,
//                     isHeading1: false,
//                     isHeading2: false,
//                     isHeading3: false,
//                     isHeading4: false,
//                     isHeading5: false,
//                     isHeading6: false,
//                     isBulletList: false,
//                     isOrderedList: false,
//                 }
//             }

//             return {
//                 isBold: ctx.editor.isActive('bold'),
//                 canBold: ctx.editor.can().chain().focus().toggleBold().run(),
//                 isItalic: ctx.editor.isActive('italic'),
//                 canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
//                 isStrike: ctx.editor.isActive('strike'),
//                 canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
//                 isCode: ctx.editor.isActive('code'),
//                 canCode: ctx.editor.can().chain().focus().toggleCode().run(),
//                 isParagraph: ctx.editor.isActive('paragraph'),
//                 isHeading1: ctx.editor.isActive('heading', { level: 1 }),
//                 isHeading2: ctx.editor.isActive('heading', { level: 2 }),
//                 isHeading3: ctx.editor.isActive('heading', { level: 3 }),
//                 isHeading4: ctx.editor.isActive('heading', { level: 4 }),
//                 isHeading5: ctx.editor.isActive('heading', { level: 5 }),
//                 isHeading6: ctx.editor.isActive('heading', { level: 6 }),
//                 isBulletList: ctx.editor.isActive('bulletList'),
//                 isOrderedList: ctx.editor.isActive('orderedList'),
//             }
//         },
//     })

//     if (!editor || !editorState) {
//         return null
//     }

//     return (
//         <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5 rounded-t-lg">
//             {/* Text formatting */}
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isBold}
//                 disabled={!editorState.canBold}
//                 onPressedChange={() => editor.chain().focus().toggleBold().run()}
//                 aria-label="Bold"
//             >
//                 <Bold className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isItalic}
//                 disabled={!editorState.canItalic}
//                 onPressedChange={() => editor.chain().focus().toggleItalic().run()}
//                 aria-label="Italic"
//             >
//                 <Italic className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isStrike}
//                 disabled={!editorState.canStrike}
//                 onPressedChange={() => editor.chain().focus().toggleStrike().run()}
//                 aria-label="Strikethrough"
//             >
//                 <Strikethrough className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isCode}
//                 disabled={!editorState.canCode}
//                 onPressedChange={() => editor.chain().focus().toggleCode().run()}
//                 aria-label="Code"
//             >
//                 <Code className="h-4 w-4" />
//             </Toggle>

//             <Separator orientation="vertical" className="mx-1 h-6" />

//             {/* Clear formatting */}
//             <Toggle
//                 size="sm"
//                 pressed={false}
//                 onPressedChange={() => editor.chain().focus().unsetAllMarks().run()}
//                 aria-label="Remove formatting"
//             >
//                 <RemoveFormatting className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={false}
//                 onPressedChange={() => editor.chain().focus().clearNodes().run()}
//                 aria-label="Clear nodes"
//             >
//                 <Eraser className="h-4 w-4" />
//             </Toggle>

//             <Separator orientation="vertical" className="mx-1 h-6" />

//             {/* Block types */}
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isParagraph}
//                 onPressedChange={() => editor.chain().focus().setParagraph().run()}
//                 aria-label="Paragraph"
//             >
//                 <Pilcrow className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isHeading1}
//                 onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
//                 aria-label="Heading 1"
//             >
//                 <Heading1 className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isHeading2}
//                 onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
//                 aria-label="Heading 2"
//             >
//                 <Heading2 className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isHeading3}
//                 onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
//                 aria-label="Heading 3"
//             >
//                 <Heading3 className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isHeading4}
//                 onPressedChange={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
//                 aria-label="Heading 4"
//             >
//                 <Heading4 className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isHeading5}
//                 onPressedChange={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
//                 aria-label="Heading 5"
//             >
//                 <Heading5 className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isHeading6}
//                 onPressedChange={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
//                 aria-label="Heading 6"
//             >
//                 <Heading6 className="h-4 w-4" />
//             </Toggle>

//             <Separator orientation="vertical" className="mx-1 h-6" />

//             {/* Lists */}
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isBulletList}
//                 onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
//                 aria-label="Bullet list"
//             >
//                 <List className="h-4 w-4" />
//             </Toggle>
//             <Toggle
//                 size="sm"
//                 pressed={editorState.isOrderedList}
//                 onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
//                 aria-label="Ordered list"
//             >
//                 <ListOrdered className="h-4 w-4" />
//             </Toggle>
//         </div>
//     )
// }
