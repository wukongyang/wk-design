import type { TooltipProps } from 'antd'
import { Tooltip } from 'antd'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

export type lineClampType = {
  children: string // 显示的文本
  line?: number // 显示的行数
  width?: number // 文本容器宽度，默认为父元素宽度
  tooltip: boolean // 是否需要tooltip
  tooltipProps: TooltipProps
}
// 多行文本显示组件
const LineClamp: React.FC<lineClampType> = ({
  children,
  line = 2,
  width,
  tooltip = false,
  tooltipProps,
}) => {
  const textContainer = useRef<HTMLDivElement>(null)
  const [showText, setShowText] = useState<string>(children)
  const [tipProps, setTipProps] = useState<TooltipProps>({ placement: 'top', title: children })
  useLayoutEffect(() => {
    // 计算文字大小
    const fontWidth = parseInt(
      window.getComputedStyle(textContainer.current as HTMLDivElement).fontSize,
      10,
    )
    // 计算容器宽度
    const containerWidth =
      width || parseInt(window.getComputedStyle(textContainer.current as HTMLDivElement).width, 10)
    //  计算指定行数最多显示字数
    const fontNum = Math.floor((line * containerWidth) / fontWidth)
    // 文本长度超过显示最多字数，显示省略号
    if (fontNum < children.length) {
      // 截取、省略号
      children = `${children.slice(0, fontNum - 2)}...`
    }
    setShowText(children)
  }, [children])
  useEffect(() => {
    if (tooltipProps) {
      setTipProps({ ...tipProps, ...tooltipProps })
    }
  }, [tooltipProps])
  return (
    <div style={{ width: `${width}px` }} ref={textContainer}>
      {tooltip ? <Tooltip {...tipProps}>{showText}</Tooltip> : <> {showText}</>}
    </div>
  )
}
export default LineClamp
