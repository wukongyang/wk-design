import { Form } from 'antd'
import React, { useEffect } from 'react'
import { RichText } from 'wk-design'

export default () => {
  const [editForm] = Form.useForm()

  useEffect(() => {
    editForm.setFieldsValue({
      richText: '受控组件使用方式',
    })
  }, [])
  return (
    <Form form={editForm} style={{ marginTop: '30px' }}>
      <Form.Item label='富文本:' name='richText'>
        <RichText controls={['undo', 'clear', 'preview', 'imgUpload']} />
      </Form.Item>
    </Form>
  )
}
