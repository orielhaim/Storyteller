import { forwardRef } from "react"
import "@/components/tiptap-ui-primitive/badge/badge-colors.scss"
import "@/components/tiptap-ui-primitive/badge/badge-group.scss"
import "@/components/tiptap-ui-primitive/badge/badge.scss"

export const Badge = forwardRef((
  {
    variant,
    size = "default",
    appearance = "default",
    trimText = false,
    className,
    children,
    ...props
  },
  ref
) => {
  return (
    <div
      ref={ref}
      className={`tiptap-badge ${className || ""}`}
      data-style={variant}
      data-size={size}
      data-appearance={appearance}
      data-text-trim={trimText ? "on" : "off"}
      {...props}>
      {children}
    </div>
  );
})

Badge.displayName = "Badge"

export default Badge
