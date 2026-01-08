"use client";
import { forwardRef, useCallback } from "react"

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

import {
  TEXT_ALIGN_SHORTCUT_KEYS,
  useTextAlign,
} from "@/components/tiptap-ui/text-align-button"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

export function TextAlignShortcutBadge({
  align,
  shortcutKeys = TEXT_ALIGN_SHORTCUT_KEYS[align]
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for setting text alignment in a Tiptap editor.
 *
 * For custom button implementations, use the `useTextAlign` hook instead.
 */
export const TextAlignButton = forwardRef((
  {
    editor: providedEditor,
    align,
    text,
    hideWhenUnavailable = false,
    onAligned,
    showShortcut = false,
    onClick,
    icon: CustomIcon,
    children,
    ...buttonProps
  },
  ref
) => {
  const { editor } = useTiptapEditor(providedEditor)
  const {
    isVisible,
    handleTextAlign,
    label,
    canAlign,
    isActive,
    Icon,
    shortcutKeys,
  } = useTextAlign({
    editor,
    align,
    hideWhenUnavailable,
    onAligned,
  })

  const handleClick = useCallback((event) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    handleTextAlign()
  }, [handleTextAlign, onClick])

  if (!isVisible) {
    return null
  }

  const RenderIcon = CustomIcon ?? Icon

  return (
    <Button
      type="button"
      disabled={!canAlign}
      data-style="ghost"
      data-active-state={isActive ? "on" : "off"}
      data-disabled={!canAlign}
      role="button"
      tabIndex={-1}
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
      onClick={handleClick}
      {...buttonProps}
      ref={ref}>
      {children ?? (
        <>
          <RenderIcon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && (
            <TextAlignShortcutBadge align={align} shortcutKeys={shortcutKeys} />
          )}
        </>
      )}
    </Button>
  );
})

TextAlignButton.displayName = "TextAlignButton"
