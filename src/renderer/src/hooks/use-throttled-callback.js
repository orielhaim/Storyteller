import throttle from "lodash.throttle"

import { useUnmount } from "@/hooks/use-unmount"
import { useMemo } from "react"

const defaultOptions = {
  leading: false,
  trailing: true,
}

/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes
 * @param options The throttle options
 */
export function useThrottledCallback(fn, wait = 250, dependencies = [], options = defaultOptions) {
  const handler = useMemo(
    () => throttle(fn, wait, options),
    dependencies
  )

  useUnmount(() => {
    handler.cancel()
  })

  return handler
}

export default useThrottledCallback
