import { useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { CanvasRenderer } from './CanvasRenderer'
import { BrushEngine } from '../../core/brush'
import { useCanvasStore } from '../../stores/canvasStore'
import { useTemplateStore } from '../../stores/templateStore'
import { createBrushCursor } from '../../utils/cursor'
import type { BrushPoint } from '../../types'

export interface CanvasHandle {
  getRenderer: () => CanvasRenderer | null
}

export const Canvas = forwardRef<CanvasHandle>(function Canvas(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<CanvasRenderer | null>(null)
  const brushEngineRef = useRef<BrushEngine | null>(null)
  const isDrawingRef = useRef(false)
  const isShiftDrawingRef = useRef(false) // Shift+マウス移動描画モード
  const [isReady, setIsReady] = useState(false)

  const { brushSize, brushColor, brushType, canvasSize, strokes, addStroke, showGrid } = useCanvasStore()
  const { isTemplateMode, templateImage, templateChar, templateOpacity } = useTemplateStore()
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  // 8x8グリッドの線を生成
  const gridLines = useMemo(() => {
    if (!showGrid) return null
    const lines = []
    const cellWidth = canvasSize.width / 8
    const cellHeight = canvasSize.height / 8

    // 縦線
    for (let i = 1; i < 8; i++) {
      lines.push(
        <line
          key={`v${i}`}
          x1={cellWidth * i}
          y1={0}
          x2={cellWidth * i}
          y2={canvasSize.height}
          stroke="#d4c4b0"
          strokeWidth={1}
        />
      )
    }
    // 横線
    for (let i = 1; i < 8; i++) {
      lines.push(
        <line
          key={`h${i}`}
          x1={0}
          y1={cellHeight * i}
          x2={canvasSize.width}
          y2={cellHeight * i}
          stroke="#d4c4b0"
          strokeWidth={1}
        />
      )
    }
    return lines
  }, [showGrid, canvasSize.width, canvasSize.height])

  // ブラシサイズと色に応じたカスタムカーソル
  const cursorStyle = useMemo(
    () => createBrushCursor(brushSize, brushColor),
    [brushSize, brushColor]
  )

  // Shiftキーの監視
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false)
        // Shift描画モード中にShiftを離したらストローク終了
        if (isShiftDrawingRef.current) {
          const engine = brushEngineRef.current
          const renderer = rendererRef.current
          if (engine && renderer?.isInitialized) {
            const stroke = engine.endStroke()
            if (stroke) {
              renderer.commitStroke()
              addStroke(stroke)
            }
          }
          isDrawingRef.current = false
          isShiftDrawingRef.current = false
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [addStroke])

  // 外部にレンダラーを公開
  useImperativeHandle(ref, () => ({
    getRenderer: () => rendererRef.current,
  }))

  // ブラシエンジンの初期化・更新
  useEffect(() => {
    if (!brushEngineRef.current) {
      brushEngineRef.current = new BrushEngine(brushSize, brushColor, brushType)
    } else {
      brushEngineRef.current.setSize(brushSize)
      brushEngineRef.current.setColor(brushColor)
      brushEngineRef.current.setBrushType(brushType)
    }
  }, [brushSize, brushColor, brushType])

  // レンダラーの初期化
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new CanvasRenderer()
    rendererRef.current = renderer
    setIsReady(false)

    renderer.init(container, canvasSize.width, canvasSize.height).then(() => {
      setIsReady(true)
    })

    return () => {
      renderer.destroy()
      rendererRef.current = null
      setIsReady(false)
    }
  }, [canvasSize.width, canvasSize.height])

  // ストロークの変更を監視して再描画
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer || !renderer.isInitialized) return

    renderer.renderAllStrokes(strokes)
  }, [strokes])

  // ポインタイベントからBrushPointを生成
  const createBrushPoint = (e: React.PointerEvent): BrushPoint => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const pressure = e.pointerType === 'mouse' ? 0.5 : e.pressure || 0.5

    return { x, y, pressure, timestamp: e.timeStamp }
  }

  // ストローク開始
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isReady) return

    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    isDrawingRef.current = true

    const engine = brushEngineRef.current
    if (!engine) return

    const point = createBrushPoint(e)
    engine.startStroke(point)
  }

  // ストローク継続
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isReady) return

    const engine = brushEngineRef.current
    const renderer = rendererRef.current
    if (!engine || !renderer?.isInitialized) return

    // Shift+マウス移動モード: Shiftが押されていて、まだ描画開始していなければ開始
    if (e.shiftKey && !isDrawingRef.current && !isShiftDrawingRef.current) {
      e.preventDefault()
      isShiftDrawingRef.current = true
      isDrawingRef.current = true
      const point = createBrushPoint(e)
      engine.startStroke(point)
      return
    }

    if (!isDrawingRef.current) return

    e.preventDefault()

    const point = createBrushPoint(e)
    const points = engine.continueStroke(point)
    if (points.length > 0) {
      renderer.drawCurrentStroke(points, engine.getBrush())
    }
  }

  // ストローク終了
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isReady || !isDrawingRef.current) return

    e.preventDefault()
    e.currentTarget.releasePointerCapture(e.pointerId)
    isDrawingRef.current = false
    isShiftDrawingRef.current = false

    const engine = brushEngineRef.current
    const renderer = rendererRef.current
    if (!engine || !renderer?.isInitialized) return

    const stroke = engine.endStroke()
    if (stroke) {
      renderer.commitStroke()
      addStroke(stroke)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-[#fff8f0] shadow-lg rounded-lg overflow-hidden"
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        cursor: cursorStyle,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* お手本画像（背景として表示） */}
      {isTemplateMode && templateImage && (
        <img
          src={templateImage}
          alt="お手本"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          style={{
            opacity: templateOpacity / 100,
            zIndex: 0,
          }}
          draggable={false}
        />
      )}
      {/* お手本文字（毛筆フォントで表示） */}
      {isTemplateMode && templateChar && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            fontFamily: '"Kouzan Mouhitu", serif',
            fontSize: `${Math.min(canvasSize.width, canvasSize.height) * 0.7}px`,
            lineHeight: 1,
            color: '#1a1a1a',
            opacity: templateOpacity / 100,
            zIndex: 0,
          }}
        >
          {templateChar}
        </div>
      )}
      {/* 8x8グリッド */}
      {showGrid && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
        >
          {gridLines}
        </svg>
      )}
      {/* Shiftキーインジケーター */}
      {isShiftPressed && (
        <div
          className="absolute bottom-2 left-2 px-2 py-1 bg-stone-800/80 text-white text-xs rounded flex items-center gap-1 pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <kbd className="px-1.5 py-0.5 bg-stone-600 rounded text-[10px] font-mono">Shift</kbd>
          <span>描画モード</span>
        </div>
      )}
    </div>
  )
})
