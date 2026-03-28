"use client"

import { forwardRef, useCallback, useState } from "react"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type { UseFontSizeDropdownConfig } from "@/packages/tiptap/components/tiptap-ui/font-size-dropdown"
import {
  useFontSizeDropdown,
  FONT_SIZES,
} from "@/packages/tiptap/components/tiptap-ui/font-size-dropdown"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

export interface FontSizeDropdownMenuProps
  extends Omit<ButtonProps, "type">,
  UseFontSizeDropdownConfig {
  onOpenChange?: (isOpen: boolean) => void
  modal?: boolean
}

function getDisplayLabel(size: string | undefined): string {
  if (!size) return "A"
  return size.replace("px", "")
}

export const FontSizeDropdownMenu = forwardRef<
  HTMLButtonElement,
  FontSizeDropdownMenuProps
>(
  (
    {
      editor: providedEditor,
      sizes = FONT_SIZES,
      hideWhenUnavailable = false,
      onOpenChange,
      children,
      modal = true,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { isVisible, activeSize, setFontSize, unsetFontSize } =
      useFontSizeDropdown({
        editor,
        sizes,
        hideWhenUnavailable,
      })

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!editor) return
        setIsOpen(open)
        onOpenChange?.(open)
      },
      [editor, onOpenChange]
    )

    if (!isVisible) {
      return null
    }

    return (
      <DropdownMenu modal={modal} open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            data-active-state={activeSize ? "on" : "off"}
            role="button"
            tabIndex={-1}
            aria-label="Font size"
            tooltip="Font Size"
            {...buttonProps}
            ref={ref}
          >
            {children ? (
              children
            ) : (
              <>
                <span className="tiptap-button-text text-xs font-medium min-w-[2ch] text-center">
                  {getDisplayLabel(activeSize)}
                </span>
                <ChevronDownIcon className="tiptap-button-dropdown-small" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="tiptap-button w-full justify-start"
                data-style={!activeSize ? "default" : undefined}
                onClick={() => unsetFontSize()}
              >
                <span className="text-xs">Default</span>
              </button>
            </DropdownMenuItem>
            {sizes.map((size) => {
              const px = parseInt(size, 10)
              const previewSize = Math.min(24, Math.max(12, px * 0.6))
              return (
                <DropdownMenuItem key={`fontsize-${size}`} asChild>
                  <button
                    type="button"
                    className="tiptap-button w-full justify-start gap-2"
                    data-active-state={activeSize === size ? "on" : "off"}
                    onClick={() => setFontSize(size)}
                  >
                    <span
                      className="inline-block text-center font-medium"
                      style={{ fontSize: `${previewSize}px`, minWidth: "1.5em" }}
                    >
                      A
                    </span>
                    <span className="text-xs text-muted-foreground">{size}</span>
                  </button>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

FontSizeDropdownMenu.displayName = "FontSizeDropdownMenu"

export default FontSizeDropdownMenu
