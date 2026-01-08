"use client";
import { useCallback, useRef } from "react"

const updateRef = (ref, value) => {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref && typeof ref === "object" && "current" in ref) {
    // Safe assignment without MutableRefObject
    ;(ref).current = value
  }
}

export const useComposedRef = (libRef, userRef) => {
  const prevUserRef = useRef(null)

  return useCallback((instance) => {
    if (libRef && "current" in libRef) {
      ;(libRef).current = instance
    }

    if (prevUserRef.current) {
      updateRef(prevUserRef.current, null)
    }

    prevUserRef.current = userRef

    if (userRef) {
      updateRef(userRef, instance)
    }
  }, [libRef, userRef]);
}

export default useComposedRef
