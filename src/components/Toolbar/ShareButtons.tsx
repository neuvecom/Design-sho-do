import { useCallback, useState } from 'react'
import { Button, Toast } from '../UI'
import type { CanvasHandle } from '../Canvas'

// SNSアイコン
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

interface ShareButtonsProps {
  canvasRef?: React.RefObject<CanvasHandle | null>
}

export function ShareButtons({ canvasRef }: ShareButtonsProps) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
  }

  // 画像をBlobとして取得
  const getImageBlob = useCallback(async (): Promise<Blob | null> => {
    const renderer = canvasRef?.current?.getRenderer()
    if (!renderer) {
      showToast('キャンバスが初期化されていません', 'error')
      return null
    }
    try {
      return await renderer.exportImage()
    } catch (error) {
      console.error('Failed to export image:', error)
      showToast('画像の取得に失敗しました', 'error')
      return null
    }
  }, [canvasRef])

  // X（Twitter）で共有
  const shareToX = useCallback(async () => {
    const blob = await getImageBlob()
    if (!blob) return

    // Web Share APIが使える場合はそれを使用
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], 'design-shodo.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'デザイン書道',
            text: 'デザイン書道で作品を作りました！ #デザイン書道 #書道',
          })
          showToast('共有しました', 'success')
          setShowMenu(false)
          return
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error)
        }
      }
    }

    // フォールバック: 画像をダウンロードしてXを開く
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'design-shodo.png'
    link.click()
    URL.revokeObjectURL(url)

    // Xの投稿画面を開く
    const text = encodeURIComponent('デザイン書道で作品を作りました！ #デザイン書道 #書道')
    const xUrl = `https://twitter.com/intent/tweet?text=${text}`
    window.open(xUrl, '_blank', 'noopener,noreferrer')

    showToast('画像をダウンロードしました。Xで投稿してください', 'info')
    setShowMenu(false)
  }, [getImageBlob])

  // Instagramで共有（ダウンロード + 案内）
  const shareToInstagram = useCallback(async () => {
    const blob = await getImageBlob()
    if (!blob) return

    // Web Share APIが使える場合
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], 'design-shodo.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'デザイン書道',
            text: 'デザイン書道で作品を作りました！',
          })
          showToast('共有しました', 'success')
          setShowMenu(false)
          return
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error)
        }
      }
    }

    // フォールバック: 画像をダウンロード
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'design-shodo.png'
    link.click()
    URL.revokeObjectURL(url)

    showToast('画像をダウンロードしました。Instagramアプリから投稿してください', 'info')
    setShowMenu(false)
  }, [getImageBlob])

  // クリップボードにコピー
  const copyToClipboard = useCallback(async () => {
    const blob = await getImageBlob()
    if (!blob) return

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ])
      showToast('画像をクリップボードにコピーしました', 'success')
      setShowMenu(false)
    } catch (error) {
      console.error('Clipboard write failed:', error)
      // フォールバック: ダウンロード
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'design-shodo.png'
      link.click()
      URL.revokeObjectURL(url)
      showToast('クリップボードへのコピーに失敗しました。画像をダウンロードしました', 'info')
      setShowMenu(false)
    }
  }, [getImageBlob])

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          title="共有"
        >
          <ShareIcon />
        </Button>

        {/* 共有メニュー */}
        {showMenu && (
          <>
            {/* オーバーレイ */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            {/* メニュー */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  onClick={shareToX}
                >
                  <XIcon />
                  X（Twitter）で共有
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  onClick={shareToInstagram}
                >
                  <InstagramIcon />
                  Instagramで共有
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  onClick={copyToClipboard}
                >
                  <CopyIcon />
                  画像をコピー
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
