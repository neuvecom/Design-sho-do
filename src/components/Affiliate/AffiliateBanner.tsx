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

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

export function AffiliateBanner({
  sid,
  section = 'header',
  configPath,
  storageKeyPrefix = 'design-shodo',
  fallbackImagesPath,
}: AffiliateBannerProps) {
  // ベースパスを含むデフォルト値
  const resolvedConfigPath = configPath || `${BASE_PATH}/data/affiliates.yaml`
  const resolvedFallbackImagesPath = fallbackImagesPath || `${BASE_PATH}/img/banners/`
  const containerRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<AffiliateBannerInstance | null>(null)

  useEffect(() => {
    // affiliate-lite.jsを動的に読み込む
    const loadScript = async () => {
      if (!window.NeuvecomAffiliateBanner) {
        const script = document.createElement('script')
        // Viteのbase設定を使用（import.meta.env.BASE_URL）
        script.src = `${import.meta.env.BASE_URL}lib/neuvecom-common/js/affiliate-lite.js`
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
          configPath: resolvedConfigPath,
          storageKeyPrefix,
          fallbackImagesPath: resolvedFallbackImagesPath,
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
  }, [sid, section, resolvedConfigPath, storageKeyPrefix, resolvedFallbackImagesPath])

  return <div ref={containerRef} className="affiliate-banner-area" />
}
