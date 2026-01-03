import { useState, useEffect } from 'react'

const BANNER_DATA = [
  {
    image: '/Design-sho-do/img/banners/nc-block01.png',
    text: '書道の道具を揃えよう',
    link: '/about',
  },
  {
    image: '/Design-sho-do/img/banners/nc-block02.png',
    text: '初心者におすすめの筆',
    link: '/about',
  },
  {
    image: '/Design-sho-do/img/banners/nc-block03.png',
    text: '墨と硯の選び方',
    link: '/about',
  },
  {
    image: '/Design-sho-do/img/banners/nc-block04.png',
    text: '書道を始めてみませんか？',
    link: '/about',
  },
]

interface AffiliateBannerProps {
  sid?: string
  section?: string
}

export function AffiliateBanner({ sid: _sid, section: _section }: AffiliateBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // ランダムな初期インデックス
    setCurrentIndex(Math.floor(Math.random() * BANNER_DATA.length))
  }, [])

  // 10秒ごとに画像を切り替え
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNER_DATA.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const currentBanner = BANNER_DATA[currentIndex]

  return (
    <div className="flex flex-col items-center gap-2">
      <a href={currentBanner.link} className="block">
        <img
          src={currentBanner.image}
          alt={currentBanner.text}
          className="max-w-full h-auto rounded transition-opacity duration-500 hover:opacity-80"
          style={{ maxHeight: '60px' }}
        />
      </a>
      <p className="text-xs text-stone-500">{currentBanner.text}</p>
    </div>
  )
}
