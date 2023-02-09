import { useEffect, useRef } from 'react'

import { useMemoizedFn } from '.'

/** 节流 */
function useThrottle<T extends Function>(fn: T, delay: number) {
  const { current } = useRef({ fn, timer: null })
  useEffect(() => {
    current.fn = fn
  }, [fn])

  return useMemoizedFn(function f(...args) {
    if (!current.timer) {
      current.timer = setTimeout(() => {
        delete current.timer
      }, delay)
      current.fn.call(this, ...args)
    }
  })
}

export default useThrottle
