import { useEffect, useCallback } from 'react'
import { Toolbar } from './Toolbar'

interface ToolbarOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function ToolbarOverlay({ isOpen, onClose }: ToolbarOverlayProps) {
  // ESCキーで閉じる
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // 背景クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className="relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 flex items-center justify-center bg-stone-800 text-white rounded-full shadow-lg hover:bg-stone-700 transition-colors"
          aria-label="閉じる"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        {/* ツールバー本体 */}
        <div className="w-72">
          <Toolbar />
        </div>
      </div>
    </div>
  )
}
