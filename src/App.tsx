import { useRef, useEffect } from 'react'
import { Canvas, type CanvasHandle } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import { useCanvasStore } from './stores/canvasStore'

function App() {
  const canvasRef = useRef<CanvasHandle>(null)
  const { undo, redo } = useCanvasStore()

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
    <div className="min-h-screen bg-[#f5f5f0] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            デザイン書道
          </h1>
          <p className="text-gray-600">
            Webで手軽にデザイン書道を楽しもう
          </p>
        </header>

        {/* メインコンテンツ */}
        <main className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* ツールバー */}
          <aside className="w-full lg:w-64 order-2 lg:order-1">
            <Toolbar canvasRef={canvasRef} />
          </aside>

          {/* キャンバス */}
          <div className="order-1 lg:order-2 flex justify-center">
            <Canvas ref={canvasRef} />
          </div>
        </main>

        {/* フッター */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>マウス、タッチ、ペンで描画できます</p>
          <p className="mt-1">
            ショートカット: Ctrl+Z (元に戻す) / Ctrl+Y (やり直し)
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
