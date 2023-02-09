// @ts-ignore
import { history, useLocation } from 'dumi'
import React, { useEffect, useState } from 'react'
import './style.less'

const navConfig: Record<'text' | 'link', string>[] = [
  { text: '介绍', link: '/guide' },
  { text: '组件', link: '/components/Button' },
]

const APP = () => {
  const location = useLocation()
  const [activeNav, setActiveNav] = useState<string>('')

  function getActive(link: string, nav: string): string {
    // 特殊处理下 组件 的高亮
    if (link === '/components/Button') {
      return nav.includes('/components') ? 'active' : ''
    }
    return link === nav ? 'active' : ''
  }
  // 设置激活导航
  useEffect(() => {
    setActiveNav(location.pathname)
  }, [location])
  return (
    <div className='navbar'>
      <div className='itemWarp'>
        {navConfig.map((nav, index) => (
          <div
            key={index}
            onClick={() => {
              history.push(nav.link)
            }}
            className={`${getActive(nav.link, activeNav)} navItem`}
          >
            {nav.text}
          </div>
        ))}
      </div>
    </div>
  )
}
export default APP
