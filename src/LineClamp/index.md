---
toc: content
title: 文本超出显示省略号
---

# LineClamp

文本超出显示省略号(支持多行文本显示省略号)

## 示例

```jsx
import { LineClamp } from 'wk-design'

export default () => {
  return (
    <LineClamp>
      多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本多行文本end
    </LineClamp>
  )
}
```

## API

| 属性 | 说明 | 类型 | 默认值 | 是否必须 |
| :-: | :-: | :-: | :-: | :-: |
| children | 显示的文本内容 | string | `-` | true |
| line | 最多显示的行数 | number | `2` | false |
| width | 显示的容器宽度 | number | `父容器宽度` | false |
| tooltip | 是否需要 Tooltip | boolean | `false` | false |
| tooltipProps | Tooltip 配置 | [TooltipProps](https://ant-design.antgroup.com/components/tooltip-cn) | `{ placement: 'top', title: children }` | false |
