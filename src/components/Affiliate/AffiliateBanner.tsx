import { useState, useEffect } from 'react'

const BANNER_IMAGES = [
  '/Design-sho-do/img/banners/nc-block01.png',
  '/Design-sho-do/img/banners/nc-block02.png',
  '/Design-sho-do/img/banners/nc-block03.png',
  '/Design-sho-do/img/banners/nc-block04.png',
]

interface AffiliateBannerProps {
  sid?: string
  section?: string
}

export function AffiliateBanner({ sid: _sid, section: _section }: AffiliateBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // ランダムな初期インデックス
    setCurrentIndex(Math.floor(Math.random() * BANNER_IMAGES.length))
  }, [])

  // 10秒ごとに画像を切り替え
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex justify-center">
      <img
        src={BANNER_IMAGES[currentIndex]}
        alt="広告バナー"
        className="max-w-full h-auto rounded transition-opacity duration-500"
        style={{ maxHeight: '60px' }}
      />
    </div>
  )
}
