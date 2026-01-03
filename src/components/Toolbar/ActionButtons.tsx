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

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

interface ActionButtonsProps {
  canvasRef?: React.RefObject<CanvasHandle | null>
}

export function ActionButtons({ canvasRef }: ActionButtonsProps) {
  const { undo, redo, clearCanvas, history, historyIndex } = useCanvasStore()
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
      showToast(`画像を保存しました: ${filename}`, 'success')
    } catch (error) {
      console.error('Failed to export image:', error)
      showToast('画像の保存に失敗しました', 'error')
    }
  }, [canvasRef])

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="元に戻す (Ctrl+Z)"
        >
          <UndoIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="やり直し (Ctrl+Y)"
        >
          <RedoIcon />
        </Button>
        <div className="w-px bg-gray-200 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCanvas}
          title="すべて消去"
        >
          <TrashIcon />
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleDownload}
          title="画像を保存"
        >
          <DownloadIcon />
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
