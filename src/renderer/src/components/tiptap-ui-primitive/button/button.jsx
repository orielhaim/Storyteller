import { forwardRef, Fragment, useMemo } from "react"

// --- Tiptap UI Primitive ---
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tiptap-ui-primitive/tooltip"

// --- Lib ---
import { cn, parseShortcutKeys } from "@/lib/tiptap-utils"

import "@/components/tiptap-ui-primitive/button/button-colors.scss"
import "@/components/tiptap-ui-primitive/button/button-group.scss"
import "@/components/tiptap-ui-primitive/button/button.scss"

export const ShortcutDisplay = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div>
      {shortcuts.map((key, index) => (
        <Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </div>
  );
}

export const Button = forwardRef((
  {
    className,
    children,
    tooltip,
    showTooltip = true,
    shortcutKeys,
    "aria-label": ariaLabel,
    ...props
  },
  ref
) => {
  const shortcuts = useMemo(() => parseShortcutKeys({ shortcutKeys }), [shortcutKeys])

  if (!tooltip || !showTooltip) {
    return (
      <button
        className={cn("tiptap-button", className)}
        ref={ref}
        aria-label={ariaLabel}
        {...props}>
        {children}
      </button>
    );
  }

  return (
    <Tooltip delay={200}>
      <TooltipTrigger
        className={cn("tiptap-button", className)}
        ref={ref}
        aria-label={ariaLabel}
        {...props}>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        {tooltip}
        <ShortcutDisplay shortcuts={shortcuts} />
      </TooltipContent>
    </Tooltip>
  );
})

Button.displayName = "Button"

export const ButtonGroup = forwardRef(({ className, children, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("tiptap-button-group", className)}
      data-orientation={orientation}
      role="group"
      {...props}>
      {children}
    </div>
  );
})
ButtonGroup.displayName = "ButtonGroup"

export default Button
