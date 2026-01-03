import { useState, useEffect, useCallback } from 'react'
import { Button, Toast } from '../UI'
import { artworkStorage } from '../../core/storage'
import type { SavedArtwork } from '../../core/storage'
import type { CanvasHandle } from '../Canvas'
import { useCanvasStore } from '../../stores/canvasStore'
import { generateId } from '../../utils/math'

// アイコン
const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const NewIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

interface ArtworkListProps {
  canvasRef?: React.RefObject<CanvasHandle | null>
}

export function ArtworkList({ canvasRef }: ArtworkListProps) {
  const [artworks, setArtworks] = useState<SavedArtwork[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [currentArtworkId, setCurrentArtworkId] = useState<string | null>(null)
  const { strokes, clearCanvas } = useCanvasStore()

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
  }

  // 作品一覧を読み込み
  const loadArtworks = useCallback(async () => {
    try {
      const list = await artworkStorage.getAll()
      setArtworks(list)
    } catch (error) {
      console.error('Failed to load artworks:', error)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadArtworks()
    }
  }, [isOpen, loadArtworks])

  // サムネイルを生成
  const generateThumbnail = async (): Promise<Blob | null> => {
    const renderer = canvasRef?.current?.getRenderer()
    if (!renderer) return null

    try {
      return await renderer.exportImage()
    } catch {
      return null
    }
  }

  // 現在の作品を保存
  const handleSave = useCallback(async () => {
    if (strokes.length === 0) {
      showToast('保存するストロークがありません', 'info')
      return
    }

    const thumbnail = await generateThumbnail()
    if (!thumbnail) {
      showToast('サムネイルの生成に失敗しました', 'error')
      return
    }

    const now = Date.now()
    const artwork: SavedArtwork = {
      id: currentArtworkId || generateId(),
      name: `作品 ${new Date().toLocaleDateString('ja-JP')}`,
      strokes: strokes,
      thumbnail,
      createdAt: currentArtworkId ? (artworks.find(a => a.id === currentArtworkId)?.createdAt || now) : now,
      updatedAt: now,
    }

    try {
      await artworkStorage.save(artwork)
      setCurrentArtworkId(artwork.id)
      await loadArtworks()
      showToast(currentArtworkId ? '上書き保存しました' : '新規保存しました', 'success')
    } catch (error) {
      console.error('Failed to save:', error)
      showToast('保存に失敗しました', 'error')
    }
  }, [strokes, currentArtworkId, artworks, loadArtworks])

  // 作品を読み込み
  const handleLoad = useCallback(async (artwork: SavedArtwork) => {
    const { setStrokes, resetHistory } = useCanvasStore.getState()
    setStrokes(artwork.strokes)
    resetHistory(artwork.strokes)
    setCurrentArtworkId(artwork.id)

    // レンダラーに反映
    const renderer = canvasRef?.current?.getRenderer()
    if (renderer) {
      renderer.renderAllStrokes(artwork.strokes)
    }

    setIsOpen(false)
    showToast('作品を読み込みました', 'success')
  }, [canvasRef])

  // 作品を削除
  const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('この作品を削除しますか？')) return

    try {
      await artworkStorage.delete(id)
      if (currentArtworkId === id) {
        setCurrentArtworkId(null)
      }
      await loadArtworks()
      showToast('作品を削除しました', 'success')
    } catch (error) {
      console.error('Failed to delete:', error)
      showToast('削除に失敗しました', 'error')
    }
  }, [currentArtworkId, loadArtworks])

  // 新規作成
  const handleNew = useCallback(() => {
    if (strokes.length > 0) {
      if (!confirm('現在の作品は保存されていません。新規作成しますか？')) return
    }
    clearCanvas()
    setCurrentArtworkId(null)
    const renderer = canvasRef?.current?.getRenderer()
    if (renderer) {
      renderer.clear()
    }
    setIsOpen(false)
    showToast('新規作品を開始しました', 'info')
  }, [strokes, clearCanvas, canvasRef])

  // サムネイルURLを生成
  const getThumbnailUrl = (blob: Blob): string => {
    return URL.createObjectURL(blob)
  }

  return (
    <>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          title="保存"
        >
          <SaveIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          title="作品一覧"
        >
          <FolderIcon />
        </Button>
      </div>

      {/* 作品一覧モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* モーダル本体 */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] m-4 flex flex-col">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">保存データ</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNew}
                >
                  <NewIcon />
                  <span className="ml-1">新規作成</span>
                </Button>
                <button
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* 作品リスト */}
            <div className="flex-1 overflow-y-auto p-4">
              {artworks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  保存された作品はありません
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {artworks.map((artwork) => (
                    <div
                      key={artwork.id}
                      className={`relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                        currentArtworkId === artwork.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleLoad(artwork)}
                    >
                      {/* サムネイル */}
                      <div className="aspect-square bg-gray-50">
                        <img
                          src={getThumbnailUrl(artwork.thumbnail)}
                          alt={artwork.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 情報 */}
                      <div className="p-2 bg-white">
                        <div className="text-sm font-medium truncate">
                          {artwork.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(artwork.updatedAt).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {/* 削除ボタン */}
                      <button
                        className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDelete(artwork.id, e)}
                        title="削除"
                      >
                        <TrashIcon />
                      </button>

                      {/* 現在編集中マーク */}
                      {currentArtworkId === artwork.id && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                          編集中
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
