import { useCallback, useState } from 'react'
import { Button, Toast } from '../UI'
import { useCanvasStore } from '../../stores/canvasStore'
import type { CanvasHandle } from '../Canvas'

// SVGアイコン
const UndoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 10h10a5 5 0 0 1 0 10H9" />
    <path d="M3 10l4-4" />
    <path d="M3 10l4 4" />
  </svg>
)

const RedoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10H11a5 5 0 0 0 0 10h4" />
    <path d="M21 10l-4-4" />
    <path d="M21 10l-4 4" />
  </svg>
)

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
  </svg>
)

const PaletteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c3.1 0 5.6-2.5 5.6-5.6C22 5.9 17.5 2 12 2z" />
    <circle cx="7.5" cy="11.5" r="1.5" fill="currentColor" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
  </svg>
)

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

interface ActionButtonsProps {
  canvasRef?: React.RefObject<CanvasHandle | null>
  onToggleToolbar?: () => void
}

export function ActionButtons({ canvasRef, onToggleToolbar }: ActionButtonsProps) {
  const { undo, redo, clearCanvas, history, historyIndex, showGrid, toggleGrid } = useCanvasStore()
  const [toast, setToast] = useState<ToastState | null>(null)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
  }

  // 画像のダウンロード
  const handleDownload = useCallback(async () => {
    const renderer = canvasRef?.current?.getRenderer()
    if (!renderer) {
      showToast('キャンバスが初期化されていません', 'error')
      return
    }

    try {
      const blob = await renderer.exportImage()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const filename = `design-shodo-${new Date().toISOString().slice(0, 10)}-${Date.now()}.png`
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      showToast(`画像を保存しました`, 'success')
    } catch (error) {
      console.error('Failed to export image:', error)
      showToast('画像の保存に失敗しました', 'error')
    }
  }, [canvasRef])

  // Xで共有（画像ダウンロード + X投稿画面）
  const handleShareToX = useCallback(async () => {
    const renderer = canvasRef?.current?.getRenderer()
    if (!renderer) {
      showToast('キャンバスが初期化されていません', 'error')
      return
    }

    try {
      // 画像をダウンロード
      const blob = await renderer.exportImage()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'bokusai-bokudo.png'
      link.click()
      URL.revokeObjectURL(url)

      // Xの投稿画面を開く
      const shareUrl = 'https://neuvecom.github.io/Design-sho-do/'
      const text = encodeURIComponent(`墨彩的墨道で作品を作りました！\n${shareUrl}\n#墨彩的墨道`)
      const xUrl = `https://twitter.com/intent/tweet?text=${text}`
      window.open(xUrl, '_blank', 'noopener,noreferrer')

      showToast('画像をダウンロードしました。Xの投稿画面で添付してください', 'info')
    } catch (error) {
      console.error('Failed to share:', error)
      showToast('共有に失敗しました', 'error')
    }
  }, [canvasRef])

  return (
    <>
      <div className="flex gap-1">
        {/* ツール設定ボタン */}
        {onToggleToolbar && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleToolbar}
              title="ツール設定"
            >
              <PaletteIcon />
            </Button>
            <div className="w-px h-5 bg-stone-200 mx-1" />
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="元に戻す (⌘Z)"
        >
          <UndoIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="やり直し (⌘Y)"
        >
          <RedoIcon />
        </Button>
        <div className="w-px h-5 bg-stone-200 mx-1" />
        <Button
          variant={showGrid ? "primary" : "ghost"}
          size="sm"
          onClick={toggleGrid}
          title="グリッド"
        >
          <GridIcon />
        </Button>
        <div className="w-px h-5 bg-stone-200 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCanvas}
          title="すべて消去"
        >
          <TrashIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          title="画像をダウンロード"
        >
          <DownloadIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShareToX}
          title="Xで共有"
        >
          <XIcon />
        </Button>
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
