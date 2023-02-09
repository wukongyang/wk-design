import { useCallback } from 'react'

import { useSafeState } from '.'

/** 设置布尔值状态，适合model弹窗，抽屉等控制显示隐藏 */
function useBooleanState(initialState: boolean): [boolean, () => void, () => void] {
  const [state, setState] = useSafeState(initialState)

  const onSetTrue = useCallback(() => setState(true), [])
  const onSetFalse = useCallback(() => setState(false), [])

  return [state, onSetTrue, onSetFalse]
}

export default useBooleanState
