import { useEffect, useRef } from 'react'

import { useMemoizedFn } from '.'

/** 防抖 */
function useDebounce<T extends Function>(fn: T, delay: number): T {
  const { current } = useRef<{ fn: T; timer: NodeJS.Timeout | null }>({ fn, timer: null })

  useEffect(() => {
    current.fn = fn
  }, [fn])

  return useMemoizedFn((...args) => {
    if (current.timer) {
      clearTimeout(current.timer)
    }
    current.timer = setTimeout(() => {
      current.fn.call(null, ...args)
    }, delay)
  }) as unknown as T
}
export default useDebounce
