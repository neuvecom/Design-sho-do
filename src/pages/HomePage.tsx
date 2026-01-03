import { useRef, useEffect, useState } from 'react'
import { Canvas, type CanvasHandle } from '../components/Canvas'
import { ToolbarOverlay, ActionButtons } from '../components/Toolbar'
import { ArtworkList } from '../components/ArtworkList'
import { Footer } from '../components/Footer'
import { useCanvasStore } from '../stores/canvasStore'

export function HomePage() {
  const canvasRef = useRef<CanvasHandle>(null)
  const { undo, redo } = useCanvasStore()
  const [isToolbarOpen, setIsToolbarOpen] = useState(false)

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z または Cmd+Z で Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Ctrl+Y または Cmd+Shift+Z で Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-amber-50/30 py-4 px-4">
      <div className="max-w-6xl mx-auto relative">
        {/* ヘッダー */}
        <header className="text-center mb-4">
          <div className="inline-block">
            <h1 className="text-4xl md:text-6xl font-black tracking-wider text-stone-800 mb-1" style={{ fontFamily: '"Kouzan Mouhitu", serif' }}>
              墨彩的墨道
            </h1>
            <div className="h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent" />
          </div>
          <p className="text-stone-500 mt-2 text-sm tracking-wide">
            心を込めて、一筆一筆
            <span className="ml-3 text-xs text-stone-400">v1.0.0</span>
          </p>
        </header>

        {/* メインコンテンツ */}
        <main className="flex flex-col items-center gap-3">
          {/* キャンバスエリア */}
          <div className="flex flex-col items-center gap-3">
            {/* アクションバー（キャンバス上部） */}
            <div className="bg-gradient-to-r from-white to-stone-50/80 rounded-lg shadow-md shadow-stone-200/50 border border-stone-200/60 py-2 px-4 flex items-center gap-1">
              <ArtworkList canvasRef={canvasRef} />
              <ActionButtons
                canvasRef={canvasRef}
                onToggleToolbar={() => setIsToolbarOpen(!isToolbarOpen)}
              />
            </div>

            {/* キャンバス */}
            <div className="relative">
              {/* キャンバスの装飾フレーム */}
              <div className="absolute -inset-3 bg-gradient-to-br from-stone-200/50 via-stone-100/30 to-amber-100/50 rounded-lg blur-sm" />
              <div className="absolute -inset-2 border border-stone-300/50 rounded-lg" />
              <div className="relative">
                <Canvas ref={canvasRef} />
              </div>
            </div>
          </div>
        </main>

        {/* フッター */}
        <Footer />

        {/* ツールバーオーバーレイ */}
        <ToolbarOverlay isOpen={isToolbarOpen} onClose={() => setIsToolbarOpen(false)} />
      </div>
    </div>
  )
}
