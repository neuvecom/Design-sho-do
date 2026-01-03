import { useEffect, useRef } from 'react'
import '../../lib/neuvecom-common/css/affiliate.css'

// グローバル型定義
declare global {
  interface Window {
    NeuvecomAffiliateBanner: new (config: AffiliateBannerConfig) => AffiliateBannerInstance
  }
}

interface AffiliateBannerConfig {
  sid: string
  configPath?: string
  storageKeyPrefix?: string
  fallbackImagesPath?: string
}

interface AffiliateBannerInstance {
  render: (container: HTMLElement, section?: string) => void
  destroy: () => void
}

interface AffiliateBannerProps {
  sid: string
  section?: string
  configPath?: string
  storageKeyPrefix?: string
  fallbackImagesPath?: string
}

export function AffiliateBanner({
  sid,
  section = 'header',
  configPath = '/Design-sho-do/data/affiliates.yaml',
  storageKeyPrefix = 'design-shodo',
  fallbackImagesPath = '/Design-sho-do/img/banners/',
}: AffiliateBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<AffiliateBannerInstance | null>(null)

  useEffect(() => {
    // affiliate-lite.jsを動的に読み込む
    const loadScript = async () => {
      if (!window.NeuvecomAffiliateBanner) {
        const script = document.createElement('script')
        script.src = '/Design-sho-do/lib/neuvecom-common/js/affiliate-lite.js'
        script.async = true

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load affiliate script'))
          document.head.appendChild(script)
        })
      }

      if (containerRef.current && window.NeuvecomAffiliateBanner) {
        bannerRef.current = new window.NeuvecomAffiliateBanner({
          sid,
          configPath,
          storageKeyPrefix,
          fallbackImagesPath,
        })
        bannerRef.current.render(containerRef.current, section)
      }
    }

    loadScript().catch(console.error)

    return () => {
      if (bannerRef.current) {
        bannerRef.current.destroy()
        bannerRef.current = null
      }
    }
  }, [sid, section, configPath, storageKeyPrefix, fallbackImagesPath])

  return <div ref={containerRef} className="affiliate-banner-area" />
}
