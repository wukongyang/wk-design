import { ColumnHeightOutlined, DeleteOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import styles from './style/index.module.less'

import { attachPropertiesToComponent } from '@/tools/utils/tools'

export interface listDataChangeType {
  originIndex: number // 移动前的索引 或 点击删除的索引 或者新增的组件的索引
  targetIndex?: number // 移动后的目标索引
  type: 'move' | 'delete' | 'add' // 操作的类型
}
export interface DragListProps {
  listDataChange: (changeInfo: listDataChangeType) => void // 数据变化
  children: React.ReactNode
}
enum MoveDownAndUp {
  down = 1,
  up = -1,
}
const DragItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useLayoutEffect(() => {
    const dragItem = Array.from(document.querySelectorAll('div[data-drag-warper]'))
    // 最大值
    // eslint-disable-next-line prefer-spread
    const maxHeight = Math.max.apply(
      Math,
      dragItem.map(item => {
        return item.clientHeight
      }),
    )
    dragItem.forEach((item: any) => {
      item.style.setProperty('--drag-offest-height', `${maxHeight}px`)
    })
  }, [])
  return (
    <div data-drag-warper className={styles['drag-item']}>
      {children}
    </div>
  )
}

const DragList: React.FC<DragListProps> = ({ children, listDataChange }) => {
  /** 是否显示遮罩层，实现移动和鼠标松开 */
  const [dragging, setDragging] = useState<boolean>(false)
  /** 当前索引数 */
  const [draggingItemIndex, setDraggingItemIndex] = useState<number>(-1)
  const [originIndex, setOriginIndex] = useState<number>(-1)
  /** 当前点击移动列的y轴偏移量 */
  const [startPageY, setStartPageY] = useState<number>(0)
  /** 设置移动列偏移量 */
  const [offsetY, setOffsetY] = useState<number>(0)
  // 偏移的高度
  const [lineHeight, setLineHeight] = useState<number>(0)
  const listContainer = useRef<HTMLDivElement>(null)
  const [childList, setChildList] = useState<React.ReactElement[]>([])
  // 处理childran
  const validChildren: any = useMemo(() => {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) return null
      if (child.type !== DragItem) {
        console.error('The children of `DragList` must be `DragList.Item` components.')
        return null
      }
      return React.cloneElement(child, { ...child.props })
    })
  }, [children])
  // 计算偏移位置
  useEffect(() => {
    const clientHeight = listContainer?.current?.clientHeight || 0
    const length = childList.length
    if (clientHeight > 0) {
      setLineHeight((clientHeight - 10 * (length - 1)) / length)
    }
  }, [childList])
  // 避免修改validChildren
  useEffect(() => {
    setChildList(validChildren)
  }, [validChildren])

  /** 拖拽开始 */
  const onDragStart = (event: React.DragEvent, index: number) => {
    if (childList.length === 1) return
    setDragging(true)
    setDraggingItemIndex(index)
    setStartPageY(event.pageY)
    setOriginIndex(index)
  }

  /** 鼠标松开 */
  const handleMouseUp = () => {
    if (childList.length === 1) return
    if (originIndex !== draggingItemIndex) {
      // 不相等说明移动了
      listDataChange({
        originIndex,
        targetIndex: draggingItemIndex,
        type: 'move',
      })
    }
    // 还原配置
    setDragging(false)
    setDraggingItemIndex(-1)
    setOriginIndex(-1)
    setStartPageY(0)
  }

  /**
   * 当拖放生效时，重新整理数组
   * @param startIndex 当前拖放列的序号
   * @param moveDownAndUp 向下移动 1 向上移动-1
   */
  const move = (startIndex: number, moveDownAndUp: MoveDownAndUp) => {
    // 获取当前拖动的内容
    const newList = [...childList]
    const moveItem = newList.splice(startIndex, 1)[0]
    newList.splice(startIndex + moveDownAndUp, 0, moveItem)
    setChildList(newList)
  }

  /** 鼠标移动 */
  const handleMouseMove = (event: React.MouseEvent) => {
    if (childList.length === 1) return
    let offset = event.pageY - startPageY
    const draggingIndex = draggingItemIndex

    // 当移动的item没有超过list的长度， 则每往下移动超过lineHeight，就把数组中数据往后挪一位。相应的draggingItemIndex 和 startPageY都要增加一位。
    if (offset > lineHeight && draggingIndex < childList.length - 1) {
      offset -= lineHeight
      move(draggingIndex, MoveDownAndUp.down)
      setDraggingItemIndex(draggingIndex + MoveDownAndUp.down)
      setStartPageY(startPageY + lineHeight)
      // 当移动的item还是list里面， 则每往上移动超过lineHeight，就把数组中数据往前挪一位。相应的draggingItemIndex 和 startPageY都要减少一位。
    } else if (offset < -lineHeight && draggingIndex > 0) {
      offset += lineHeight
      move(draggingIndex, MoveDownAndUp.up)
      setDraggingItemIndex(draggingIndex + MoveDownAndUp.up)
      setStartPageY(startPageY - lineHeight)
    }
    setOffsetY(offset)
  }

  /** 拖动的样式 */
  const getDraggingStyle = (index: number): React.CSSProperties => {
    if (index === draggingItemIndex) {
      return {
        transform: `translate(10px, ${offsetY}px)`,
        color: '#40a9ff',
        opacity: 0.8,
      }
    }
    return {}
  }

  // 删除组件
  const delectListData = (index: number) => {
    listDataChange({
      originIndex: index,
      type: 'delete',
    })
  }

  const ListItem: React.FC = () => {
    return (
      <>
        {childList.map((child: React.ReactElement, index: number) => (
          <div
            key={index}
            draggable={childList.length > 1}
            onDragStart={(event: React.DragEvent<Element>) => onDragStart(event, index)}
            style={getDraggingStyle(index)}
            className={styles['list-item']}
          >
            <Tooltip placement='top' title='移动'>
              <ColumnHeightOutlined />
            </Tooltip>
            {child}
            <Tooltip placement='top' title='删除'>
              <DeleteOutlined
                className={styles['list-item-delete']}
                onClick={e => {
                  e.stopPropagation()
                  delectListData(index)
                }}
              />
            </Tooltip>
          </div>
        ))}
      </>
    )
  }
  const CoverMask: React.FC = () => {
    return dragging ? (
      <div className={styles.coverMask} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} />
    ) : (
      <></>
    )
  }

  return (
    <div ref={listContainer} className={styles.listContainer}>
      <ListItem />
      <CoverMask />
    </div>
  )
}

export default attachPropertiesToComponent(DragList, {
  Item: DragItem,
})
