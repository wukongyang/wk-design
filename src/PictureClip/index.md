---
toc: content
title: 图片裁剪
---

# PictureClip

图片裁剪组件

```tsx
import React, { useState } from 'react'
import { PictureClip } from 'wk-design'

export default () => {
  const [isClipOpen, setIsClipOpen] = useState<boolean>(false)

  const onClip = clipInfo => {
    console.log(clipInfo)
    setIsClipOpen(false)
  }

  return (
    <>
      <div
        onClick={() => {
          setIsClipOpen(true)
        }}
      >
        点我
      </div>
      <PictureClip
        onClip={onClip}
        onClose={() => {
          setIsClipOpen(false)
        }}
        clipMethod='custom'
        open={isClipOpen}
        resource={
          'https://img1.baidu.com/it/u=2551602271,2573347256&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=800'
        }
      />
    </>
  )
}
```

## API

| 属性 | 说明 | 类型 | 默认值 | 是否必须 |
| :-: | :-: | :-: | :-: | :-: |
| resource | 裁剪源数据 | string ｜ File | - | true |
| imgType | 图片类型 | string | `'image/png'` | false |
| imgName | 图片名称 | string | - | false |
| encoderOptions | 裁剪后图片质量 | number | `0.92` | false |
| defaultClipBox | 默认裁剪盒子信息 | { width: number,height:number } | - | false |
| clipMethod | 裁剪方式 | 'manual'｜'fixed' ｜'custom' | `manual` | false |
| open | 显示裁剪 | boolean | `false` | false |
| onClip | 裁剪后触发 | (clipInfo: { url: string; width: number; height: number; file: File }) => void | - | false |
| onClose | 点击关闭按钮触发 | (position: 'close' ｜'clip') => void | `false` | false |
