import React, { useState } from 'react'
import type { listDataChangeType } from 'wk-design'
import { DragList } from 'wk-design'

export default () => {
  const [list] = useState(['test1', 'test2', 'test3'])

  return (
    <DragList
      listDataChange={(info: listDataChangeType) => {
        console.log(info)
      }}
    >
      {list.map((item, index) => (
        <DragList.Item key={index}>
          <div className='drag-item'>{item}</div>
        </DragList.Item>
      ))}
    </DragList>
  )
}
