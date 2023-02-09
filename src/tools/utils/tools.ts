const toString = Object.prototype.toString

export function isArrayBuffer(val): boolean {
  return toString.call(val) === '[object ArrayBuffer]'
}

export function isFormData(val): boolean {
  return typeof FormData !== 'undefined' && val instanceof FormData
}

export function isUndefined(val): boolean {
  return typeof val === 'undefined'
}

export function isObject(val): boolean {
  return val !== null && typeof val === 'object'
}

export function isFile(val): boolean {
  return toString.call(val) === '[object File]'
}

export function isBlob(val): boolean {
  return toString.call(val) === '[object Blob]'
}

interface AsyncFetchHooks<T> {
  onRequest?: () => void
  onSuccess?: (result?: T) => void
  onFinish?: () => void
  /** 请求报错时的回调 */
  onError?: (error?: ErrorEvent) => void /** 原生的错误事件对象 */
}

/**
 * 调用接口通用方案
 *
 * @param apiCall 请求接口的回调，需返回promise
 * @param hooks { onRequest, onSuccess, onFinish, onError } 开始、成功、出错、结束时的回调
 *
 */
export async function asyncFetch<T>(apiCall: () => Promise<T>, hooks: AsyncFetchHooks<T> = {}) {
  const { onRequest, onSuccess, onFinish, onError } = hooks
  try {
    onRequest && onRequest()
    const result = await apiCall()
    onSuccess && onSuccess(result)
  } catch (error) {
    onError && onError(error as ErrorEvent)
  } finally {
    onFinish && onFinish()
  }
}

/** 精确判断数据类型 */
export function getType<T>(val: T) {
  return Object.prototype.toString.call(val).slice(8, -1)
}

/** 删除对象value两边空格和换行符 */
export function formatParams<T extends Object>(obj: T) {
  const type = getType(obj)
  if (type !== 'Object' && type !== 'Array') return obj
  const newParams = Array.isArray(obj) ? [...obj] : { ...obj }
  for (const key in obj) {
    const value = obj[key]
    if (typeof value === 'string') {
      // @ts-ignore
      newParams[key] = value.trim().replace(/\n\r/g, '')
    } else {
      // @ts-ignore
      newParams[key] = formatParams(value)
    }
  }
  return newParams
}

/** 对象转为query参数字符串 */
export function serializeObject(query: {}): string {
  if (!query) {
    return ''
  }
  const newObj: Record<string, unknown> = (Object.keys(query) || [])
    .filter(key => query[key] !== undefined)
    .reduce((acc, key) => ({ ...acc, [key]: query[key] }), {})
  let str = ''
  for (const key in newObj) {
    str = `${str}${key}=${newObj[key]}&`
  }
  str = str.substring(0, str.length - 1)
  return str ? `?${str}` : ''
}

/**
 * 图片压缩
 * 1. Chrome 支持“image/webp”类型
 * 2. 在指定图片格式为 image/jpeg 或 image/webp 的情况下，可以从 0 到 1 的区间内选择图片的质量, 如果超出取值范围，将会使用默认值 0.92
 * 3. 支持压缩格式为'png', 'jpeg', 'webp', 'jpg'的图片
 *
 * @param {} file
 * @param {*} quality
 * @returns 不影响图片上传 压缩报错会返回原始文件
 */
export const compressImg = (file: File, quality = 0.5): Promise<File> => {
  return new Promise(resolve => {
    const SupportType = ['png', 'jpeg', 'webp', 'jpg']
    const pointArr = file.name.split('.')
    /**  */
    const suffix = pointArr[pointArr.length - 1]
    if (!SupportType.includes(suffix)) {
      resolve(file)
    }
    try {
      // 创建 FileReader
      const reader = new FileReader()
      reader.onload = ({ target: { result: src } }) => {
        // 创建 img 元素
        const image = new Image()
        image.onload = async () => {
          // 创建 canvas 元素
          const canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          // 绘制 canvas
          canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height)
          const canvasURL = canvas.toDataURL('image/webp', quality)
          // 将base64编码转为字符串
          const buffer = atob(canvasURL.split(',')[1])
          let length = buffer.length
          const bufferArray = new Uint8Array(length)
          while (length--) {
            bufferArray[length] = buffer.charCodeAt(length)
          }
          const miniFile = new File([bufferArray], file.name, {
            type: file.type,
          })
          resolve(miniFile)
        }
        image.src = src as string
      }
      reader.readAsDataURL(file)
    } catch (err) {
      resolve(file)
    }
  })
}
// 组件暴露方法
export function attachPropertiesToComponent<C, P extends Record<string, any>>(
  component: C,
  properties: P,
): C & P {
  const ret = component as any
  for (const key in properties) {
    if (Reflect.has(properties, key)) {
      ret[key] = properties[key]
    }
  }
  return ret
}
