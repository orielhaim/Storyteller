"use client";
import { useEffect, useState } from "react"
import { useThrottledCallback } from "@/hooks/use-throttled-callback"

/**
 * Hook that tracks the window's visual viewport dimensions, position, and provides
 * a CSS transform for positioning elements.
 *
 * Uses the Visual Viewport API to get accurate measurements, especially important
 * for mobile devices where virtual keyboards can change the visible area.
 * Only updates state when values actually change to optimize performance.
 *
 * @returns An object containing viewport properties and a CSS transform string
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
    offsetTop: 0,
    offsetLeft: 0,
    scale: 0,
  })

  const handleViewportChange = useThrottledCallback(() => {
    if (typeof window === "undefined") return

    const vp = window.visualViewport
    if (!vp) return

    const {
      width = 0,
      height = 0,
      offsetTop = 0,
      offsetLeft = 0,
      scale = 0,
    } = vp

    setWindowSize((prevState) => {
      if (
        width === prevState.width &&
        height === prevState.height &&
        offsetTop === prevState.offsetTop &&
        offsetLeft === prevState.offsetLeft &&
        scale === prevState.scale
      ) {
        return prevState
      }

      return { width, height, offsetTop, offsetLeft, scale }
    })
  }, 200)

  useEffect(() => {
    const visualViewport = window.visualViewport
    if (!visualViewport) return

    visualViewport.addEventListener("resize", handleViewportChange)

    handleViewportChange()

    return () => {
      visualViewport.removeEventListener("resize", handleViewportChange)
    };
  }, [handleViewportChange])

  return windowSize
}
