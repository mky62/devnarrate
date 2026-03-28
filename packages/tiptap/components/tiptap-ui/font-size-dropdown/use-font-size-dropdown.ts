"use client"

import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

export const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "30px",
  "36px",
  "48px",
  "60px",
  "72px",
] as const

export type FontSize = (typeof FONT_SIZES)[number]

export interface UseFontSizeDropdownConfig {
  editor?: Editor | null
  sizes?: readonly string[]
  hideWhenUnavailable?: boolean
}

export function getActiveFontSize(
  editor: Editor | null
): string | undefined {
  if (!editor || !editor.isEditable) return undefined
  const attrs = editor.getAttributes("textStyle")
  return attrs.fontSize as string | undefined
}

export function useFontSizeDropdown(config?: UseFontSizeDropdownConfig) {
  const {
    editor: providedEditor,
    sizes = FONT_SIZES,
    hideWhenUnavailable = false,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = useState(true)
  const [activeSize, setActiveSize] = useState<string | undefined>(() =>
    getActiveFontSize(editor)
  )

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      setActiveSize(getActiveFontSize(editor))
    }

    const handleSelectionUpdate = () => {
      if (hideWhenUnavailable) {
        const canSet = (editor.can() as any).setFontSize?.("16px")
        setIsVisible(canSet ?? true)
      }
    }

    handleUpdate()
    handleSelectionUpdate()

    editor.on("update", handleUpdate)
    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("update", handleUpdate)
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const setFontSize = (size: string) => {
    if (!editor) return
    const chain = editor.chain().focus() as any
    chain.setFontSize(size).run()
  }

  const unsetFontSize = () => {
    if (!editor) return
    const chain = editor.chain().focus() as any
    chain.unsetFontSize().run()
  }

  return {
    isVisible,
    activeSize,
    sizes,
    setFontSize,
    unsetFontSize,
    label: "Font Size",
  }
}
