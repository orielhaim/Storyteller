import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import "@/components/tiptap-ui-primitive/toolbar/toolbar.scss"
import { cn } from "@/lib/tiptap-utils"
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useComposedRef } from "@/hooks/use-composed-ref"

const useToolbarNavigation = (
  toolbarRef
) => {
  const [items, setItems] = useState([])

  const collectItems = useCallback(() => {
    if (!toolbarRef.current) return []
    return Array.from(toolbarRef.current.querySelectorAll(
      'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])'
    ));
  }, [toolbarRef])

  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const updateItems = () => setItems(collectItems())

    updateItems()
    const observer = new MutationObserver(updateItems)
    observer.observe(toolbar, { childList: true, subtree: true })

    return () => observer.disconnect();
  }, [collectItems, toolbarRef])

  const { selectedIndex } = useMenuNavigation({
    containerRef: toolbarRef,
    items,
    orientation: "horizontal",
    onSelect: (el) => el.click(),
    autoSelectFirstItem: false,
  })

  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const handleFocus = (e) => {
      const target = e.target
      if (toolbar.contains(target))
        target.setAttribute("data-focus-visible", "true")
    }

    const handleBlur = (e) => {
      const target = e.target
      if (toolbar.contains(target)) target.removeAttribute("data-focus-visible")
    }

    toolbar.addEventListener("focus", handleFocus, true)
    toolbar.addEventListener("blur", handleBlur, true)

    return () => {
      toolbar.removeEventListener("focus", handleFocus, true)
      toolbar.removeEventListener("blur", handleBlur, true)
    };
  }, [toolbarRef])

  useEffect(() => {
    if (selectedIndex !== undefined && items[selectedIndex]) {
      items[selectedIndex].focus()
    }
  }, [selectedIndex, items])
}

export const Toolbar = forwardRef(({ children, className, variant = "fixed", ...props }, ref) => {
  const toolbarRef = useRef(null)
  const composedRef = useComposedRef(toolbarRef, ref)
  useToolbarNavigation(toolbarRef)

  return (
    <div
      ref={composedRef}
      role="toolbar"
      aria-label="toolbar"
      data-variant={variant}
      className={cn("tiptap-toolbar", className)}
      {...props}>
      {children}
    </div>
  );
})
Toolbar.displayName = "Toolbar"

export const ToolbarGroup = forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn("tiptap-toolbar-group", className)}
    {...props}>
    {children}
  </div>
))
ToolbarGroup.displayName = "ToolbarGroup"

export const ToolbarSeparator = forwardRef(({ ...props }, ref) => (
  <Separator ref={ref} orientation="vertical" decorative {...props} />
))
ToolbarSeparator.displayName = "ToolbarSeparator"
