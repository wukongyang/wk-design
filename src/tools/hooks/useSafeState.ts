import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

function useSafeState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]

function useSafeState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]

/** 安全的state， 组件卸载后阻止setState */
function useSafeState<S>(initialState?: S | (() => S)) {
  const unmountedRef = useRef<boolean>(false)
  const [state, setState] = useState(initialState)
  const setCurrentState = useCallback(currentState => {
    if (unmountedRef.current) return
    setState(currentState)
  }, [])

  useEffect(() => {
    unmountedRef.current = false
    return () => {
      unmountedRef.current = true
    }
  }, [])

  return [state, setCurrentState] as const
}

export default useSafeState
