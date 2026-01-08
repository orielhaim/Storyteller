import { forwardRef, useCallback, useMemo } from "react"

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

import {
  COLOR_HIGHLIGHT_SHORTCUT_KEY,
  useColorHighlight,
} from "@/components/tiptap-ui/color-highlight-button"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

// --- Styles ---
import "@/components/tiptap-ui/color-highlight-button/color-highlight-button.scss"

export function ColorHighlightShortcutBadge({
  shortcutKeys = COLOR_HIGHLIGHT_SHORTCUT_KEY
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for applying color highlights in a Tiptap editor.
 *
 * Supports two highlighting modes:
 * - "mark": Uses the highlight mark extension (default)
 * - "node": Uses the node background extension
 *
 * For custom button implementations, use the `useColorHighlight` hook instead.
 *
 * @example
 * ```tsx
 * // Mark-based highlighting (default)
 * <ColorHighlightButton highlightColor="yellow" />
 *
 * // Node-based background coloring
 * <ColorHighlightButton
 *   highlightColor="var(--tt-color-highlight-blue)"
 *   mode="node"
 * />
 *
 * // With custom callback
 * <ColorHighlightButton
 *   highlightColor="red"
 *   mode="mark"
 *   onApplied={({ color, mode }) => console.log(`Applied ${color} in ${mode} mode`)}
 * />
 * ```
 */
export const ColorHighlightButton = forwardRef((
  {
    editor: providedEditor,
    highlightColor,
    text,
    hideWhenUnavailable = false,
    mode = "mark",
    onApplied,
    showShortcut = false,
    onClick,
    children,
    style,
    ...buttonProps
  },
  ref
) => {
  const { editor } = useTiptapEditor(providedEditor)
  const {
    isVisible,
    canColorHighlight,
    isActive,
    handleColorHighlight,
    label,
    shortcutKeys,
  } = useColorHighlight({
    editor,
    highlightColor,
    label: text || `Toggle highlight (${highlightColor})`,
    hideWhenUnavailable,
    mode,
    onApplied,
  })

  const handleClick = useCallback((event) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    handleColorHighlight()
  }, [handleColorHighlight, onClick])

  const buttonStyle = useMemo(() =>
    ({
      ...style,
      "--highlight-color": highlightColor
    }), [highlightColor, style])

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
      disabled={!canColorHighlight}
      data-disabled={!canColorHighlight}
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
      onClick={handleClick}
      style={buttonStyle}
      {...buttonProps}
      ref={ref}>
      {children ?? (
        <>
          <span
            className="tiptap-button-highlight"
            style={
              {
                "--highlight-color": highlightColor
              }
            } />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && (
            <ColorHighlightShortcutBadge shortcutKeys={shortcutKeys} />
          )}
        </>
      )}
    </Button>
  );
})

ColorHighlightButton.displayName = "ColorHighlightButton"
