import { useCallback, useEffect, useState } from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { isMarkInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils"

// --- Icons ---
import { BoldIcon } from "@/components/tiptap-icons/bold-icon"
import { Code2Icon } from "@/components/tiptap-icons/code2-icon"
import { ItalicIcon } from "@/components/tiptap-icons/italic-icon"
import { StrikeIcon } from "@/components/tiptap-icons/strike-icon"
import { SubscriptIcon } from "@/components/tiptap-icons/subscript-icon"
import { SuperscriptIcon } from "@/components/tiptap-icons/superscript-icon"
import { UnderlineIcon } from "@/components/tiptap-icons/underline-icon";

export const markIcons = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikeIcon,
  code: Code2Icon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon,
}

export const MARK_SHORTCUT_KEYS = {
  bold: "mod+b",
  italic: "mod+i",
  underline: "mod+u",
  strike: "mod+shift+s",
  code: "mod+e",
  superscript: "mod+.",
  subscript: "mod+,",
}

/**
 * Checks if a mark can be toggled in the current editor state
 */
export function canToggleMark(editor, type) {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema(type, editor) || isNodeTypeSelected(editor, ["image"]))
    return false

  return editor.can().toggleMark(type);
}

/**
 * Checks if a mark is currently active
 */
export function isMarkActive(editor, type) {
  if (!editor || !editor.isEditable) return false
  return editor.isActive(type);
}

/**
 * Toggles a mark in the editor
 */
export function toggleMark(editor, type) {
  if (!editor || !editor.isEditable) return false
  if (!canToggleMark(editor, type)) return false

  return editor.chain().focus().toggleMark(type).run();
}

/**
 * Determines if the mark button should be shown
 */
export function shouldShowButton(props) {
  const { editor, type, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema(type, editor)) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleMark(editor, type);
  }

  return true
}

/**
 * Gets the formatted mark name
 */
export function getFormattedMarkName(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Custom hook that provides mark functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MySimpleBoldButton() {
 *   const { isVisible, handleMark } = useMark({ type: "bold" })
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleMark}>Bold</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedItalicButton() {
 *   const { isVisible, handleMark, label, isActive } = useMark({
 *     editor: myEditor,
 *     type: "italic",
 *     hideWhenUnavailable: true,
 *     onToggled: () => console.log('Mark toggled!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleMark}
 *       aria-pressed={isActive}
 *       aria-label={label}
 *     >
 *       Italic
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useMark(config) {
  const {
    editor: providedEditor,
    type,
    hideWhenUnavailable = false,
    onToggled,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = useState(true)
  const canToggle = canToggleMark(editor, type)
  const isActive = isMarkActive(editor, type)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, type, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    };
  }, [editor, type, hideWhenUnavailable])

  const handleMark = useCallback(() => {
    if (!editor) return false

    const success = toggleMark(editor, type)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, type, onToggled])

  return {
    isVisible,
    isActive,
    handleMark,
    canToggle,
    label: getFormattedMarkName(type),
    shortcutKeys: MARK_SHORTCUT_KEYS[type],
    Icon: markIcons[type],
  };
}
