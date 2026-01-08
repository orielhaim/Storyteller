import { forwardRef, useCallback } from "react"

import {
  BLOCKQUOTE_SHORTCUT_KEY,
  useBlockquote,
} from "@/components/tiptap-ui/blockquote-button"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

export function BlockquoteShortcutBadge({
  shortcutKeys = BLOCKQUOTE_SHORTCUT_KEY
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling blockquote in a Tiptap editor.
 *
 * For custom button implementations, use the `useBlockquote` hook instead.
 */
export const BlockquoteButton = forwardRef((
  {
    editor: providedEditor,
    text,
    hideWhenUnavailable = false,
    onToggled,
    showShortcut = false,
    onClick,
    children,
    ...buttonProps
  },
  ref
) => {
  const { editor } = useTiptapEditor(providedEditor)
  const {
    isVisible,
    canToggle,
    isActive,
    handleToggle,
    label,
    shortcutKeys,
    Icon,
  } = useBlockquote({
    editor,
    hideWhenUnavailable,
    onToggled,
  })

  const handleClick = useCallback((event) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    handleToggle()
  }, [handleToggle, onClick])

  if (!isVisible) {
    return null
  }

  return (
    <Button
      type="button"
      data-style="ghost"
      data-active-state={isActive ? "on" : "off"}
      role="button"
      tabIndex={-1}
      disabled={!canToggle}
      data-disabled={!canToggle}
      aria-label={label}
      aria-pressed={isActive}
      tooltip="Blockquote"
      onClick={handleClick}
      {...buttonProps}
      ref={ref}>
      {children ?? (
        <>
          <Icon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && (
            <BlockquoteShortcutBadge shortcutKeys={shortcutKeys} />
          )}
        </>
      )}
    </Button>
  );
})

BlockquoteButton.displayName = "BlockquoteButton"
