import { useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { CanvasRenderer } from './CanvasRenderer'
import { BrushEngine } from '../../core/brush'
import { useCanvasStore } from '../../stores/canvasStore'
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
  const [isReady, setIsReady] = useState(false)

  const { brushSize, brushColor, canvasSize, strokes, addStroke } = useCanvasStore()

  // ブラシサイズと色に応じたカスタムカーソル
  const cursorStyle = useMemo(
    () => createBrushCursor(brushSize, brushColor),
    [brushSize, brushColor]
  )

  // 外部にレンダラーを公開
  useImperativeHandle(ref, () => ({
    getRenderer: () => rendererRef.current,
  }))

  // ブラシエンジンの初期化・更新
  useEffect(() => {
    if (!brushEngineRef.current) {
      brushEngineRef.current = new BrushEngine(brushSize, brushColor)
    } else {
      brushEngineRef.current.setSize(brushSize)
      brushEngineRef.current.setColor(brushColor)
    }
  }, [brushSize, brushColor])

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
    if (!isReady || !isDrawingRef.current) return

    e.preventDefault()

    const engine = brushEngineRef.current
    const renderer = rendererRef.current
    if (!engine || !renderer?.isInitialized) return

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
    />
  )
})
