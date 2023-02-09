---
toc: content
title: 富文本
---

# RichText

富文本编辑

## 示例

<code src="./demo/index.tsx">基础示例</code>

## API

| 属性 | 说明 | 类型 | 默认值 | 是否必须 |
| :-: | :-: | :-: | :-: | :-: |
| value | 显示的文本内容 | string | `-` | false |
| config | 富文本配置 | [BraftEditorProps](https://www.yuque.com/braft-editor/be/gz44tn) | `略` | false |
| controls | 指定编辑器工具栏的控件列表 | [ControlType[]](https://www.yuque.com/braft-editor/be/gz44tn#bo49ph) | `略` | false |
| width | 组件宽度 | number | `unset` | false |
| height | 组件高度 | number | `unset` | false |
| onChange | 富文本内容改变后触发 | Function | `-` | false |
