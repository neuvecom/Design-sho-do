import { useCallback, useState } from 'react'
import { Button, Toast } from '../UI'
import type { CanvasHandle } from '../Canvas'

// 保存アイコン
const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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

  // 作品を保存
  const saveImage = useCallback(async () => {
    const blob = await getImageBlob()
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'design-shodo.png'
    link.click()
    URL.revokeObjectURL(url)

    showToast('作品を保存しました', 'success')
  }, [getImageBlob])

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={saveImage}
        title="作品を保存"
      >
        <SaveIcon />
      </Button>

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
