"use client";
export function Spacer({
  orientation = "horizontal",
  size,
  style = {},
  ...props
}) {
  const computedStyle = {
    ...style,
    ...(orientation === "horizontal" && !size && { flex: 1 }),
    ...(size && {
      width: orientation === "vertical" ? "1px" : size,
      height: orientation === "horizontal" ? "1px" : size,
    }),
  }

  return <div {...props} style={computedStyle} />;
}
