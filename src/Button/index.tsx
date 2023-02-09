import React from 'react'

const Button: React.FC = () => {
  // 图片高度

  function getBaseData() {
    console.log('test=====Button')
  }

  return <div onClick={getBaseData}>示例组件</div>
}
export default Button
