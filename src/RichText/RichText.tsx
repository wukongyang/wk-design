import BraftEditor, { BraftEditorProps, ControlType, EditorState } from 'braft-editor'
import React, { useEffect, useImperativeHandle, useLayoutEffect, useState } from 'react'

import useDebounce from '@/tools/hooks/useDebounce'

import 'braft-editor/dist/index.css'
import './styles/index.less'

export type richTextRef = {
  editorState: EditorState
  setState: (state: string | any) => void
}
type configType = Omit<BraftEditorProps, 'value' | 'onChange' | 'extendControls' | 'controls'> & {
  disabled?: boolean
}
type preComponentsType = 'preview' | 'videoUpload' | 'imgUpload'
type controlType = ControlType | preComponentsType
export type richTextProps = {
  value?: string | any
  onChange?: (html: string) => void
  config?: configType
  controls?: controlType[]
  width?: number
  height?: number
}
let defaultState: EditorState
// 默认控件
const defaultControls = [
  'undo',
  'redo',
  'separator',
  'font-size',
  'line-height',
  'letter-spacing',
  'separator',
  'text-color',
  'bold',
  'italic',
  'underline',
  'strike-through',
  'separator',
  'superscript',
  'subscript',
  'remove-styles',
  'emoji',
  'separator',
  'text-indent',
  'text-align',
  'separator',
  'headings',
  'list-ul',
  'list-ol',
  'blockquote',
  'code',
  'separator',
  'link',
  'separator',
  'hr',
  'separator',
  'media',
  'separator',
  'clear',
]
// 富文本编辑
const RichText = React.forwardRef<richTextRef, richTextProps>(
  ({ value, onChange, config, controls = defaultControls, width, height }, ref) => {
    const [editorState, setEditorState] = useState<EditorState>(
      BraftEditor.createEditorState(value),
    )

    const [editorConfig, setEditorConfig] = useState<configType>({
      excludeControls: ['media', 'code'],
    })
    useEffect(() => {
      // 没有设置过defaultState，则设置默认值
      if (!defaultState && value) {
        defaultState = BraftEditor.createEditorState(value)
        setEditorState(defaultState)
      }
    }, [value])
    useEffect(() => {
      return () => {
        defaultState = null
      }
    }, [])
    // 设置用户传入的配置
    useLayoutEffect(() => {
      if (config) {
        setEditorConfig({ ...editorConfig, ...config })
      }
    }, [config])
    useImperativeHandle(ref, () => {
      return {
        editorState,
        setState: (state: string | any) => {
          setEditorState(BraftEditor.createEditorState(state))
        },
      }
    })
    function handleEditorChange(editorState: EditorState) {
      console.log('handleEditorChange', editorState.toHTML())
      setEditorState(editorState)
      debounceChange(editorState.toHTML() || '')
    }
    const debounceChange = useDebounce((html: string) => {
      onChange?.(html)
    }, 500)

    return (
      <div
        style={{
          border: '1px solid #ccc',
          height: height ? `${height}px` : 'unset',
          width: width ? `${width}px` : 'unset',
        }}
        className='rich-text'
      >
        <BraftEditor
          onChange={handleEditorChange}
          controls={controls as ControlType[]}
          value={editorState}
          {...editorConfig}
        />
      </div>
    )
  },
)
export default RichText
