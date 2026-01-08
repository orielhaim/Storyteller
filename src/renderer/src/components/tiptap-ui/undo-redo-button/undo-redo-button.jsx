"use client";
import { forwardRef, useCallback } from "react"

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

import {
  UNDO_REDO_SHORTCUT_KEYS,
  useUndoRedo,
} from "@/components/tiptap-ui/undo-redo-button"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

export function HistoryShortcutBadge({
  action,
  shortcutKeys = UNDO_REDO_SHORTCUT_KEYS[action]
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for triggering undo/redo actions in a Tiptap editor.
 *
 * For custom button implementations, use the `useHistory` hook instead.
 */
export const UndoRedoButton = forwardRef((
  {
    editor: providedEditor,
    action,
    text,
    hideWhenUnavailable = false,
    onExecuted,
    showShortcut = false,
    onClick,
    children,
    ...buttonProps
  },
  ref
) => {
  const { editor } = useTiptapEditor(providedEditor)
  const { isVisible, handleAction, label, canExecute, Icon, shortcutKeys } =
    useUndoRedo({
      editor,
      action,
      hideWhenUnavailable,
      onExecuted,
    })

  const handleClick = useCallback((event) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    handleAction()
  }, [handleAction, onClick])

  if (!isVisible) {
    return null
  }

  return (
    <Button
      type="button"
      disabled={!canExecute}
      data-style="ghost"
      data-disabled={!canExecute}
      role="button"
      tabIndex={-1}
      aria-label={label}
      tooltip={label}
      onClick={handleClick}
      {...buttonProps}
      ref={ref}>
      {children ?? (
        <>
          <Icon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && (
            <HistoryShortcutBadge action={action} shortcutKeys={shortcutKeys} />
          )}
        </>
      )}
    </Button>
  );
})

UndoRedoButton.displayName = "UndoRedoButton"
