"use client";
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  useState,
  version,
} from "react"
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useMergeRefs,
  FloatingPortal,
  FloatingDelayGroup,
} from "@floating-ui/react";
import "@/components/tiptap-ui-primitive/tooltip/tooltip.scss"

function useTooltip({
  initialOpen = false,
  placement = "top",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  delay = 600,
  closeDelay = 0
} = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "start",
        padding: 4,
      }),
      shift({ padding: 4 }),
    ],
  })

  const context = data.context

  const hover = useHover(context, {
    mouseOnly: true,
    move: false,
    restMs: delay,
    enabled: controlledOpen == null,
    delay: {
      close: closeDelay,
    },
  })
  const focus = useFocus(context, {
    enabled: controlledOpen == null,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "tooltip" })

  const interactions = useInteractions([hover, focus, dismiss, role])

  return useMemo(() => ({
    open,
    setOpen,
    ...interactions,
    ...data,
  }), [open, setOpen, interactions, data]);
}

const TooltipContext = createContext(null)

function useTooltipContext() {
  const context = useContext(TooltipContext)

  if (context == null) {
    throw new Error("Tooltip components must be wrapped in <TooltipProvider />")
  }

  return context
}

export function Tooltip({
  children,
  ...props
}) {
  const tooltip = useTooltip(props)

  if (!props.useDelayGroup) {
    return (
      <TooltipContext.Provider value={tooltip}>
        {children}
      </TooltipContext.Provider>
    );
  }

  return (
    <FloatingDelayGroup
      delay={{ open: props.delay ?? 0, close: props.closeDelay ?? 0 }}
      timeoutMs={props.timeout}>
      <TooltipContext.Provider value={tooltip}>
        {children}
      </TooltipContext.Provider>
    </FloatingDelayGroup>
  );
}

export const TooltipTrigger = forwardRef(
  function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
    const context = useTooltipContext()
    const childrenRef = isValidElement(children)
      ? parseInt(version, 10) >= 19
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (children).props.ref
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (children).ref
      : undefined
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

    if (asChild && isValidElement(children)) {
      const dataAttributes = {
        "data-tooltip-state": context.open ? "open" : "closed",
      }

      return cloneElement(children, context.getReferenceProps({
        ref,
        ...props,
        ...(typeof children.props === "object" ? children.props : {}),
        ...dataAttributes,
      }));
    }

    return (
      <button
        ref={ref}
        data-tooltip-state={context.open ? "open" : "closed"}
        {...context.getReferenceProps(props)}>
        {children}
      </button>
    );
  }
)

export const TooltipContent = forwardRef(function TooltipContent(
  { style, children, portal = true, portalProps = {}, ...props },
  propRef
) {
  const context = useTooltipContext()
  const ref = useMergeRefs([context.refs.setFloating, propRef])

  if (!context.open) return null

  const content = (
    <div
      ref={ref}
      style={{
        ...context.floatingStyles,
        ...style,
      }}
      {...context.getFloatingProps(props)}
      className="tiptap-tooltip">
      {children}
    </div>
  )

  if (portal) {
    return <FloatingPortal {...portalProps}>{content}</FloatingPortal>;
  }

  return content
})

Tooltip.displayName = "Tooltip"
TooltipTrigger.displayName = "TooltipTrigger"
TooltipContent.displayName = "TooltipContent"
