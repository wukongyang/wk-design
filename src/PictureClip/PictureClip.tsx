import { CloseCircleOutlined } from '@ant-design/icons'
import type { RadioChangeEvent } from 'antd'
import { Button, Card, InputNumber, message, Radio, Space } from 'antd'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useDebounce } from '../tools/hooks'
import './styles/index.less'

type handleParam = Record<'clientX' | 'clientY', number>
// 操作类型
enum handleValueType {
  manual = 1,
  custom,
}
export enum clipMethodType {
  manual = 'manual', // 手动
  fixed = 'fixed', // 固定
  custom = 'custom', // 自定义
}

export interface pictureClipProps {
  resource: string | File
  onClip?: (clipInfo: { url: string; width: number; height: number; file: File }) => void
  imgType?: string // 裁剪后图片的类型
  encoderOptions?: number // 裁剪后图片的质量（0-1）
  defaultClipBox?: {
    // 默认初始化裁剪框大小
    width: number
    height: number
  }
  clipMethod?: 'manual' | 'fixed' | 'custom'
  imgName?: string
  open: boolean // 显示裁剪面板
  onClose?: (position: 'close' | 'clip') => void
}
// 是否在移动中
let isMoveDown = false
// 是否在修改宽高
let isResizeDown = false
// 裁剪盒子定位坐标，左上角
const leftTopPos = {
  left: 0,
  top: 0,
}
const containerWidth = 1000 // 操作容器宽度
const containerHeight = 800 // 操作容器高度

const PictureClip: React.FC<pictureClipProps> = ({
  resource,
  onClip,
  imgType = 'image/png',
  encoderOptions = 0.92,
  defaultClipBox,
  clipMethod = 'manual',
  imgName,
  open = false,
  onClose,
}) => {
  // 图片高度
  const [imgHeight, setImgHeight] = useState<number>(0)
  // 图片宽度
  const [imgWidth, setImgWidth] = useState<number>(0)
  // 裁剪盒子
  const cutBox = useRef<HTMLDivElement>(null)
  // 原始图片
  const pictureDom = useRef<HTMLImageElement>(null)
  // 裁剪盒子top值
  const [cutBoxTop, setCutBoxTop] = useState<number>(0)
  // 裁剪盒子top值
  const [cutBoxLeft, setCutBoxLeft] = useState<number>(0)
  // 裁剪盒子top值
  const [cutBoxRight, setCutBoxRight] = useState<number>(0)
  // 裁剪盒子top值
  const [cutBoxBottom, setCutBoxBottom] = useState<number>(0)
  // 裁剪图片信息
  const [currentClipWidth, setCurrentClipWidth] = useState<number>(0)
  const [currentClipHeight, setCurrentClipHeight] = useState<number>(0)
  // 比例尺
  const [comparingRule, setComparingRule] = useState<number>(1)
  // 操作栏操作类型
  const [handleType, setHandleType] = useState<handleValueType>(1)
  // 自定义宽度
  const [customWidth, setCustomWidth] = useState<number>()
  // 自定义高度
  const [customHeight, setCustomHeight] = useState<number>()
  // 显示
  const [visible, setVisible] = useState<boolean>(open)
  // 图片地址
  const [clipImgUrl, setClipImgUrl] = useState<string>()

  /**
   * @description 裁剪盒子定位坐标
   */
  const getElementPosition = useDebounce((element: any) => {
    if (!element) return
    let top = element.offsetTop // 这是获取元素距父元素顶部的距离
    let left = element.offsetLeft
    let current = element.offsetParent // 这是获取父元素
    while (current) {
      // 当它上面有元素时就继续执行
      top += current.offsetTop // 这是获取父元素距它的父元素顶部的距离累加起来
      left += current.offsetLeft
      current = current.offsetParent // 继续找父元素
    }
    leftTopPos.left = left
    leftTopPos.top = top
    return {
      top,
      left,
    }
  }, 500)
  // 屏幕宽度改变时，重新计算定位
  useEffect(() => {
    window.addEventListener('resize', () => {
      getElementPosition(cutBox.current)
    })
  }, [])
  useEffect(() => {
    setVisible(open)
    if (open) {
      // 如果传入的是文件类型，则要转为base64
      if (resource instanceof File) {
        imageFileToBase64(resource, url => {
          getBaseData(url)
          setClipImgUrl(url)
        })
      } else if (typeof resource === 'string') {
        if (resource.startsWith('http')) {
          // 线上图片，也需要转成base64，canvas有跨域问题
          imageUrlToBase64(resource, url => {
            getBaseData(url)
            setClipImgUrl(url)
          })
        } else if (resource.startsWith('data:')) {
          getBaseData(resource)
          setClipImgUrl(resource)
        }
      }
    }
  }, [open, resource])
  // 获得裁剪的图片宽高
  useEffect(() => {
    // 判断是否正在移动盒子中
    if (!isMoveDown) {
      getImgClipInfo()
    }
  }, [cutBoxTop, cutBoxLeft, cutBoxRight, cutBoxBottom])
  useLayoutEffect(() => {}, [clipImgUrl])
  useEffect(() => {
    if (clipMethod === clipMethodType.fixed) {
      if (!defaultClipBox || !defaultClipBox?.width || !defaultClipBox?.height) {
        throw new Error('裁剪方式为固定尺寸时，需传入默认的裁剪框大小')
      }
    }
  }, [clipMethod])
  function getBaseData(url: string) {
    const image = new Image()
    image.src = url
    image.onload = () => {
      const imgW = image.width
      const imgH = image.height
      // 计算比例尺
      const zoom = Math.min(containerWidth / imgW, containerHeight / imgH)
      // zoom = zoom > 1 ? 1 : zoom
      setComparingRule(zoom)
      setImgHeight(imgH * zoom)
      setImgWidth(imgW * zoom)
      setTimeout(() => {
        getElementPosition(cutBox.current)
      })
      setDefaultClip(imgW * zoom, imgH * zoom, zoom)
      console.log(`原始图片宽度：${imgW} px`)
      console.log(`原始图片高度：${imgH} px`)
      console.log('当前比例尺', zoom)
    }
  }
  /**
   * @description 默认裁剪框
   */
  function setDefaultClip(imgW: number, imgH: number, zoom: number) {
    // 存在传入的裁剪盒子尺寸
    if (defaultClipBox && defaultClipBox?.width && defaultClipBox?.height) {
      let width = (defaultClipBox?.width || 0) * zoom
      let height = (defaultClipBox?.height || 0) * zoom
      // 大于图片宽高，即为图片最大宽度
      if (width >= imgW) {
        width = imgW
      }
      if (height >= imgH) {
        height = imgH
      }
      setCutBoxTop(0)
      setCutBoxLeft(0)
      setCutBoxRight(imgW - width)
      setCutBoxBottom(imgH - height)
      getImgClipInfo(imgW, imgH, 0, imgW - width, imgH - height, 0, zoom)
    } else {
      setCutBoxTop(0)
      setCutBoxLeft(0)
      setCutBoxRight(0)
      setCutBoxBottom(0)
      getImgClipInfo(imgW, imgH, 0, 0, 0, 0, zoom)
    }
  }
  /**
   * @description 获取裁剪信息
   */
  function getImgClipInfo(
    imgW: number = imgWidth,
    imgH: number = imgHeight,
    top: number = cutBoxTop,
    right: number = cutBoxRight,
    bottom: number = cutBoxBottom,
    left: number = cutBoxLeft,
    zoom: number = comparingRule,
  ) {
    const height = imgH - bottom - top
    const width = imgW - right - left
    setCurrentClipWidth(Math.round(width / zoom))
    setCurrentClipHeight(Math.round(height / zoom))
  }
  /**
   * @description 裁剪盒子移动逻辑
   */
  function cutBoxMouseDown(event: React.MouseEvent) {
    event.stopPropagation()
    isMoveDown = true
    // 获取剪裁盒子宽高
    const cutBoxHeight = imgHeight - cutBoxBottom - cutBoxTop
    const cutBoxWidth = imgWidth - cutBoxRight - cutBoxLeft
    document.onmousemove = docEvent => {
      const disX = docEvent.clientX - event.clientX
      const disY = docEvent.clientY - event.clientY
      let top = cutBoxTop + disY
      let left = cutBoxLeft + disX
      // 处理边界问题
      if (top >= imgHeight - cutBoxHeight) {
        top = imgHeight - cutBoxHeight
      } else if (top <= 0) {
        top = 0
      }
      if (left >= imgWidth - cutBoxWidth) {
        left = imgWidth - cutBoxWidth
      } else if (left <= 0) {
        left = 0
      }
      const bottom = imgHeight - cutBoxHeight - top
      const right = imgWidth - left - cutBoxWidth
      if (isMoveDown) {
        setBottom(bottom, top)
        setRight(right, left)
        setTop(top, bottom)
        setLeft(left, right)
      }
      docEvent.preventDefault()
    }
    document.onmouseup = () => {
      isMoveDown = false
    }
  }
  /**
   * @description 定位点移动
   */
  function handlePointer(e: React.MouseEvent, type: string) {
    e.stopPropagation()

    // 自定义中输入尺寸和固定尺寸不允许手动调节边框
    if (handleType === handleValueType.custom || clipMethod === clipMethodType.fixed) return
    isResizeDown = true
    if (isResizeDown) {
      document.onmousemove = docEvent => {
        resizeDown(docEvent.clientX, docEvent.clientY, type)
      }
      document.onmouseup = () => {
        document.onmousemove = () => {}
        isResizeDown = false
      }
    }
  }
  /**
   * @description 处理裁剪盒子位置逻辑，对每个位置执行不同操作
   */
  function resizeDown(clientX: number, clientY: number, type: string) {
    switch (type) {
      case 'topleft':
        handleTopLeft({ clientX, clientY })
        break
      case 'topright':
        handleTopRight({ clientX, clientY })
        break
      case 'bottomleft':
        handleBottomLeft({ clientX, clientY })
        break
      case 'bottomright':
        handleBottomRight({ clientX, clientY })
        break
      case 'topmiddle':
        setTop(clientY - leftTopPos.top)
        break
      case 'bottommiddle':
        setBottom(leftTopPos.top + imgHeight - clientY)
        break
      case 'leftmiddle':
        setLeft(clientX - leftTopPos.left)
        break
      case 'rightmiddle':
        setRight(leftTopPos.left + imgWidth - clientX)
        break
      default:
        break
    }
  }
  /**
   * @destription 设置top位置
   */
  function setTop(top: number, bottom: number = cutBoxBottom) {
    if (top < 0) {
      top = 0
    } else if (top >= imgHeight && bottom === 0) {
      top = imgHeight
    } else if (top + bottom >= imgHeight) {
      top = imgHeight - bottom
    }
    setCutBoxTop(top)
  }
  /**
   * @destription 设置right位置
   */
  function setRight(right: number, left: number = cutBoxLeft) {
    if (right <= 0) {
      right = 0
    } else if (right >= imgWidth && left === 0) {
      right = imgWidth
    } else if (right + left >= imgWidth) {
      right = imgWidth - left
    }
    setCutBoxRight(right)
  }
  /**
   * @destription 设置bottom位置
   */
  function setBottom(bottom: number, top: number = cutBoxTop) {
    if (bottom <= 0) {
      bottom = 0
    } else if (bottom >= imgHeight && top === 0) {
      bottom = imgHeight
    } else if (bottom + top >= imgHeight) {
      bottom = imgHeight - top
    }
    setCutBoxBottom(bottom)
  }
  /**
   * @destription 设置left位置
   */
  function setLeft(left: number, right: number = cutBoxRight) {
    let l = left
    if (l < 0) {
      l = 0
    } else if (left >= imgWidth && right === 0) {
      l = imgWidth
    } else if (left + right >= imgWidth) {
      l = imgWidth - right
    }
    setCutBoxLeft(l)
  }
  function handleBottomRight({ clientX, clientY }: handleParam) {
    setRight(leftTopPos.left + imgWidth - clientX)
    setBottom(leftTopPos.top + imgHeight - clientY)
  }
  function handleBottomLeft({ clientX, clientY }: handleParam) {
    setBottom(leftTopPos.top + imgHeight - clientY)
    setLeft(clientX - leftTopPos.left)
  }
  function handleTopRight({ clientX, clientY }: handleParam) {
    setTop(clientY - leftTopPos.top)
    setRight(leftTopPos.left + imgWidth - clientX)
  }
  function handleTopLeft({ clientX, clientY }: handleParam) {
    setTop(clientY - leftTopPos.top)
    setLeft(clientX - leftTopPos.left)
  }
  /**
   * @description 确认裁剪
   */
  function comfirmClip() {
    if (currentClipWidth === 0 || currentClipHeight === 0) {
      message.warning('请裁剪正确尺寸的图片！！！')
      return
    }
    const copyCanvas = document.createElement('canvas')
    const ctx = copyCanvas.getContext('2d') as CanvasRenderingContext2D
    // 还原图片
    const imgH = imgHeight / comparingRule
    const imgW = imgWidth / comparingRule
    copyCanvas.height = imgH
    copyCanvas.width = imgW
    ctx.drawImage(pictureDom.current as HTMLImageElement, 0, 0, imgW, imgH)

    const cutImage = ctx.getImageData(
      cutBoxLeft / comparingRule,
      cutBoxTop / comparingRule,
      currentClipWidth,
      currentClipHeight,
    )
    const newImageBase64 = createNewCanvas(cutImage, currentClipWidth, currentClipHeight)
    console.log('图片裁剪后的宽度', currentClipWidth)
    console.log('图片裁剪后的高度', currentClipHeight)
    // 获取图片对应的file对象
    getImageFileFromUrl(newImageBase64).then(file => {
      onClip?.({
        url: newImageBase64,
        width: currentClipWidth,
        height: currentClipHeight,
        file,
      })
      setVisible(false)
      onClose?.('clip')
    })
  }
  /**
   * @description 获取文件信息
   */
  function getImageFileFromUrl(url: string) {
    // 截取图片名称
    const imageName = url.substring(url.lastIndexOf('/') + 1)
    const suffixName = imgName || imageName

    return new Promise<File>((resolve, reject) => {
      let blob = null
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url)
      xhr.setRequestHeader('Accept', imgType)
      xhr.responseType = 'blob'
      xhr.onload = () => {
        blob = xhr.response
        const imgFile = new File([blob], suffixName, { type: imgType })
        resolve(imgFile)
      }
      xhr.onerror = e => {
        reject(e)
      }
      xhr.send()
    })
  }
  // 将图片转成base64
  async function imageUrlToBase64(url: string, callBack: (url: string) => void) {
    const file = await getImageFileFromUrl(url)
    imageFileToBase64(file, callBack)
  }
  // 将图片文件转成base64
  function imageFileToBase64(file: File, callBack: (url: string) => void) {
    const reader = new FileReader()
    reader.addEventListener(
      'load',
      () => {
        callBack?.(reader.result as string)
      },
      false,
    )
    reader.readAsDataURL(file)
  }
  function createNewCanvas(content: ImageData, width: number, height: number) {
    const nCanvas = document.createElement('canvas')
    const nCtx = nCanvas.getContext('2d') as CanvasRenderingContext2D
    nCanvas.width = width
    nCanvas.height = height
    nCtx.putImageData(content, 0, 0) // 将画布上指定矩形的像素数据，通过 putImageData() 方法将图像数据放回画布
    return nCanvas.toDataURL(imgType, encoderOptions)
  }
  /**
   * @description 操作方式改变
   */
  function onHandleTypeChange(e: RadioChangeEvent) {
    setHandleType(e.target.value)
    if (e.target.value === 2) {
      setCustomWidth(currentClipWidth)
      setCustomHeight(currentClipHeight)
    }
  }
  /**
   * @description 自定义宽度改变
   */
  function customWidthChnage(value: number | null) {
    setCustomWidth(value as number)
  }
  /**
   * @description 自定义高度改变
   */
  function customHeightChange(value: number | null) {
    setCustomHeight(value as number)
  }
  /**
   * @description 确定自定义
   */
  function comfirmCustom() {
    const width = (customWidth as number) * comparingRule
    const height = (customHeight as number) * comparingRule
    setCutBoxTop(0)
    setCutBoxLeft(0)
    setCutBoxRight(imgWidth - width)
    setCutBoxBottom(imgHeight - height)
  }

  return (
    <>
      {visible && (
        <div className='custom-mask'>
          <div className='picture-clip'>
            <CloseCircleOutlined
              onClick={() => {
                setVisible(false)
                onClose?.('close')
              }}
              className='picture-clip-close'
            />
            <div
              style={{
                height: `${containerHeight}px`,
                width: `${containerWidth}px`,
              }}
              className='picture-clip-img-container'
            >
              <div
                style={{ height: `${imgHeight}px`, width: `${imgWidth}px` }}
                className='picture-clip-img-warp'
              >
                <img
                  style={{ height: `${imgHeight}px`, width: `${imgWidth}px` }}
                  ref={pictureDom}
                  className='picture-clip-img-bg'
                  src={clipImgUrl}
                />
                <img
                  style={{
                    clipPath: `polygon(${cutBoxLeft}px ${cutBoxTop}px,${
                      imgWidth - cutBoxRight
                    }px ${cutBoxTop}px,${imgWidth - cutBoxRight}px ${
                      imgHeight - cutBoxBottom
                    }px,${cutBoxLeft}px ${imgHeight - cutBoxBottom}px)`,
                    height: `${imgHeight}px`,
                    width: `${imgWidth}px`,
                  }}
                  className='picture-clip-img-show'
                  src={clipImgUrl}
                />
                <div
                  style={{
                    top: `${cutBoxTop}px`,
                    left: `${cutBoxLeft}px`,
                    bottom: `${cutBoxBottom}px`,
                    right: `${cutBoxRight}px`,
                    cursor: 'move',
                  }}
                  ref={cutBox}
                  onMouseDown={cutBoxMouseDown}
                  className='picture-cut-box'
                >
                  <div
                    onMouseDown={e => {
                      handlePointer(e, 'topleft')
                    }}
                    className='box-corner topleft'
                    style={{ cursor: 'nwse-resize' }}
                  />
                  <div
                    onMouseDown={e => {
                      handlePointer(e, 'topright')
                    }}
                    className='box-corner topright'
                    style={{ cursor: 'nesw-resize' }}
                  />
                  <div
                    onMouseDown={e => {
                      handlePointer(e, 'bottomright')
                    }}
                    className='box-corner bottomright'
                    style={{ cursor: 'nwse-resize' }}
                  />
                  <div
                    onMouseDown={e => {
                      handlePointer(e, 'bottomleft')
                    }}
                    className='box-corner bottomleft'
                    style={{ cursor: 'nesw-resize' }}
                  />
                  <div
                    onMouseDown={e => {
                      handlePointer(e, 'topmiddle')
                    }}
                    className='box-middle topmiddle'
                    style={{ cursor: 'row-resize' }}
                  />
                  <div
                    onMouseDown={e => {
                      handlePointer(e, 'bottommiddle')
                    }}
                    className='box-middle bottommiddle'
                    style={{ cursor: 'row-resize' }}
                  />
                  <div
                    onMouseDown={e => {
                      handlePointer(e, 'leftmiddle')
                    }}
                    className='box-middle leftmiddle'
                    style={{ cursor: 'col-resize' }}
                  />
                  <div
                    onMouseDown={e => {
                      handlePointer(e, 'rightmiddle')
                    }}
                    className='box-middle rightmiddle'
                    style={{ cursor: 'col-resize' }}
                  />
                </div>

                {clipMethod === clipMethodType.custom && (
                  <div className='img-clip-info'>
                    <Card>
                      <div className='pixel-info'>
                        宽（像素）：{currentClipWidth} 高（像素）：
                        {currentClipHeight}
                      </div>
                      <Space direction='vertical'>
                        <Radio.Group onChange={onHandleTypeChange} value={handleType}>
                          <Space direction='vertical'>
                            <Radio value={handleValueType.manual}>手动尺寸</Radio>
                            <Radio value={handleValueType.custom}>输入尺寸</Radio>
                          </Space>
                        </Radio.Group>
                        <Space>
                          <InputNumber
                            min={1}
                            precision={0}
                            disabled={handleType !== handleValueType.custom}
                            max={imgWidth / comparingRule}
                            value={customWidth}
                            onChange={customWidthChnage}
                          />
                          *
                          <InputNumber
                            value={customHeight}
                            min={1}
                            precision={0}
                            disabled={handleType !== handleValueType.custom}
                            max={imgHeight / comparingRule}
                            onChange={customHeightChange}
                          />
                          <Button
                            disabled={handleType !== handleValueType.custom}
                            onClick={comfirmCustom}
                            block={false}
                            shape='round'
                            type='primary'
                          >
                            确认
                          </Button>
                        </Space>
                        <Button shape='round' onClick={comfirmClip} type='primary'>
                          确认裁剪
                        </Button>
                      </Space>
                    </Card>
                  </div>
                )}
              </div>
            </div>
            {clipMethod !== clipMethodType.custom && (
              <Button
                onClick={comfirmClip}
                className='picture-clip-btn'
                block={false}
                type='primary'
              >
                确认裁剪
              </Button>
            )}

            {/* <img style={{ position: 'fixed', top: '0' }} src={resultUrl} /> */}
          </div>
        </div>
      )}
    </>
  )
}
export default PictureClip
